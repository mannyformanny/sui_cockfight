import { BettingEntity, getDB } from "orm"

interface GetBettingListParam {
  id?: string
  address?: string
}
  
  interface GetBettingListResponse {
    bettings: BettingEntity[]
  }
  
  export async function getBettingList(
    param: GetBettingListParam
  ): Promise<GetBettingListResponse> {
    const [db] = getDB()
    const queryRunner = db.createQueryRunner('slave')
    
    const address = param.address
    const id = param.id

    try {
      const qb = queryRunner.manager.createQueryBuilder(
        BettingEntity,
        'betting'
      ).orderBy('betting.id', 'DESC')
    
      if (id) {
        qb.where('betting.id = :id', { id })
      }
      if (address) {
        qb.where('betting.address = :address', { address })
      } 

      const bettings = await qb.getMany()

      if (bettings.length === 0) {
        return {
          bettings: []
        }
      }

      return {
        bettings
      }
    } finally {
      await queryRunner.release()
    }
  }
  