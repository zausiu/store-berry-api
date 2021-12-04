// import { HttpContext } from "@adonisjs/http-server/build/standalone";
import User from "App/Models/User";


export default class LoginController {
    public async login({ auth, request }) {
        const username = request.input("username")
        const password = request.input("password")


        return { username, password }
    }
}
