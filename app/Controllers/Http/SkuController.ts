import Database from '@ioc:Adonis/Lucid/Database'
import Sku from "App/Models/Sku"
import Order from "App/Models/Order"
import axios from 'axios'
import Env from '@ioc:Adonis/Core/Env'

const warehouse_system_url = Env.get('WAREHOUSE_SYSTEM', 'http://localhost:3333/warehouse')
const logistics_system_url = Env.get('LOGISTICS_SYSTEM', 'http://localhost:3333/logistics')

export default class SkuController {
    public async list({ request }) {
        const keywords = request.input('keywords')

        if (keywords == null || keywords == '') {
            const all = await Sku.all()
            return all
        }

        const records = await Database.rawQuery(
            'select * from skus where MATCH(name, description) against(? in NATURAL LANGUAGE MODE)', [keywords]
        )[0]

        return { records }
    }

    public async buy({ auth, request }) {
        const skuId = request.input('sku_id')
        const skuCount = request.input('sku_count')
        const userName = auth.user.name

        const newOrder = new Order()
        newOrder.fill({
            sku_id: skuId,
            sku_count: skuCount,
            username: userName
        })

        const statement = await Database.rawQuery(    // update sql will get the row lock ~
            'update skus set stock = stock - ? where stock >= ? and id = ?',
            [skuCount, skuCount, skuId]
        )
        // console.log('statement is:', statement)
        if (statement[0].affectedRows === 0) {
            newOrder.merge({ state: 'FAILED' })
            await newOrder.save()
            return { retcode: -2, data: 'Not enough stock~~' }
        }

        newOrder.merge({ state: 'COMPLETED' })
        await newOrder.save()

        const info2downstream = {
            order_id: newOrder.id,
            username: userName
        }

        // 异步通知物流系统
        axios.post(logistics_system_url, info2downstream)
            .then(_ => console.log('Logistic System accepted the request.'))
            .catch(err => console.log('A error occured while talking to Logistic System', err))
        // 异步通知仓库系统
        axios.post(warehouse_system_url, info2downstream)
            .then(_ => console.log('Warehouse System accepted the request.'))
            .catch(err => console.log('A error occured while talking to Warehouse System', err))

        const sku = await Sku.findBy('id', skuId)
        return { retcode: 0, data: 'ok', order_id: newOrder.id, stock: sku?.stock }
    }
}
