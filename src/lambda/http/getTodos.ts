import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { getTodosForUser as getTodosForUser } from '../../businessLogic/todos'
import { parseUserId } from '../../auth/utils'
import { createLogger } from '../../utils/logger'


const logger = createLogger('http : getTodos')

// TD: Get all TODO items for a current user - DONE
export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // Write your code here
  logger.info('Processing Get Todos', event)
  logger.info('Get Todos')

  // const authorization = event.headers.Authorization
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  const userId = parseUserId(jwtToken)
  
  const todos = await getTodosForUser(userId)
  logger.info('Get Todos for user Result', todos)

  return {
    statusCode: 200,
    body: JSON.stringify({
      items: todos
    })
  }
})

  handler.use(
    cors({
      credentials: true
    })
  )
