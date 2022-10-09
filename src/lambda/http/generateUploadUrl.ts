import 'source-map-support/register'
import { APIGatewayProxyEvent } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { createAttachmentPresignedUrl, getAllToDos } from '../../businessLogic/todos'
import { parseUserId } from '../../auth/utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('Generate Upload Url')

export const handler = middy(async (event: APIGatewayProxyEvent)/*: Promise<APIGatewayProxyResult>*/ => {

  logger.info('Processing event', event)

  const todoId = event.pathParameters.todoId
  const allItems = await getAllToDos()
  const foundItem = allItems.find(o => o.todoId === todoId)


  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  const userId = parseUserId(jwtToken)


  if (!foundItem) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        error: "Todo Item does not exist"
      })
    }
  }

  if (foundItem && foundItem.userId !== userId) {

    return {
      statusCode: 404,
      body: JSON.stringify({
        error: "User does not own Todo Item"
      })
    }
  }

  const urlResult = await createAttachmentPresignedUrl(todoId)

  // TD: Return a presigned URL to upload a file for a TODO item with the provided id - DONE

  return {
    statusCode: 200,
    body: JSON.stringify({
      uploadUrl: urlResult
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
