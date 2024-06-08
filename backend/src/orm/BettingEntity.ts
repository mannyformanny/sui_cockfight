import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity('betting')
export class BettingEntity {
  @PrimaryColumn({ type: 'bigint'})
  id: string // game id
  
  @PrimaryColumn('text')
  address: string

  @Column('int')
  egg: number

  @Column('int')
  position: number
}
