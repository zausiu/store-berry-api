import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class Antidups extends BaseSchema {
  protected tableName = 'antidup'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.integer('order_id').unsigned()
      table.integer('sku_id').unsigned()
      table.primary(['order_id', 'sku_id'])

      table.charset('utf8mb4')
      table.engine('InnoDB')
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
