import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Users extends BaseSchema {
  protected tableName = 'user'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('name')
      table.enum('role', ['ADMIN', 'NORMAL']).defaultTo('NORMAL')

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })

      table.charset('utf8mb4')
      table.engine('InnoDB')
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
