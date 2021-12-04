// import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import { HttpContext } from "@adonisjs/http-server/build/standalone";


export default class LoginController {
    public async login(ctx: HttpContext) {
        return { resolution: "ok"}
    }
}
