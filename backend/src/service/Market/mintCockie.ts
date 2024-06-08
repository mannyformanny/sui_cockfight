import { getCockieInfo } from 'lib/vm/router'
import { getDB, UserEntity } from 'orm'
import { CockieEntity } from 'orm/CockieEntity'

interface MintCockieParam {
  address: string
  type: string
  base_coin: string
  decimal: number
}

export async function mintCockie(param: MintCockieParam): Promise<boolean> {
  const [db] = getDB()
  const queryRunner = db.createQueryRunner('master')

  const address = param.address

  try {
    const createTime = new Date().getTime()
    const { price, apy, instant_yield, release_time } = await getCockieInfo(
      param.type,
      param.base_coin,
      createTime
    )
    let id = 1
    const latestCockie = await queryRunner.manager.getRepository(CockieEntity).find({
      order: {
        id: 'DESC',
      },
      take: 1,
    })
    if (latestCockie.length > 0) {
      id = Number(latestCockie[0].id) + 1
    }
    const cockieEntity: CockieEntity = {
      id: id.toString(),
      owner: address,
      type: param.type,
      base_coin: param.base_coin,
      decimal: param.decimal,
      price: price.toString(),
      apy,
      last_yield_time: createTime.toString(),
      release_time: release_time.toString(),
      create_time: createTime.toString(),
    }

    await queryRunner.manager.getRepository(CockieEntity).save(cockieEntity)

    // save if not exist, update if exist
    const user = await queryRunner.manager.getRepository(UserEntity).findOne({
      where: {
        address,
      },
    })

    if (!user) {
      await queryRunner.manager.getRepository(UserEntity).save({
        address,
        egg: instant_yield,
      })
    } else {
      await queryRunner.manager.getRepository(UserEntity).update(
        {
          address,
        },
        {
          egg: user.egg + instant_yield,
        }
      )
    }

    return true
  } finally {
    await queryRunner.release()
  }
}
