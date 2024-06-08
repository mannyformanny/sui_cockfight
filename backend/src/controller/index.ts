import { KoaController } from 'koa-joi-controllers'
import { BettingController } from './BettingController'
import { MarketController } from './MarketController'
import { UserController } from './UserController'
import { GameController } from './GameController'

const controllers = [
  BettingController,
  MarketController,
  UserController,
  GameController,
]
  .map((prototype) => {
    const controller = new prototype()
    return controller
  })
  .filter(Boolean) as KoaController[]

export default controllers