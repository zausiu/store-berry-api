import axios from 'axios'
import { ApplicationContract } from '@ioc:Adonis/Core/Application'


export default class NightWatcher {
  constructor(protected app: ApplicationContract, private running: boolean = false) { }

  public register() {
    // Register your own bindings
  }

  public async boot() {
    // IoC container is ready
    const { default: Order } = await import('App/Models/Order')
    const { default: Database } = await import('@ioc:Adonis/Lucid/Database')
    const { default: Env } = await import('@ioc:Adonis/Core/Env')

    this.Order = Order
    this.Database = Database

    this.WAREHOUSE_SYSTEM_URL = Env.get('WAREHOUSE_SYSTEM', 'http://localhost:3333/warehouse')
    this.LOGISTICS_SYSTEM_URL = Env.get('LOGISTICS_SYSTEM', 'http://localhost:3333/logistics')
  }

  public async ready() {
    // App is ready
    this.running = true
    this.schedulePatrol()
  }

  public async shutdown() {
    // Cleanup, since app is going down
    this.running = false
  }

  private async schedulePatrol() {
    while (this.running) {
      await this.patrol()
      await this.delay(2000)
    }
  }

  private async delay(time) {
    return new Promise(function (resolve) {
      setTimeout(resolve, time)
    })
  }

  private async patrol() {
    try {
      await this.Database.transaction(async (trx) => {
        try {
          const unfinished = await this.Order.query()
            .forUpdate()
            .whereRaw('state = "CONSUMED" and updated_at < subtime(now(), "00:01:00") and (reported2logistics is false or reported2warehouse is false)')

          const notReported2LogisticsOrders = unfinished.filter(x => x.$extras.reported2logistics == 0)
          const notReported2WarehouseOrders = unfinished.filter(x => x.$extras.reported2warehouse == 0)

          if (notReported2LogisticsOrders.length > 0) {
            // 异步通知物流系统
            const info2downstream = notReported2LogisticsOrders.map(x => { return { order_id: x.id, username: x.username } })
            axios.post(this.LOGISTICS_SYSTEM_URL, info2downstream)
              .then(async _ => {
                const orders = notReported2LogisticsOrders.map(x => x.id)
                await this.Order.query().whereIn('id', orders).update({ reported2logistics: true })
                console.log('Logistic System accepted the request.')
              })
              .catch(err => console.log('A error occured while talking to Logistic System', err))
          }

          if (notReported2WarehouseOrders.length > 0) {
            // 异步通知仓库系统
            const info2downstream = notReported2WarehouseOrders.map(x => { return { order_id: x.id, username: x.username } })
            axios.post(this.WAREHOUSE_SYSTEM_URL, info2downstream)
              .then(async _ => {
                const orders = notReported2WarehouseOrders.map(x => x.id)
                await this.Order.query().whereIn('id', orders).update({ reported2warehouse: true })
                console.log('Warehouse System accepted the request.')
              })
              .catch(err => console.log('A error occured while talking to Warehouse System', err))
          }

          await trx.commit()
        } catch (err) {
          trx.rollback()
          throw err
        }
      });
    } catch (err) {
      console.log('err:', err)
    }
  }

  private Database
  private Order
  private WAREHOUSE_SYSTEM_URL: string
  private LOGISTICS_SYSTEM_URL: string
}
