import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class LogRequest {
  public async handle(
    { request, logger }: HttpContextContract,
    next: () => Promise<void>
  ) {
    // console.log(`-> ${request.method()}: ${request.url()}`)
    logger.info({
      'method': request.method(),
      'url': request.url()
    }, 'REQUEST')
    await next()
  }
}
