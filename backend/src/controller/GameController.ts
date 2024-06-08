import { Context } from 'koa'
import { KoaController, Get, Controller, Validator, Validate } from 'koa-joi-controllers'
import { routeConfig, z } from 'koa-swagger-decorator'
import { ErrorTypes } from 'lib/error'
import { success, error } from 'lib/response'
import { getGameList } from 'service'

const Joi = Validator.Joi

@Controller('')
export class GameController extends KoaController {
  @routeConfig({
    method: 'get',
    path: '/game',
    summary: 'Get game data',
    tags: ['Game'],
    operationId: 'getGame',
    request: {
        query: z.object({
            id: z.string().optional(),
            type: z.string().optional(),
        }),
    }
  })
  @Validate({
    query: {
      id: Joi.string(),
      type: Joi.string(),
    },
  })
  @Get('/game')
  async getGameList(ctx: Context): Promise<void> {
    const games = await getGameList(ctx.query as any)
    if (games) success(ctx, games)
    else error(ctx, ErrorTypes.NOT_FOUND_ERROR)
  }
}