import Hash from '@ioc:Adonis/Core/Hash'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'

export default class UserSeeder extends BaseSeeder {
  public async run() {
    const passwordAdmin = 'admin'
    const saltAdmin = 'jkdfhA##'
    const hashedPasswordAdmin = 'admin'   // Hook beforeSave() will hash the password ~~
    // const hashedPasswordAdmin = await Hash.make(passwordAdmin + saltAdmin)
    // const hashedPasswordAdmin = await Hash.make(passwordAdmin)
    const passwordFoo = 'bar'
    const saltFoo = 'Z845$~~*'
    const hashedPasswordFoo = 'bar'
    // const hashedPasswordFoo = await Hash.make(passwordFoo + saltFoo)
    // const hashedPasswordFoo = await Hash.make(passwordFoo)

    console.log("hashedPasswordAdmin is:", hashedPasswordAdmin)

    await User.createMany([
      { name: 'admin', hashedPassword: hashedPasswordAdmin, salt: saltAdmin, role: 'ADMIN' },
      { name: 'foo', hashedPassword: hashedPasswordFoo, salt: saltFoo }
    ])
  }
}
