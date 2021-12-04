import Hash from '@ioc:Adonis/Core/Hash'
import { BaseModel, beforeSave, column } from '@ioc:Adonis/Lucid/Orm'

export default class User extends BaseModel {
  public static table = 'user'

  @column({ isPrimary: true })
  public id: number

  @column()
  public name: string

  @column({ serializeAs: null })
  public hashedPassword: string

  @column({ serializeAs: null })
  public salt: string

  @column()
  public role: string

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.hashedPassword || user.$dirty.salt) {
      user.hashedPassword = await Hash.make(user.hashedPassword + user.salt)
    }
  }
}
