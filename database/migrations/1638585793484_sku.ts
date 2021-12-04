import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Skus extends BaseSchema {
  protected tableName = 'sku'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')  // sku id
      table.string('name')
      table.string('description')
      table.decimal('price')
      table.integer('stock')   // 库存

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
