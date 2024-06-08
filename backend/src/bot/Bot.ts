/* eslint-disable @typescript-eslint/no-unused-vars */
import { getDB } from 'orm'
import { DataSource } from 'typeorm'

export abstract class Bot {
  protected db: DataSource
  protected isRunning: boolean

  constructor() {
    ;[this.db] = getDB()
    this.isRunning = true
  }

  public stop() {
    this.isRunning = false
  }
  
  public async run(): Promise<any> {}
}
