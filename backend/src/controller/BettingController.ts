import { Context } from 'koa'
import { KoaController, Get, Controller, Validator, Validate, Post } from 'koa-joi-controllers'
import { routeConfig, z } from 'koa-swagger-decorator'
import { ErrorTypes } from 'lib/error'
import { success, error } from 'lib/response'
import { getBettingList, submitBetting } from 'service'

const Joi = Validator.Joi

@Controller('')
export class BettingController extends KoaController {
  @routeConfig({
    method: 'get',
    path: '/betting',
    summary: 'Get betting data',
    tags: ['Betting'],
    operationId: 'getBetting',
    request: {
        query: z.object({
            id: z.string().optional(),
            address: z.string().optional(),
        }),
    }
  })
  @Validate({
    query: {
      id: Joi.string(),
      address: Joi.string(),
    },
  })
  @Get('/betting')
  async getBettingList(ctx: Context): Promise<void> {
    const bettingList = await getBettingList(ctx.query as any)
    if (bettingList) success(ctx, bettingList)
    else error(ctx, ErrorTypes.NOT_FOUND_ERROR)
  }

  // @routeConfig({
  //   method: 'post',
  //   path: '/betting',
  //   summary: 'Submit a bet',
  //   tags: ['Betting'],
  //   operationId: 'submitBetting',
  //   requestBody: {
  //     description: 'Data needed to submit a bet',
  //     required: true,
  //     content: {
  //       'application/json': {
  //         schema: {
  //           type: 'object',
  //           required: ['id', 'address', 'position', 'egg'],
  //           properties: {
  //             id: { type: 'string' },
  //             address: { type: 'string' },
  //             position: { type: 'number' },
  //             egg: { type: 'number' },
  //           }
  //         }
  //       }
  //     }
  //   }
  // })
  // @Validate({
  //   body: {
  //     id: Joi.string().required(),
  //     address: Joi.string().required(),
  //     position: Joi.number().integer().required(),
  //     egg: Joi.number().integer().min(1).required(),
  //   }
  // })
  // @Post('/betting')
  // async handleBetting(ctx: Context): Promise<void> {
  //   try {
  //     const successFlag = await submitBetting(ctx.request.body)
  //     if (successFlag) success(ctx, { message: 'Bet submitted successfully' })
  //     else throw new Error('Failed to submit bet')
  //   } catch (e) {
  //     error(ctx, e.type || ErrorTypes.API_ERROR, e.message)
  //   }
  // }
}