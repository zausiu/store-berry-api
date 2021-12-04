import Hash from '@ioc:Adonis/Core/Hash'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'

export default class UserSeeder extends BaseSeeder {
  public async run() {
    const passwordAdmin = 'admin'
    const saltAdmin = 'jkdfhA##'
    const hashedPasswordAdmin = await Hash.make(passwordAdmin + saltAdmin)
    const passwordFoo = 'bar'
    const saltFoo = 'Z845$~~*'
    const hashedPasswordFoo = await Hash.make(passwordFoo + saltFoo)

    await User.createMany([
      { name: 'admin', hashedPassword: hashedPasswordAdmin, salt: saltAdmin, role: 'ADMIN' },
      { name: 'foo', hashedPassword: hashedPasswordFoo, salt: saltFoo }
    ])
  }
}
