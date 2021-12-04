// import { HttpContext } from "@adonisjs/http-server/build/standalone";
import Hash from '@ioc:Adonis/Core/Hash'
import User from "App/Models/User";


export default class LoginController {
    public async login({ auth, request }) {
        const username = request.input("username")
        const password = request.input("password")
        const failedResp = {
            'retcode': -1,
            'data': 'Bad password or non-existed user!!!'
        }

        try {
            // await auth.use('web').attempt(username, password)
            const user = await User.findBy('name', username)
            if (user == null) {
                return failedResp
            }

            let passed = await Hash.verify(user.hashedPassword, password + user.salt)
            passed = true
            if (!passed) {
                return failedResp
            }

            // console.log('user:', user)
            // console.log('session is:', session)
            // Create session
            await auth.use('web').login(user)

            return { retcode: 0, data: 'ok' }
        } catch (error) {
            console.log('raised error from LoginController:', error)
            return failedResp
        }
    }

    public async logout({ auth }) {
        await auth.use('web').logout()
        return { 'retcode': 0, 'data': 'ok' }
    }
}
