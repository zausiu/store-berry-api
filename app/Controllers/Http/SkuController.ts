import Database from '@ioc:Adonis/Lucid/Database'
import Sku from "App/Models/Sku"
import Order from "App/Models/Order"
import axios from 'axios'
import Env from '@ioc:Adonis/Core/Env'

const WAREHOUSE_SYSTEM_URL = Env.get('WAREHOUSE_SYSTEM', 'http://localhost:3333/warehouse')
const LOGISTICS_SYSTEM_URL = Env.get('LOGISTICS_SYSTEM', 'http://localhost:3333/logistics')

export default class SkuController {
    public async list({ request }) {
        const keywords = request.input('keywords')
        let records = [] as Sku[]
        if (keywords == null || keywords == '') {
            records = await Sku.all()
        } else {
            const result = await Database.rawQuery(
                'select * from skus where MATCH(name, description) against(? in NATURAL LANGUAGE MODE)', [keywords]
            )
            records = result[0]
            // console.log('records are:', records, 'keywords are:', keywords, 'result is:', result)
        }

        return { retcode: 0, data: records }
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
        await newOrder.save()

        try {
            await Database.transaction(async (trx) => {
                try {
                    newOrder.useTransaction(trx)

                    const decrementResult = await Sku.query()
                        .where('id', skuId)
                        .andWhere('stock', '>=', skuCount)
                        .useTransaction(trx)
                        .decrement({ 'stock': skuCount })
                    const affectedRows = decrementResult[0]
                    // console.log('>>>>>>>>>>>>>>>>> number of affectedRows is: ', affectedRows)
                    if (affectedRows != 1) {
                        throw 'Not enough stock~~'
                    }

                    newOrder.merge({ state: 'CONSUMED' })
                    await newOrder.save()
                    await trx.commit()
                } catch (err) {
                    trx.rollback()
                    throw err
                }
            })
        } catch (err) {
            return { retcode: -2, data: String(err) }
        }

        // ??????????????????...
        const info2downstream = {
            order_id: newOrder.id,
            username: userName
        }
        // ????????????????????????
        axios.post(LOGISTICS_SYSTEM_URL, info2downstream)
            .then(_ => {
                Order.query().where('id', info2downstream.order_id).update('reported2logistics', true)
                console.log('Logistic System accepted the request.')
            })
            .catch(err => console.log('A error occured while talking to Logistic System', err))
        // ????????????????????????
        axios.post(WAREHOUSE_SYSTEM_URL, info2downstream)
            .then(_ => {
                Order.query().where('id', info2downstream.order_id).update('reported2warehouse', true)
                console.log('Warehouse System accepted the request.')
            })
            .catch(err => console.log('A error occured while talking to Warehouse System', err))

        const sku = await Sku.findBy('id', skuId)
        return { retcode: 0, data: 'ok', order_id: newOrder.id, stock: sku?.stock }
    }

    public async add({ auth, request }) {
        const userRole = auth.user.role
        const name = request.input('name')
        const description = request.input('description')
        const price = Number(request.input('price')) * 100
        const stock = Math.floor(request.input('stock'))

        console.log(`name ${name} ${description} ${price} ${stock}`)

        let retcode = 0
        let data = 'ok'
        if (userRole != 'ADMIN') {
            retcode = -3
            data = 'Administration privilege required!'
            return { retcode, data }
        }

        if (price <= 0 || stock <= 0) {
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
//         "sqlMessage": "Duplicate entry '????????????000' for key 'skus.skus_name_unique'",
//         "sqlState": "23000",
//         "index": 0,
//         "sql": "insert into `skus` (`created_at`, `description`, `name`, `price`, `stock`, `updated_at`) values ('2021-12-04 22:36:43', '??????????????????????????????????????????', '????????????000', '343', '5', '2021-12-04 22:36:43')"
//     }
            // const statement = await Database.rawQuery(    // update sql will get the row lock ~
            //     'update skus set stock = stock - ? where stock >= ? and id = ?',
            //     [skuCount, skuCount, skuId]
            // )
            // // console.log('statement is:', statement)
            // if (statement[0].affectedRows === 0) {
            //     newOrder.merge({ state: 'FAILED' })
            //     await newOrder.save()
            //     return { retcode: -2, data: 'Not enough stock~~' }
            // }
