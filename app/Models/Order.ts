import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Sku extends BaseModel {
  public static table = 'orders'

  @column({ isPrimary: true })
  public id: number

  @column()
  public sku_id: number

  @column()
  public sku_count: number

  @column()
  public username: string

  @column()
  public state: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}