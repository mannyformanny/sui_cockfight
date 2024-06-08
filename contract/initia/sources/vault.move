module deployer::vault {
    use std::error;
    use std::signer;
    use std::string::{Self};

    use initia_std::object::{Self, Object, ExtendRef};
    use initia_std::primary_fungible_store;
    use initia_std::fungible_asset::{Metadata};
    use initia_std::coin;

    //
    // Errors
    //
    
    const EINVALID_AMOUNT: u64 = 1;
    const EUNAUTHORIZED: u64 = 2;

    //
    // Constants
    //

    const VAULT_PREFIX: u8  = 0xf1;
    const REWARD_SYMBOL: vector<u8> = b"uinit";

    //
    // Resources
    //

    struct Vault has key {
        extend_ref: ExtendRef,
        vault_store_addr: address,
    }

    //
    // Implementations
    //

    fun reward_metadata(): Object<Metadata> {
        coin::metadata(@initia_std, string::utf8(REWARD_SYMBOL))
    }

    fun check_permission(deployer: &signer) {
        assert!(signer::address_of(deployer) == @deployer, error::permission_denied(EUNAUTHORIZED));
    }
    
    fun generate_vault_store_seed(): vector<u8> {
        let seed = vector[VAULT_PREFIX];
        return seed
    }

    fun create_vault(deployer: &signer) {
        check_permission(deployer);
        let seed = generate_vault_store_seed();
        let vault_store_addr = object::create_object_address(signer::address_of(deployer), seed);

        let vault_constructor_ref = &object::create_named_object(deployer, seed, false);
        let extend_ref = object::generate_extend_ref(vault_constructor_ref);
        move_to(deployer, Vault{
            extend_ref,
            vault_store_addr
        });
    }
    
    //
    // Entry Functions
    //

    public entry fun create_vault_script(deployer: &signer) {
        create_vault(deployer);
    }

    public entry fun deposit_script(
        sender: &signer,
        amount: u64
    ) acquires Vault {
        let vault_store_addr = get_vault_store_address();
        assert!(amount > 0, error::invalid_argument(EINVALID_AMOUNT));
        primary_fungible_store::transfer(sender, reward_metadata(), vault_store_addr, amount);
    }

    public entry fun redeem_script(redeemer: &signer, amount: u64) acquires Vault {
        let vault = borrow_global_mut<Vault>(@deployer);

        let vault_signer = object::generate_signer_for_extending(&vault.extend_ref);
        primary_fungible_store::transfer(&vault_signer, reward_metadata(), signer::address_of(redeemer), amount);
    }

    //
    // View Functions
    //

    #[view]
    public fun balance(): u64 acquires Vault  {
        let vault_store_addr = get_vault_store_address();
        primary_fungible_store::balance(vault_store_addr, reward_metadata())
    }
    
    #[view]
    public fun get_vault_store_address(): address acquires Vault{
        borrow_global<Vault>(@deployer).vault_store_addr
    }
    
    //
    // Tests
    //

    #[test_only]
    use std::option;

    #[test_only]
    use initia_std::coin::{BurnCapability, FreezeCapability, MintCapability};

    #[test_only]
    struct TestCapability has key {
        burn_cap: BurnCapability,
        freeze_cap: FreezeCapability,
        mint_cap: MintCapability,
    } 

    #[test_only]
    fun initialize_coin(
        account: &signer,
        symbol: string::String,
    ): (coin::BurnCapability, coin::FreezeCapability, coin::MintCapability, Object<Metadata>) {
        let (mint_cap, burn_cap, freeze_cap) = coin::initialize(
            account,
            option::none(),
            string::utf8(b""),
            symbol,
            6,
            string::utf8(b""),
            string::utf8(b""),
        );
        let metadata = coin::metadata(signer::address_of(account), symbol);

        (burn_cap, freeze_cap, mint_cap, metadata)
    }
    

    // #[test_only]
    // public fun test_setup(
    //     chain: &signer,
    // ) {
    //     let (burn_cap, freeze_cap, mint_cap, _) = initialize_coin(chain, string::utf8(b"uinit"));
    //     move_to(chain, TestCapability {
    //         burn_cap,
    //         freeze_cap,
    //         mint_cap,
    //     });
    // }

    #[test(chain=@0x1, deployer=@0x3F4C26C0385D22009956EB3A4E8DBD095962485E, user=@0x111)]
    fun test_integration(
        chain: &signer,
        deployer: &signer,
        user: &signer,
    ) acquires Vault {
        primary_fungible_store::init_module_for_test(chain);
        let (_, _, mint_cap, _) = initialize_coin(chain,string::utf8(REWARD_SYMBOL));
        
        coin::mint_to(&mint_cap, signer::address_of(user), 1_000);

        create_vault_script(deployer);

        assert!(coin::balance(signer::address_of(user), reward_metadata()) == 1_000, 0);
        deposit_script(user, 500);
        assert!(coin::balance(signer::address_of(user), reward_metadata()) == 500, 0);
        
        redeem_script(user, 100);
        assert!(coin::balance(signer::address_of(user), reward_metadata()) == 600, 0);
    }
}