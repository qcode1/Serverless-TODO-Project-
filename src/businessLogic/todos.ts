import { TodosAccess } from '../dataLayer/todosAcess'
// import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import { parseUserId } from '../auth/utils'
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

// TD: Implement businessLogic - Done
const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('helpers : Todo')

const todoAccess = new TodosAccess()
const s3 = new XAWS.S3({
    signatureVersion: 'v4'
})
const attachmentsBucket = process.env.ATTACHMENT_S3_BUCKET
const signedUrlExpiration = process.env.SIGNED_URL_EXPIRATION


export async function getAllToDos(): Promise<TodoItem[]> {
    logger.info('Using getAllToDos() helper')
    return todoAccess.getAllToDos()
}

export async function createTodo(createTodoRequest: CreateTodoRequest, jwtToken: string): Promise<TodoItem> {

    logger.info('Using createTodo() helper')

    const itemId = uuid.v4()
    const userId = parseUserId(jwtToken)

    return await todoAccess.createToDo({
        userId: userId,
        todoId: itemId,
        createdAt: new Date().toISOString(),
        dueDate: createTodoRequest.dueDate,
        done: false,
        name: createTodoRequest.name,
        attachmentUrl: `https://${attachmentsBucket}.s3.amazonaws.com/${itemId}`
    })
}

export async function getTodo(todoId: string) {

    logger.info('Using getTodo() helper')
    return await todoAccess.getTodo(todoId)
}


export async function updateTodo(todoId: string, updateTodoRequest: UpdateTodoRequest, jwtToken: string) {
    logger.info('Using updateTodo() helper')
    const userId = parseUserId(jwtToken)
    const allItems = await todoAccess.getTodosForUser(userId)
    const foundItem = allItems.find(o => o.todoId === todoId)
    return await todoAccess.updateToDo(todoId, {
        name: updateTodoRequest.name,
        dueDate: updateTodoRequest.dueDate,
        done: updateTodoRequest.done,
    }, foundItem)
}


export async function deleteTodo(todoId: string, jwtToken: string) {
    const userId = parseUserId(jwtToken)
    logger.info(`Using deleteTodo() helper - userID - ${userId}`)
    const allItems = await todoAccess.getTodosForUser(userId)
    const foundItem = allItems.find(o => o.todoId === todoId)
    return await todoAccess.deleteToDo(todoId, foundItem)
}

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
    logger.info('Using getTodosForUser() helper')
    return await todoAccess.getTodosForUser(userId)
}

export async function createAttachmentPresignedUrl(todoId: string) {
    logger.info(`Using createAttachmentPresignedUrl() helper for Todo Item - ${todoId}`)
    const signedUrl = s3.getSignedUrl('putObject', {
        Bucket: attachmentsBucket,
        Key: todoId,
        Expires: parseInt(signedUrlExpiration)
    });

    console.log(signedUrl)

    logger.info(`Generated signedUrl - ${signedUrl}`)

    return signedUrl
}