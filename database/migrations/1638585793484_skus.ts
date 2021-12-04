import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Skus extends BaseSchema {
  protected tableName = 'skus'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')  // sku id
      table.string('name')
      table.string('description')
      table.decimal('price')
      table.integer('stock')   // 库存

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())

      table.charset('utf8mb4')
      table.engine('InnoDB')
    })

    // this.schema.alterTable(this.tableName, (table) => {
    //   table.index(['name', 'description'], 'idx_name_desc', {
    //     indexType: 'FULLTEXT'
    //   })   // Don't support ngram parser ...  so i have to run a shell script to get it around after the table is created.
    // })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
