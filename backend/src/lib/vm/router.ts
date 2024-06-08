interface CockieInfo {
    price: number
    apy: number
    instant_yield: number
    release_time: number
  }
  
export enum CockieType {
    STABLE = 'STABLE',
    VOLATILE = 'VOLATILE',
}
  export async function getCockieInfo(
    type: string,
    base_coin: string,
    create_time: number
  ): Promise<CockieInfo> {
    if (type === CockieType.STABLE) {
      return {
        price: 1_000_000,
        apy: 0.06,
        instant_yield: 600,
        release_time: create_time + 1_000,
      }
    } else if (type === CockieType.VOLATILE) {
      return {
        price: 1_000_000,
        apy: 0.2,
        instant_yield: 2000,
        release_time: create_time + 1_000,
      }
    }
    throw new Error('invalid cockie type')
  }