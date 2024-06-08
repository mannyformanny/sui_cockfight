module deployer::vip_weight_vote {
    use std::bcs;
    use std::error;
    use std::signer;
    use std::hash::sha3_256;
    use std::vector;
    use std::string::{Self, String};
    use std::option::{Self, Option};

    use initia_std::block::get_block_info;
    use initia_std::cosmos;
    use initia_std::decimal128::{Self, Decimal128};
    use initia_std::event;
    use initia_std::from_bcs;
    use initia_std::fungible_asset::Metadata;
    use initia_std::primary_fungible_store;
    use initia_std::object::{Self, Object};
    use initia_std::table::{Self, Table};
    use initia_std::table_key;

    use initia_std::vip;

    //
    // Errors
    //

    const EMODULE_STORE_ALREADY_EXISTS: u64 = 1;
    const EINVALID_MERKLE_PROOFS: u64 = 2;
    const EINVALID_PROOF_LENGTH: u64 = 3;
    const EGAME_NOT_FOUND: u64 = 4;
    const EALREADY_VOTE: u64 = 5;
    const EVECTOR_LENGTH: u64 = 6;
    const EWEIGHT_SUM: u64 = 7;
    const EVOTING_END: u64 = 8;
    const EVOTING_NOT_END: u64 = 9;
    const ESTAGE_NOT_END: u64 = 10;
    const EUNAUTHORIZED: u64 = 11;
    const EINVALID_PROPOSAL_TYPE: u64 = 12;
    const ECANNOT_CREATE_CHALLENGE_PROPOSAL: u64 = 13;
    const ENOT_OPTION: u64 = 14;
    const EPROPOSAL_NOT_FOUND: u64 = 15;
    const EVOTE_NOT_FOUND : u64 = 16;
    const EPROPOSAL_IN_PROGRESS: u64 = 17;
    const EPROPOSAL_ALREADY_EXECUTED: u64 = 18;
    const EINVALID_RATIO: u64 = 19;
    const EBRIDGE_NOT_FOUND: u64 = 20;

    //
    //  Constants
    //

    const PROOF_LENGTH: u64 = 32;

    struct ModuleStore has key {
        // betting
        bettings: Table<vector<u8> /* game id */, Betting>,
    }

    struct Betting has store {
        merkle_root: vector<u8>,
        claimed_addresses: vector<address>,
    }

    // events

    // initialize function

    public entry fun initialize(
        deployer: &signer,
    ) {
        assert!(signer::address_of(deployer) == @deployer, error::permission_denied(EUNAUTHORIZED));
        assert!(!exists<ModuleStore>(@initia_std), error::already_exists(EMODULE_STORE_ALREADY_EXISTS));
        let object = object::create_named_object(deployer, b"betting", false);
        let extend_ref = object::generate_extend_ref(&object);
        move_to(deployer, ModuleStore {
            bettings: table::new(),
        })
    }

    //
    // entry functions
    //

    public entry fun submit_merkle_root(
        deployer: &signer,
        merkle_root: vector<u8>,
        game_id: u64,
    ) acquires ModuleStore {
        let module_store = borrow_global_mut<ModuleStore>(@initia_std);
        assert!(signer::address_of(deployer) == @deployer, error::permission_denied(EUNAUTHORIZED));

        table::add(&mut module_store.bettings, table_key::encode_u64(game_id), Betting {
            merkle_root,
            claimed_addresses: vector::empty(),
        });
    }

    public entry fun claim(
        account: &signer,
        game_id: u64,
        position: u64,
        merkle_proofs: vector<vector<u8>>,
    ) acquires ModuleStore {
        let addr = signer::address_of(account);
        let module_store = borrow_global_mut<ModuleStore>(@initia_std);

        let game_id_key = table_key::encode_u64(game_id);
        assert!(table::contains(&module_store.bettings, game_id_key), error::not_found(EGAME_NOT_FOUND));

        let target_hash = betting_hash(addr, position);
        let betting = table::borrow(&module_store.bettings, game_id_key);
        assert_merkle_proofs(merkle_proofs, betting.merkle_root, target_hash);

        // TODO: provide reward
    }

    fun betting_hash(
        account_addr: address,
        position: u64,
    ): vector<u8> {
        let data = vector::empty<u8>();
        vector::append(&mut data, bcs::to_bytes(&account_addr));
        vector::append(&mut data, bcs::to_bytes(&position));
        sha3_256(data)
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

    // Compare bytes and return a following result number:
    // 0: equal
    // 1: v1 is greator than v2
    // 2: v1 is less than v2
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

    fun init_metadata(): Object<Metadata> {
        let addr = object::create_object_address(@initia_std, b"uinit");
        object::address_to_object<Metadata>(addr)
    }

    #[test_only]
    use initia_std::block::set_block_info;

    #[test_only]
    use initia_std::coin;

    #[test_only]
    use initia_std::decimal256;

    #[test_only]
    fun create_merkle_tree(addresses: vector<address>, voting_powers: vector<u64>): vector<vector<vector<u8>>> {
        let leaf_count = 2;
        let len = vector::length(&addresses);
        let empty_leaf = betting_hash(@0x0, 0);
        while (leaf_count <= len) {
            leaf_count = leaf_count << 1
        };

        let tree = vector[];
        let leaves = vector[];
        let empty_leaf_count = leaf_count - len;
        let i = 0;
        while (i < len) {
            let addr = *vector::borrow(&addresses, i);
            let vp = *vector::borrow(&voting_powers, i);
            vector::push_back(&mut leaves, betting_hash(addr, vp));
            i = i + 1;
        };

        while (i < empty_leaf_count) {
            vector::push_back(&mut leaves, empty_leaf);
            i = i + 1;
        };

        vector::push_back(&mut tree, leaves);

        while (vector::length(&leaves) > 1) {
            let new_leaves = vector[];
            let len = vector::length(&leaves);
            let i = 0;

            while (i < len) {
                let tmp = vector::empty();
                let left = *vector::borrow(&leaves, i);
                let right = *vector::borrow(&leaves, i + 1);
                let cmp = bytes_cmp(&left, &right);
                if (cmp != 2) {
                    let t = left;
                    left = right;
                    right = t;
                };

                vector::append(&mut tmp, left);
                vector::append(&mut tmp, right);
                let leaf = sha3_256(tmp);
                vector::push_back(&mut new_leaves, leaf);

                i = i + 2;
            };

            vector::push_back(&mut tree, new_leaves);
            leaves = new_leaves;
        };

        return tree
    }

    #[test_only]
    fun get_merkle_root(tree: vector<vector<vector<u8>>>): vector<u8> {
        let len = vector::length(&tree);
        *vector::borrow(vector::borrow(&tree, len - 1), 0)
    }

    #[test_only]
    fun get_proofs(tree: vector<vector<vector<u8>>>, idx: u64): vector<vector<u8>> {
        let len = vector::length(&tree);
        let i = 0;
        let proofs = vector[];
        while (i < len - 1) {
            let leaves = vector::borrow(&tree, i);
            let leaf = if (idx % 2 == 1) {
                *vector::borrow(leaves, idx - 1)
            } else {
                *vector::borrow(leaves, idx + 1)
            };
            vector::push_back(&mut proofs, leaf);
            idx = idx / 2;
            i = i + 1;
        };

        proofs
    }
}