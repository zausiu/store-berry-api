import Database from '@ioc:Adonis/Lucid/Database'
import Sku from "App/Models/Sku"
import Order from "App/Models/Order"

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

        const statement = await Database.rawQuery(
            'update skus set stock = stock - ? where stock >= ? and id = ?',
            [skuCount, skuCount, skuId]
        )
        console.log('statement is:', statement)
        if (statement[0].affectedRows === 0) {
            newOrder.merge({ state: 'FAILED' })
            await newOrder.save()
            return { retcode: -2, data: 'Not enough stock~~' }
        }

        newOrder.merge({ state: 'COMPLETED' })
        await newOrder.save()

        // 通知仓库系统
        // 通知物流系统

        return { user: auth.user, statement }
    }
}
