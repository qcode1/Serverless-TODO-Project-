import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { updateTodo } from '../../businessLogic/todos'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'

const logger = createLogger('http : updateTodo')

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

  logger.info('Processing event', event)

  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
  // TD: Update a TODO item with the provided id using values in the "updatedTodo" object - DONE

  const authorization = event.headers.Authorization
  logger.info('Update Todo Item Auth: ', authorization)

  const split = authorization.split(' ')
  const jwtToken = split[1]

  const updatedItem = await updateTodo(todoId, updatedTodo, jwtToken)

  return {
    statusCode: 200,
    body: JSON.stringify({
      item: updatedItem
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
