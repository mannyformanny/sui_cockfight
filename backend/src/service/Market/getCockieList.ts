import { getDB } from 'orm'
import { CockieEntity } from 'orm/CockieEntity'

interface GetCockieListParam {
  owner?: string
}

interface GetCockieListResponse {
  cockies: CockieEntity[]
}

export async function getCockieList(
  param: GetCockieListParam
): Promise<GetCockieListResponse> {
  const [db] = getDB()
  const queryRunner = db.createQueryRunner('slave')
  const owner = param.owner ? param.owner : ''
  try {
    const qb = queryRunner.manager.createQueryBuilder(CockieEntity, 'cockie')

    if (owner) {
      qb.where('cockie.owner = :owner', { owner })
    }

    const cockies = await qb.getMany()

    return {
      cockies,
    }
  } finally {
    await queryRunner.release()
  }
}
