import { Entity, PrimaryColumn, Column } from 'typeorm'

@Entity('game')
export class GameEntity {
  @PrimaryColumn({ type: 'bigint'})
  id: string

  @Column('text')
  type: string

  @Column('int')
  total_position: number
  
  @Column('int', { nullable: true })
  winner_position: number | null

  @Column({ type: 'bigint' })
  end_time: string

  @Column('bool')
  is_ended: boolean
}