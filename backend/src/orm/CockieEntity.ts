import { Column, Entity, Index, PrimaryColumn } from 'typeorm'

@Entity('cockie')
export class CockieEntity {
  @PrimaryColumn({ type: 'bigint' })
  id: string

  @Column('text')
  @Index('cockie_owner_idx')
  owner: string

  @Column('text')
  type: string

  @Column('text')
  @Index('cockie_base_coin_idx')
  base_coin: string

  @Column('int')
  decimal: number

  // egg price will be (cockie price) / 10^6
  // price is the amount of base_coin, not usdt price
  @Column({ type: 'bigint' })
  price: string  

  // apy = 0.2 = 20%
  @Column('float')
  apy: number
  
  @Column({ type: 'bigint'})
  last_yield_time: string

  @Column({ type: 'bigint' })
  release_time: string

  @Column({ type: 'bigint' })
  create_time: string
}
