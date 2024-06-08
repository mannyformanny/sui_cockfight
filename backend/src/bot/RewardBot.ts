/* eslint-disable @typescript-eslint/no-unused-vars */
import { config } from 'config'
import { UserEntity, YieldPlanEntity, CockieEntity } from 'orm'
import { EntityManager, TableExclusion } from 'typeorm'
import { Bot } from './Bot'
import { delay } from 'bluebird'

const EGG_RATIO = 10 ** 6
const REWARD_FEED_INTERVAL = 10 * 1000

export class RewardBot extends Bot {
  nextFeedTs: number

  async getAllUserCockies(): Promise<CockieEntity[]> {
    return await this.db.getRepository(CockieEntity).find()
  }

  async feedRewards(
    manager: EntityManager,
    cockie: CockieEntity,
  ): Promise<void> {
    const owner = cockie.owner
    const user = await manager.getRepository(UserEntity).findOne({
      where: { address: owner },
    })
    const now = new Date().getTime()
    const rewardTimeSec = (now - Number(cockie.last_yield_time)) / 1_000
    const rewardPerSec = cockie.apy * Number(cockie.price) / (365 * 24 * 3600)
    const eggPrice = Number(cockie.price) / EGG_RATIO
    const rewardEgg = Math.ceil((rewardPerSec * rewardTimeSec) / eggPrice)
    console.log(`[feedRewards] ${owner} ${rewardEgg} eggs`)
    await manager.getRepository(CockieEntity).save({
      ...cockie,
      last_yield_time: now.toString()
    })

    await manager.getRepository(UserEntity).save({
      ...user,
      egg: user ? user.egg + rewardEgg : rewardEgg
    })
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
    console.log(`[RewardBot] process`)
    
    const now = new Date().getTime()
    if (this.nextFeedTs > now) return
    
    const cockies = await this.getAllUserCockies()
    console.log(`[RewardBot] cockies: ${cockies.length}`)
    for (const cockie of cockies) {
      await this.feedRewards(manager, cockie)
    }
    this.nextFeedTs = now + REWARD_FEED_INTERVAL
  }
}
