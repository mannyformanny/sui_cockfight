import { Context } from 'koa'
import {
  KoaController,
  Get,
  Controller,
  Post,
  Validate,
  Validator,
} from 'koa-joi-controllers'
import { routeConfig, z } from 'koa-swagger-decorator'
import { ErrorTypes } from 'lib/error'
import { success, error } from 'lib/response'
import { getCockieList, burnCockie, mintCockie } from 'service'

const Joi = Validator.Joi

@Controller('')
export class MarketController extends KoaController {
  @routeConfig({
    method: 'get',
    path: '/market/cockie',
    summary: 'Get cockie data',
    tags: ['Market'],
    operationId: 'getCockie',
    request: {
      query: z.object({
        owner: z.string().optional(),
      }),
    },
  })
  @Validate({
    query: {
      owner: Joi.string(),
    },
  })
  @Get('/market/cockie')
  async getMarket(ctx: Context): Promise<void> {
    const cockie = await getCockieList(ctx.param as any)
    if (cockie) success(ctx, cockie)
    else error(ctx, ErrorTypes.NOT_FOUND_ERROR)
  }

  @routeConfig({
    method: 'post',
    path: '/market/mint',
    summary: 'mint cockie',
    tags: ['Market'],
    operationId: 'mintCockie',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              address: {
                type: 'string',
                description: 'The address of the user',
              },
              type: {
                type: 'string',
                description: 'The type of the cockie',
              },
              base_coin: {
                type: 'string',
                description: 'The base coin of the cockie',
              },
              decimal: {
                type: 'number',
                description: 'The decimal of the cockie',
              }
            },
            required: ['address', 'type', 'base_coin', 'decimal'],
          },
        },
      },
    },
  })
  @Post('/market/mint')
  // @Validate({
  //   body: {
  //     id: Joi.string().required(),
  //     address: Joi.string().required(),
  //     type: Joi.string().required(),
  //     base_coin: Joi.string().required(),
  //     decimal: Joi.number().required(),
  //   },
  // })
  async mintCockie(ctx: Context): Promise<void> {
    success(ctx, await mintCockie(ctx.request.body as any))
  }

  @routeConfig({
    method: 'post',
    path: '/market/burn',
    summary: 'brun cockie',
    tags: ['Market'],
    operationId: 'burnCockie',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'The id of the cockie',
              },
              address: {
                type: 'string',
                description: 'The address of the user',
              }
            },
            required: ['id', 'address'],
          },
        },
      },
    },
  })
  @Post('/market/burn')
  // @Validate({
  //   body: {
  //     id: Joi.string().required(),
  //     address: Joi.string().required(),
  //   },
  // })
  async burnCockie(ctx: Context): Promise<void> {
    success(ctx, await burnCockie(ctx.request.body as any))
  }
}
