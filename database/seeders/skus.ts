import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Sku from 'App/Models/Sku'

export default class SkuSeeder extends BaseSeeder {
  public async run() {
    await Sku.createMany([
      {
        name: "睡眠枕头",
        description: "只要抱住立即睡着。",
        price: 1234,
        stock: 100
      },
      {
        name: "时空之门",
        description: "可以穿越时空。",
        price: 384,
        stock: 200
      },
      {
        name: "竹蜻蜓",
        description: "机器猫的竹蜻蜓",
        price: 10000,
        stock: 5
      }, {
        name: "太平清领道",
        description: "智力＋100，法术＋300",
        price: 200000,
        stock: 2
      }]
    )
  }
}
