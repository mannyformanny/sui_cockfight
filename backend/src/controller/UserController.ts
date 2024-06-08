import { Context } from 'koa'
import { KoaController, Get, Controller, Validator, Validate } from 'koa-joi-controllers'
import { routeConfig, z } from 'koa-swagger-decorator'
import { ErrorTypes } from 'lib/error'
import { success, error } from 'lib/response'
import { getUser } from 'service/User'

const Joi = Validator.Joi

@Controller('')
export class UserController extends KoaController {
  @routeConfig({
    method: 'get',
    path: '/user',
    summary: 'Get user data',
    tags: ['User'],
    operationId: 'getUser',
    request: {
      query: z.object({
        address: z.string(),
      }),
    },
  })
  @Validate({
    query: {
      address: Joi.string().required(),
    },
  })
  @Get('/user')
  async getUsers(ctx: Context): Promise<void> {
    const user = await getUser(ctx.query as any)
    if (user) success(ctx, user)
    else error(ctx, ErrorTypes.NOT_FOUND_ERROR)
  }
}
