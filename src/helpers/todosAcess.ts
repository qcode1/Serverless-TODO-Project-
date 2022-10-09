import * as AWS from 'aws-sdk'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
import * as AWSXRay from 'aws-xray-sdk'

// TD: Implement the dataLayer logic - Done

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('TodosAccess')
const userIdIndex = process.env.USER_ID_INDEX


export class TodosAccess {

    constructor(
        private readonly docClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE) {
    }

    async getAllToDos(): Promise<TodoItem[]> {

        logger.info('Getting all ToDos')

        const result = await this.docClient.scan({
            TableName: this.todosTable
        }).promise()

        const items = result.Items
        return items as TodoItem[]
    }

    async getTodo(todoId: string): Promise<TodoItem> {

        logger.info('Getting ToDo Item')

        const result = await this.docClient.get({
            TableName: this.todosTable,
            Key: {
                todoId: todoId
            }
        }).promise()

        // const item = result.Item
        return result.Item as TodoItem
    }

    async createToDo(todo: TodoItem): Promise<TodoItem> {

        logger.info('Creating a ToDo Item')

        await this.docClient.put({
            TableName: this.todosTable,
            Item: todo
        }).promise()

        return todo
    }

    async getTodosForUser(userId: string): Promise<TodoItem[]> {

        logger.info(`Getting Todo Items for user - ${userId}`)

        // KeyConditionExpression: 'userId = :userId',
        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: userIdIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()

        console.log("Get Todos Per User: ", result)

        return result.Items as TodoItem[]

    }


    async updateToDo(todoId: String, todoUpdate: TodoUpdate, foundItem: TodoItem): Promise<TodoUpdate> {

        logger.info('Updating a ToDo Item')

        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                todoId: todoId,
                createdAt: foundItem.createdAt
            },
            UpdateExpression: 'SET #done = :done, #name = :name, #dueDate = :dueDate',
            ExpressionAttributeValues: {
                ':done': todoUpdate.done,
                ':name': todoUpdate.name,
                ':dueDate': todoUpdate.dueDate
            },
            ExpressionAttributeNames: {
                '#done': 'done',
                '#name': 'name',
                '#dueDate': 'dueDate'
            }
            // Key: {
            //     todoId: todo.todoId
            // },
            // UpdateExpression: 'set #a = :x + :y ',
            // ConditionExpression: '#a < :MAX',
            // ExpressionAttributeNames: { '#a': 'Sum' },
            // ExpressionAttributeValues: {
            //     ':x': 20,
            //     ':y': 45,
            //     ':MAX': 100,
            // }
        }).promise()

        return todoUpdate
    }

    async deleteToDo(todoId: string, foundItem: TodoItem): Promise<void> {

        logger.info(`Deleting a ToDo Item - ${todoId}`)
        logger.info(`Found existing ToDo Item - ${foundItem}`)

        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                todoId: todoId,
                createdAt: foundItem.createdAt
            }
        }).promise()

        return 
    }

    

}