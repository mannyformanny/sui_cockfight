import { APIError, ErrorTypes } from 'lib/error'
import { getDB } from 'orm'
import { CockieEntity } from 'orm/CockieEntity'

interface BurnCockieParam {
  id: string
  address: string
}

export async function burnCockie(param: BurnCockieParam): Promise<boolean> {
  const [db] = getDB()
  const queryRunner = db.createQueryRunner('master')

  try {
    const cockie = await queryRunner.manager.getRepository(CockieEntity).findOne({
      where: {
        id: param.id,
      }
    })

    if (!cockie) throw new APIError(ErrorTypes.NOT_FOUND_ERROR, 'cockie not found')
    if (cockie.owner !== param.address) throw new APIError(ErrorTypes.FORBIDDEN, 'not your cockie')

    await queryRunner.manager.getRepository(CockieEntity).delete(cockie)

    return true
  } finally {
    await queryRunner.release()
  }
}
