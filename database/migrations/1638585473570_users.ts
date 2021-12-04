import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Users extends BaseSchema {
  protected tableName = 'users'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('name').unique()
      table.string('hashed_password')
      table.string('salt')
      table.enum('role', ['ADMIN', 'NORMAL']).defaultTo('NORMAL')

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())

      table.charset('utf8mb4')
      table.engine('InnoDB')
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
