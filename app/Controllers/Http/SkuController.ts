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

    public async add({ auth, request }) {
        const userRole = auth.user.role
        const name = request.input('name')
        const description = request.input('description')
        const price = request.input('price')
        const stock = request.input('stock')

        let retcode = 0
        let data = 'ok'
        if (userRole != 'ADMIN') {
            retcode = -3
            data = 'Administration privilege required!'
            return { retcode, data }
        }

        if (price < 0 || stock < 0) {
            retcode = -4
            data = 'Bad parameters found.'
            return { retcode, data }
        }

        const newSku = new Sku()
        try {
            newSku.fill({
                name,
                description,
                price,
                stock,
            })
            await newSku.save()
        } catch (err) {
            retcode = -err.errno
            data = err.code
        }

        return { retcode, data }
    }
}

// {
//         "code": "ER_DUP_ENTRY",
//         "errno": 1062,
//         "sqlMessage": "Duplicate entry '六眼飞鱼000' for key 'skus.skus_name_unique'",
//         "sqlState": "23000",
//         "index": 0,
//         "sql": "insert into `skus` (`created_at`, `description`, `name`, `price`, `stock`, `updated_at`) values ('2021-12-04 22:36:43', '生活在台湾海域的一种凶猛的鱼', '六眼飞鱼000', '343', '5', '2021-12-04 22:36:43')"
//     }