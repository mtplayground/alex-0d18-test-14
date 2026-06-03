import { apiRequest } from "./client";

export type Todo = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
};

export type CreateTodoPayload = {
  text: string;
};

export type UpdateTodoCompletedPayload = {
  completed: boolean;
};

type TodoResponse = {
  todo: Todo;
};

type TodosResponse = {
  todos: Todo[];
};

export const todoQueryKeys = {
  all: ["todos"] as const
};

export async function fetchTodos(): Promise<Todo[]> {
  const response = await apiRequest<TodosResponse>("/todos");
  return response.todos;
}

export async function createTodo(payload: CreateTodoPayload): Promise<Todo> {
  const response = await apiRequest<TodoResponse>("/todos", {
    method: "POST",
    body: JSON.stringify(payload)
  });

  return response.todo;
}

export async function updateTodoCompleted(
  id: string,
  payload: UpdateTodoCompletedPayload
): Promise<Todo> {
  const response = await apiRequest<TodoResponse>(`/todos/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });

  return response.todo;
}

export async function deleteTodo(id: string): Promise<void> {
  await apiRequest<void>(`/todos/${encodeURIComponent(id)}`, {
    method: "DELETE"
  });
}
