module deployer::cockfight {
    use deployer::managed::MANAGED;
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance, Supply};
    use sui::sui::SUI;

    /// Name of the coin. By convention, this type has the same name as its parent module
    /// and has no fields. The full type of the coin defined by this module will be `COIN<COCKFIGHT>`.
    public struct COCKFIGHT has drop { }

    /// Singleton shared object holding the reserve assets and the capability.
    public struct Reserve has key {
        id: UID,
        /// capability allowing the reserve to mint and burn COCKFIGHT
        total_supply: Supply<COCKFIGHT>,
        /// SUI coins held in the reserve
        sui: Balance<SUI>,
        /// MANAGED coins held in the reserve
        managed: Balance<MANAGED>,
    }

    /// Needed to deposit a 1:1 ratio of SUI and MANAGED for minting, but deposited a different ratio
    const EBadDepositRatio: u64 = 0;

    #[allow(unused_function)]
    fun init(witness: COCKFIGHT, ctx: &mut TxContext) {
        // Get a treasury cap for the coin put it in the reserve
        let total_supply = balance::create_supply<COCKFIGHT>(witness);

        transfer::share_object(Reserve {
            id: object::new(ctx),
            total_supply,
            sui: balance::zero<SUI>(),
            managed: balance::zero<MANAGED>(),
        })
    }

    /// === Writes ===

    /// Mint COCKFIGHT coins by accepting an equal number of SUI and MANAGED coins
    public fun mint(
        reserve: &mut Reserve, sui: Coin<SUI>, managed: Coin<MANAGED>, ctx: &mut TxContext
    ): Coin<COCKFIGHT> {
        let num_sui = coin::value(&sui);
        assert!(num_sui == coin::value(&managed), EBadDepositRatio);

        coin::put(&mut reserve.sui, sui);
        coin::put(&mut reserve.managed, managed);

        let minted_balance = balance::increase_supply(&mut reserve.total_supply, num_sui);

        coin::from_balance(minted_balance, ctx)
    }

    /// Burn COCKFIGHT coins and return the underlying reserve assets
    public fun burn(
        reserve: &mut Reserve, basket: Coin<COCKFIGHT>, ctx: &mut TxContext
    ): (Coin<SUI>, Coin<MANAGED>) {
        let num_basket = balance::decrease_supply(&mut reserve.total_supply, coin::into_balance(basket));
        let sui = coin::take(&mut reserve.sui, num_basket, ctx);
        let managed = coin::take(&mut reserve.managed, num_basket, ctx);

        (sui, managed)
    }

    // === Reads ===

    /// Return the number of `MANAGED` coins in circulation
    public fun total_supply(reserve: &Reserve): u64 {
        balance::supply_value(&reserve.total_supply)
    }

    /// Return the number of SUI in the reserve
    public fun sui_supply(reserve: &Reserve): u64 {
        balance::value(&reserve.sui)
    }

    /// Return the number of MANAGED in the reserve
    public fun managed_supply(reserve: &Reserve): u64 {
        balance::value(&reserve.managed)
    }

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(COCKFIGHT {}, ctx)
    }
}