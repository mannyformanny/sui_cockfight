import { UserEntity, getDB } from 'orm'
import { CockieEntity } from 'orm/CockieEntity'

export interface GetUserParam {
  address: string
}

interface GetUserResponse {
  address: string
  egg: number
  cockies: CockieEntity[]
}

export async function getUser(param: GetUserParam): Promise<GetUserResponse> {
  const [db] = getDB()
  const queryRunner = db.createQueryRunner('slave')

  try {
    const user = await queryRunner.manager.createQueryBuilder(UserEntity, 'user')
      .where('user.address = :address', { address: param.address })
      .getOne()

    if (!user) { 
      await db.manager.getRepository(UserEntity).save({
        address: param.address,
        egg: 0,
      })
      return {
        address: param.address,
        egg: 0,
        cockies: [],
      }
    }

    const cockies = await queryRunner.manager.createQueryBuilder(CockieEntity, 'cockie')
      .getMany()

    return {
      address: user.address,
      egg: user.egg,
      cockies,
    }
  } finally {
    await queryRunner.release()
  }
}
