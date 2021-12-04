import Database from '@ioc:Adonis/Lucid/Database'
import Sku from "App/Models/Sku";

export default class SkuController {
    public async list({ request }) {
        const keywords = request.input("keywords")

        if (keywords == null || keywords == '') {
            const all = await Sku.all()
            return all
        }

        const records = await Database.rawQuery(
            'select * from sku where MATCH(name, description) against(? in NATURAL LANGUAGE MODE)', [keywords]
        )[0]

        return { records }
    }
}
