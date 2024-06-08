export const DUMMY_VOLATILE_COCKIE_PRICE = 1_000_000
export const DUMMY_STABLE_COCKIE_PRICE = 1_000_000
export const DUMMY_EGG_PRICE = 100
export enum CockieType {
    STABLE = 'STABLE',
    VOLATILE = 'VOLATILE',
}

export const API_URL = import.meta.env.VITE_API_URL || 'http://api.cockfight.shop:3000'

