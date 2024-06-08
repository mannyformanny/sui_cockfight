module deployer::cockfight {
    use std::hash::sha3_256;
    use std::error;
    use std::signer;
    use std::vector;
    use std::event;
    use std::string;

    use initia_std::coin;
    use initia_std::object::{Self, Object, ExtendRef};
    use initia_std::fungible_asset::{ Metadata, FungibleAsset};
    use initia_std::primary_fungible_store;
    use initia_std::table::{Self, Table};
    use initia_std::bcs;

    //
    //  Errors
    //
    const EUNAUTHORIZED :u64 = 1;
    const EMODULE_STORE_ALREADY_EXISTS :u64 = 2;
    const EMODULE_STORE_NOT_FOUND : u64 = 3;
    const EINVALID_PRICE_INITIALIZATION :u64 = 4;
    const EINVALID_TRADE_NUM:u64 = 5;
    const EINVALID_METADATA: u64 = 6;
    const ENOT_FOUND_CHICKENS: u64 = 7;
    const EGAME_ALREADY_EXISTS: u64 = 8;
    const EINVALID_MERKLE_PROOFS: u64 = 9;
    const EINVALID_PROOF_LENGTH: u64 = 10;
    const EINSUFFICIENT_BALANCE: u64 = 11;

    //
    //  Constatns
    //
    const PROOF_LENGTH: u64 = 32;
    const UINIT_SYMBOL: vector<u8> = b"uinit";

    //
    //  Events
    //

    struct BuyCockieEvent has drop, store {
        account: address,
        num: u64,
        total_cockies_num_in_user: u64,
    }

    struct SellCockieEvent has drop, store {
        account: address,
        num: u64,
        total_cockies_num_in_user: u64,
    }

    struct ModuleStore has key {
        extend_ref: ExtendRef,
        total_cockies: u64,
        cockies_price: u64,
        egg_price: u64,
        cockies : Table<address /* user */, u64>,
        eggs: Table<address /* user */, u64>,
        cock_fights: Table<u64 /* game id */, CockFight>
    }
    
    struct CockFight has copy, drop, store {
        prize_amount: u64,
        winner_position: u64,	
        merkle_root: vector<u8> // merkle root (leaf node : hash(addr | position | eggs))
    }

    //
    //  Responses
    //

    struct ModuleResponse has drop {
        total_cockies: u64,
        cockies_price: u64,
        egg_price: u64,
        cockies : address,
        eggs: address,
        cock_fights: address
    }
    
    //
    // Helper functions
    //
    
    public fun uinit_metadata(): Object<Metadata> {
        coin::metadata(@initia_std, string::utf8(UINIT_SYMBOL))
    }

    fun check_operator_permission(operator: &signer) {
        assert!(signer::address_of(operator) == @deployer, error::permission_denied(EUNAUTHORIZED));
    }

    fun generate_module_seed(): vector<u8>{
        let seed = b"cockfight";
        return seed
    }

    //
    // Entry Functions
    //

    public entry fun initialize(
        operator: &signer,
        cockies_price: u64,
        egg_price: u64,
    ) {
        check_operator_permission(operator);
        assert!(!exists<ModuleStore>(@deployer), error::already_exists(EMODULE_STORE_ALREADY_EXISTS));

        let constructor_ref = object::create_named_object(operator, b"cockfight", false);
        let extend_ref = object::generate_extend_ref(&constructor_ref);
        assert!(cockies_price > egg_price && egg_price > 0, error::invalid_argument(EINVALID_PRICE_INITIALIZATION));
        
        let module_store = ModuleStore{
            extend_ref,
            total_cockies: 0,
            cockies_price,
            egg_price,
            cockies: table::new<address,u64>(),
            eggs: table::new<address,u64>(),
            cock_fights: table::new<u64, CockFight>(),
        };

        move_to(operator, module_store);
    }

    public entry fun update_price_script(
        operator: &signer,
        cockies_price: u64,
        egg_price: u64,
    ) acquires ModuleStore {
        check_operator_permission(operator);
        let module_store = borrow_global_mut<ModuleStore>(@deployer);

        assert!(cockies_price > egg_price && egg_price > 0, error::invalid_argument(EINVALID_PRICE_INITIALIZATION));
        module_store.cockies_price = cockies_price;
        module_store.egg_price = egg_price;
    }

    public entry fun fund_prize_script(
        account: &signer,
        amount: u64
    ) {
        let prize = primary_fungible_store::withdraw(account, uinit_metadata(), amount);
        fund_prize(prize);
    }
    
    public entry fun buy_cockies_script(
        account: &signer,
        num: u64
    ) acquires ModuleStore {
        assert!(num > 0, error::invalid_argument(EINVALID_TRADE_NUM));
        buy_cockies(account, uinit_metadata(), num);
    }

    public entry fun sell_cockies_script(
        account: &signer,
        num: u64
    )acquires ModuleStore{
        assert!(num > 0, error::invalid_argument(EINVALID_TRADE_NUM));
        sell_cockies(account, uinit_metadata(), num);
    }

    // public entry fun claim_script(
    //     account: &signer,
    //     game_id: u64,
    //     position: u64
    // ) {

    // }f

    public entry fun set_cock_fight(
        operator: &signer,
        game_id: u64,
        winner_position: u64,
        prize_amount: u64,
        merkle_root: vector<u8>
    ) acquires ModuleStore {
        check_operator_permission(operator);

        let module_store = borrow_global_mut<ModuleStore>(@deployer);
        
        assert!(!table::contains(&mut module_store.cock_fights, game_id), error::already_exists(EGAME_ALREADY_EXISTS));
        let cock_fight = CockFight {
            prize_amount,
            winner_position,	
            merkle_root 
        };
        table::add(&mut module_store.cock_fights, game_id, cock_fight);
    }


    //
    // Implementations
    //

    fun fund_prize(
        prize: FungibleAsset
    ) {
        primary_fungible_store::deposit(@deployer, prize );
    }

    fun buy_cockies(
        account: &signer,
        metadata: Object<Metadata>,
        num: u64,
    ) acquires ModuleStore {
        let module_store = borrow_global_mut<ModuleStore>(@deployer);
        let deposit_amount = module_store.cockies_price * num;
        assert!(coin::balance(signer::address_of(account), metadata) >= deposit_amount, error::invalid_argument(EINSUFFICIENT_BALANCE));

        let module_signer = object::generate_signer_for_extending(&module_store.extend_ref);
        primary_fungible_store::transfer(account, metadata, signer::address_of(&module_signer), deposit_amount);

        module_store.total_cockies = module_store.total_cockies + num;
        
        if (!table::contains(&mut module_store.cockies, signer::address_of(account))){
            table::add(&mut module_store.cockies, signer::address_of(account), 0);
        };
        let cockies = table::borrow_mut(&mut module_store.cockies, signer::address_of(account));

        *cockies = *cockies + num;

        event::emit (
            BuyCockieEvent {
                account: signer::address_of(account),
                num: num,
                total_cockies_num_in_user: *cockies
            }
        )
    }   

    fun sell_cockies(
        account: &signer,
        metadata: Object<Metadata>,
        num: u64,
    ) acquires ModuleStore {
        let module_store = borrow_global_mut<ModuleStore>(@deployer);
        let withdraw_amount = module_store.cockies_price * num;
        let module_signer = object::generate_signer_for_extending(&module_store.extend_ref);

        assert!(coin::balance(signer::address_of(&module_signer), metadata) >= withdraw_amount, error::invalid_argument(EINSUFFICIENT_BALANCE));
        primary_fungible_store::transfer(&module_signer, metadata, signer::address_of(account), withdraw_amount);

        module_store.total_cockies = module_store.total_cockies - num;
        
        assert!(table::contains(&mut module_store.cockies, signer::address_of(account)), error::not_found(ENOT_FOUND_CHICKENS));
        let cockies = table::borrow_mut(&mut module_store.cockies, signer::address_of(account));
        assert!(*cockies >= num, error::invalid_argument(EINVALID_TRADE_NUM));
        *cockies = *cockies - num;

        event::emit (
            SellCockieEvent {
                account: signer::address_of(account),
                num: num,
                total_cockies_num_in_user: *cockies
            },
        );
    }
    
    fun betting_hash(
        account_addr: address,
        position: u64,
        eggs: u64,
    ): vector<u8> {
        let target_hash = {
            let betting_data = vector::empty<u8>();
            vector::append(&mut betting_data, bcs::to_bytes(&@deployer));
            vector::append(&mut betting_data, bcs::to_bytes(&account_addr));
            vector::append(&mut betting_data, bcs::to_bytes(&position));
            vector::append(&mut betting_data, bcs::to_bytes(&eggs));

            sha3_256(betting_data)
        };
        target_hash
    }

    fun bytes_cmp(v1: &vector<u8>, v2: &vector<u8>): u8 {
        assert!(vector::length(v1) == PROOF_LENGTH, error::invalid_argument(EINVALID_PROOF_LENGTH));
        assert!(vector::length(v2) == PROOF_LENGTH, error::invalid_argument(EINVALID_PROOF_LENGTH));

        let i = 0;
        while (i < 32 ) {
            let e1 = *vector::borrow(v1, i);
            let e2 = *vector::borrow(v2, i);
            if (e1 > e2) {
                return 1
            } else if (e2 > e1) {
                return 2
            };
            i = i + 1;
        };

        0
    }

    fun assert_merkle_proofs(
        merkle_proofs: vector<vector<u8>>,
        merkle_root: vector<u8>,
        target_hash: vector<u8>,
    ) {
        // must use sorted merkle tree
        let i = 0;
        let len = vector::length(&merkle_proofs);
        let root_seed = target_hash;
        while (i < len) {
            let proof = vector::borrow(&merkle_proofs, i);
            let cmp = bytes_cmp(&root_seed, proof);
            root_seed = if (cmp == 2 /* less */) {
                let tmp = vector::empty();
                vector::append(&mut tmp, root_seed);
                vector::append(&mut tmp, *proof);

                sha3_256(tmp)
            } else /* greator or equals */ {
                let tmp = vector::empty();
                vector::append(&mut tmp, *proof);
                vector::append(&mut tmp, root_seed);

                sha3_256(tmp)
            };
            
            i = i + 1;
        };

        let root_hash = root_seed;
        assert!(merkle_root == root_hash, error::invalid_argument(EINVALID_MERKLE_PROOFS));
    }

    //
    // View Functions
    //

    #[view]
    public fun get_module_store(): ModuleResponse acquires ModuleStore {
        let module_store = borrow_global<ModuleStore>(@deployer);
        
        ModuleResponse {
            total_cockies: module_store.total_cockies,
            cockies_price: module_store.cockies_price,
            egg_price: module_store.egg_price,
            cockies: table::handle(&module_store.cockies),
            eggs:table::handle(&module_store.eggs),
            cock_fights: table::handle(&module_store.cock_fights)
        }
    }

    #[view]
    public fun get_user_cockies(account: address): u64 acquires ModuleStore {
        let module_store = borrow_global<ModuleStore>(@deployer);
        if (table::contains(&module_store.cockies, account)) {
            *table::borrow(&module_store.cockies, account)
        } else {
            0
        }
    }

    // public fun get_eggs_per_epoch()
    // public fun get_user_cockies(user_addr)
    // public fun get_user_eggs(user_addr)

    //
    // Tests
    //
    #[test_only]
    use std::option;

    #[test_only]
    fun initialized_coin(
        account: &signer,
        symbol: string::String,
    ): (coin::BurnCapability, coin::FreezeCapability, coin::MintCapability) {
        let (mint_cap, burn_cap, freeze_cap, _) = coin::initialize_and_generate_extend_ref (
            account,
            option::none(),
            string::utf8(b""),
            symbol,
            6,
            string::utf8(b""),
            string::utf8(b""),
        );

        return (burn_cap, freeze_cap, mint_cap)
    }

    #[test_only]
    fun test_setup(
        chain: &signer,
        operator: &signer,
        cockie_price: u64,
        egg_price: u64,
    ): (coin::MintCapability, Object<Metadata>) {
        primary_fungible_store::init_module_for_test(chain);

        let (_, _, mint_cap) = initialized_coin(chain, string::utf8(UINIT_SYMBOL));
        let metadata = coin::metadata(signer::address_of(chain), string::utf8(UINIT_SYMBOL));
        initialize(
            operator,
            cockie_price,
            egg_price,
        );
        (mint_cap, metadata)
    }

    #[test(chain=@0x1, operator=@deployer, user=@0x123)]
    fun test_trade_cockies(
        chain: &signer,
        operator: &signer,
        user: &signer,
    ) acquires ModuleStore{
        let cockies_price = 1_000_000;
        let egg_price = 1_000;
        let buy_num = 100;
        let sell_num = 40;
        let (mint_cap, metadata) = test_setup(chain, operator, cockies_price, egg_price);

        coin::mint_to(&mint_cap, signer::address_of(operator), 1_000_000_000);
        coin::mint_to(&mint_cap, signer::address_of(user), 1_000_000_000);
        fund_prize_script(operator,1_000_000_000);
        

        let module_store = get_module_store();
        assert!(module_store.cockies_price == cockies_price, 1);
        assert!(module_store.egg_price == egg_price, 1);
        assert!(module_store.total_cockies == 0, 1);
        assert!(coin::balance(signer::address_of(user), metadata) == 1_000_000_000, 2);
        assert!(get_user_cockies(signer::address_of(user)) == 0, 3);

        buy_cockies_script(user, buy_num);
        
        assert!(coin::balance(signer::address_of(user), metadata) == 1_000_000_000 - (cockies_price * buy_num), 5);
        assert!(get_user_cockies(signer::address_of(user)) == buy_num, 6);

        sell_cockies_script(user, sell_num);
        
        assert!(coin::balance(signer::address_of(user), metadata) == 1_000_000_000 - (cockies_price * (buy_num - sell_num)), 8);
        assert!(get_user_cockies(signer::address_of(user)) == buy_num - sell_num, 9);

        update_price_script(operator, 2_000_000, 2_000);
        
        let module_store = get_module_store();
        assert!(module_store.total_cockies == buy_num - sell_num, 7);
        assert!(module_store.cockies_price == 2_000_000, 10);
        assert!(module_store.egg_price == 2_000, 11);
    }
}