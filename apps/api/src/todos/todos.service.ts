import type { Todo } from "@prisma/client";
import { prisma } from "../db/prisma.js";
import type { CreateTodoInput } from "./todos.schemas.js";

export type TodoResponse = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
};

function toTodoResponse(todo: Todo): TodoResponse {
  return {
    id: todo.id,
    text: todo.text,
    completed: todo.completed,
    createdAt: todo.createdAt.toISOString()
  };
}

export async function createTodo(input: CreateTodoInput): Promise<TodoResponse> {
  const todo = await prisma.todo.create({
    data: {
      text: input.text
    }
  });

  return toTodoResponse(todo);
}

export async function listTodos(): Promise<TodoResponse[]> {
  const todos = await prisma.todo.findMany({
    orderBy: {
      createdAt: "desc"
    }
  });

  return todos.map(toTodoResponse);
}
