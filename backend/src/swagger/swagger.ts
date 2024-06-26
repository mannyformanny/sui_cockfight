import { BettingController } from 'controller/BettingController'
import { SwaggerRouter } from 'koa-swagger-decorator'

const router = new SwaggerRouter({
  spec: {
    info: {
      title: 'Cockfight API',
      version: 'v1.0',
    },
  },
  swaggerHtmlEndpoint: '/swagger',
  swaggerJsonEndpoint: '/swagger.json',
})

router.swagger()
router
  .applyRoute(BettingController)
export { router }
