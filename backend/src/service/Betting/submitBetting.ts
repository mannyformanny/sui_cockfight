import { APIError, ErrorTypes } from 'lib/error'
import { BettingEntity, GameEntity, getDB, UserEntity } from 'orm'

interface SubmitBettingParam {
  id: string
  address: string
  position: number
  egg: number
}

export async function submitBetting(
  param: SubmitBettingParam
): Promise<boolean> {
  const [db] = getDB()
  const queryRunner = db.createQueryRunner('slave')

  const id = param.id
  const address = param.address

  try {
    const game = await queryRunner
      .manager
      .getRepository(GameEntity)
      .findOne({
        where: { id },
      })
    
    if (!game) throw new APIError(ErrorTypes.NOT_FOUND_ERROR, 'game not found')
    
    const user = await queryRunner
      .manager
      .getRepository(UserEntity)
      .findOne({
        where: {
          address
        }
      })
    
    if (!user) throw new APIError(ErrorTypes.NOT_FOUND_ERROR, 'user not found')
    if (user.egg < param.egg) throw new APIError(ErrorTypes.FORBIDDEN, 'not enough egg')
    
    const egg = param.egg
    
    await queryRunner
      .manager
      .getRepository(BettingEntity)
      .save({
        address: param.address,
        id,
        position: param.position,
        egg,
      })
    
    await queryRunner
      .manager
      .getRepository(UserEntity)
      .save({
        address: param.address,
        egg: user.egg - egg,
      })
    return true
  } finally {
    await queryRunner.release()
  }
}