/**
 * Fields in a request to create a single TODO item.
 */

//  userId: string
//  todoId: string
//  createdAt: string
//  name: string
//  dueDate: string
//  done: boolean
//  attachmentUrl?: string

export interface CreateTodoRequest {
  name: string
  dueDate: string
}
