import { finalizeORM } from 'orm'
import { Bot } from './Bot'
import { GameBot} from './GameBot'
import { RewardBot } from './RewardBot'

let bots: Bot[] = []

export async function runBot(): Promise<void> {
  bots = [
    // new GameBot(), 
    new RewardBot()
  ]
  try {
    await Promise.all(
      bots.map((bot) => {
        bot.run()
      })
    )
  } catch (err) {
    stopBots()
  }
}

export async function stopBots(): Promise<void> {
  bots.forEach((bot) => bot.stop())
  await finalizeORM()
}
