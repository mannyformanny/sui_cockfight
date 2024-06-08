module deployer::market {
    public struct MARKET has drop { }

    #[allow(unused_function)]
    fun init(_witness: MARKET, _ctx: &mut TxContext) {}

    /// === Writes ===

    public fun mint(_ctx: &mut TxContext) {}
    public fun burn(_ctx: &mut TxContext) {}


    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        init(MARKET {}, ctx)
    }
}