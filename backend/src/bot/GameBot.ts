/* eslint-disable @typescript-eslint/no-unused-vars */
import { BettingEntity, GameEntity, UserEntity } from 'orm'
import { EntityManager } from 'typeorm'
import { Bot } from './Bot'
import { delay } from 'bluebird'
import { config } from 'config'

const GAME_FEED_INTERVAL = 5 * 60 * 1000 // 5 min

export class GameBot extends Bot {
  async getLastGameEntity(manager: EntityManager, type: string): Promise<GameEntity | null> {
    const gameEntity = await manager.getRepository(GameEntity).find({
      order: { id: 'DESC' } as any,
      where: { type },
      take: 1,
    })
    return gameEntity[0] ?? null
  }

  async submitWinnerPosition(
    manager: EntityManager,
    id: string,
  ): Promise<number | null> {
    const game = await manager.getRepository(GameEntity).findOne({
      where: { id },
    })

    if (!game) return null

    const winnerPosition = Math.floor(Math.random() * game.total_position) + 1
    return winnerPosition
  }

  async createGame(manager: EntityManager, id: number, type: string, total_position: number, end_time: number): Promise<void> {
    const game: GameEntity = {
      id: id.toString(),
      type,
      total_position,
      winner_position: null,
      end_time: end_time.toString(),
      is_ended: false,
    }
    await manager.getRepository(GameEntity).save(game)
  }

  async distributeRewards(
    manager: EntityManager,
    id: string,
    winnerPosition: number
  ): Promise<void> {
    const bettings = await manager.getRepository(BettingEntity).find({
      where: { id },
    })
    if (bettings.length === 0) return

    const totalEggs = bettings.reduce((acc, betting) => acc + betting.egg, 0)
    const winnerBettings = bettings.filter(betting => betting.position === winnerPosition)
    
    if (winnerBettings.length === 0) return
    
    const loserEggs = totalEggs - winnerBettings.reduce((acc, betting) => acc + betting.egg, 0)

    for (const betting of winnerBettings) {
      const rewardEgg = (betting.egg + Math.floor(loserEggs/betting.egg)) * (0.9) // 10% will be commission
      await manager.getRepository(UserEntity).save({
        address: betting.address,
        egg: rewardEgg,
      })
    }
  }

  async endGame(manager: EntityManager, type: string): Promise<void> {
    const games = await manager.getRepository(GameEntity).find({
      where: { type, is_ended: false },
    })
    if (games.length === 0) return

    const now = new Date()
    for (const game of games) {
      if (Number(game.end_time) < now.getTime()) {
        // TODO : this should be onchain logic
        const winnerPosition = await this.submitWinnerPosition(
          manager,
          game.id,
        )

        if (!winnerPosition) {
          await manager.getRepository(GameEntity).delete({
            id: game.id,
          })
          continue
        }

        await manager.getRepository(GameEntity).save({
          ...game,
          isEnded: true,
          winnerPosition,
        })

        // give reward for winner
        await this.distributeRewards(manager, game.id, winnerPosition)
      }
    }
  }

  public async run(): Promise<void> {
    while (this.isRunning) {
      try {
        await this.db.transaction(async (manager: EntityManager) => {
          await this.process(manager)
        })
      } catch (err) {
        console.log(err)
        this.stop()
      } finally {
        await delay(config.UPDATE_INTERVAL)
      }
    }
  }

  public async process(manager: EntityManager): Promise<void> {
    await this.createLotteryGame(manager)
  }

  public async createLotteryGame(manager: EntityManager){
    const type = 'lottery'
    const now = new Date().getTime()
    const gameInterval = GAME_FEED_INTERVAL
    const totalPosition = 10000
    
    const lastGameEntity = await this.getLastGameEntity(manager, type)
    if (!lastGameEntity) return await this.createGame(manager, 1, type, totalPosition, now + gameInterval)
    const endTime = Number(lastGameEntity.end_time)
    if (endTime > now) return
    const nextId = Number(lastGameEntity.id) + 1
    await this.endGame(manager, type)
    await this.createGame(manager, nextId, type, totalPosition, endTime + gameInterval)
  }
}
