import { useQuery } from "@tanstack/react-query";
import type { JSX } from "react";
import { ApiClientError } from "../api/client";
import { fetchTodos, todoQueryKeys, type Todo } from "../api/todos";
import { AddTodoForm } from "./AddTodoForm";

const createdAtFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short"
});

function formatCreatedAt(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return createdAtFormatter.format(date);
}

function errorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  return "Unable to load todos";
}

function TodoListLoading(): JSX.Element {
  return (
    <div className="todo-state" aria-live="polite">
      <span className="loading-dot" aria-hidden="true" />
      <p>Loading todos</p>
    </div>
  );
}

function TodoListEmpty(): JSX.Element {
  return (
    <div className="todo-state">
      <p>No todos yet.</p>
    </div>
  );
}

function TodoListError({ error }: { error: unknown }): JSX.Element {
  return (
    <div className="todo-state todo-state-error" role="alert">
      <p>{errorMessage(error)}</p>
    </div>
  );
}

function TodoListItem({ todo }: { todo: Todo }): JSX.Element {
  return (
    <li className="todo-item">
      <div className="todo-item-main">
        <span
          className={todo.completed ? "status-dot complete" : "status-dot open"}
          aria-hidden="true"
        />
        <div>
          <p className={todo.completed ? "todo-text complete" : "todo-text"}>
            {todo.text}
          </p>
          <p className="todo-meta">Created {formatCreatedAt(todo.createdAt)}</p>
        </div>
      </div>
      <span className={todo.completed ? "todo-status complete" : "todo-status"}>
        {todo.completed ? "Complete" : "Open"}
      </span>
    </li>
  );
}

export function TodoList(): JSX.Element {
  const {
    data: todos = [],
    error,
    isError,
    isLoading
  } = useQuery({
    queryKey: todoQueryKeys.all,
    queryFn: fetchTodos
  });

  let content: JSX.Element;

  if (isLoading) {
    content = <TodoListLoading />;
  } else if (isError) {
    content = <TodoListError error={error} />;
  } else if (todos.length === 0) {
    content = <TodoListEmpty />;
  } else {
    content = (
      <ul className="todo-list" aria-label="Todos">
        {todos.map((todo) => (
          <TodoListItem key={todo.id} todo={todo} />
        ))}
      </ul>
    );
  }

  return (
    <section className="todo-panel" aria-labelledby="todo-list-title">
      <div className="todo-panel-header">
        <div>
          <p className="eyebrow">Task list</p>
          <h1 id="todo-list-title">Todos</h1>
        </div>
        <span className="todo-count">
          {isLoading || isError ? "--" : todos.length}{" "}
          {todos.length === 1 ? "item" : "items"}
        </span>
      </div>
      <AddTodoForm />
      {content}
    </section>
  );
}
