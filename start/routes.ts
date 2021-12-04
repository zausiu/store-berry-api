/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

// Route.get('/', async () => {
//   return { hello: 'adonisjs' }
// })

Route.post('/api/login', 'LoginController.login')
Route.post('/api/logout', 'LoginController.logout')

// Route.get('/api/sku', 'SkuController.list')
Route.group(() => {
    Route.get('/sku', 'SkuController.list')
    Route.post('/sku/buy', 'SkuController.buy')
    Route.post('/sku/add', 'SkuController.add')
}).prefix('/api').middleware('auth')


// 物流系统
Route.post('/logistics', ({ request }) => {
    const orderId = request.input('order_id')
    const userName = request.input('username')
    console.log('logistics system is alive ...', orderId, userName)
})
// 仓库系统
Route.post('/warehouse', ({ request }) => {
    const orderId = request.input('order_id')
    const userName = request.input('username')
    console.log('warehouse system is alive ...', orderId, userName)
})