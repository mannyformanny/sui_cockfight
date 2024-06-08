import { GameEntity, getDB } from 'orm'

export interface GetGameListParam {
  id?: string
  type?: string
}

interface GetGameListResponse {
  games: GameEntity[]
}

export async function getGameList(
  param: GetGameListParam
): Promise<GetGameListResponse> {
  const [db] = getDB()
  const queryRunner = db.createQueryRunner('slave')

  try {
    const qb = queryRunner.manager.createQueryBuilder(GameEntity, 'game')

    if (param.id)
      qb.where('game.id = :id', { id: param.id })

    if (param.type)
        qb.where('game.type = :type', { type: param.type })

    const games = await qb.getMany()
    
    return {
      games,
    }
  } finally {
    await queryRunner.release()
  }
}
