import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createTodo } from '../../helpers/todos'
import { createLogger } from '../../utils/logger'

const logger = createLogger('http : createTodo')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  logger.info('Processing event: ', event)

  const newTodo: CreateTodoRequest = JSON.parse(event.body)

  // TD: Implement creating a new TODO item - 
  const authorization = event.headers.Authorization
  logger.info('Create Todo Item Auth: ', authorization)

  const split = authorization.split(' ')
  const jwtToken = split[1]

  const newItem = await createTodo(newTodo, jwtToken)

  return {
    statusCode: 201,
    body: JSON.stringify({
      item: newItem
    })
  }
})

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )

