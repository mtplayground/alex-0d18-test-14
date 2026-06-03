import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { JSX } from "react";
import { ApiClientError } from "../api/client";
import {
  deleteTodo,
  fetchTodos,
  todoQueryKeys,
  updateTodoCompleted,
  type Todo
} from "../api/todos";
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

function errorMessage(error: unknown, fallback = "Unable to load todos"): string {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  return fallback;
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

type TodoListItemProps = {
  isDeleting: boolean;
  isDisabled: boolean;
  isToggling: boolean;
  onDelete: (todo: Todo) => void;
  onToggle: (todo: Todo) => void;
  todo: Todo;
};

function TodoListItem({
  isDeleting,
  isDisabled,
  isToggling,
  onDelete,
  onToggle,
  todo
}: TodoListItemProps): JSX.Element {
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
      <div className="todo-actions" aria-label={`Actions for ${todo.text}`}>
        <label className="todo-toggle">
          <input
            checked={todo.completed}
            disabled={isDisabled}
            type="checkbox"
            onChange={() => {
              onToggle(todo);
            }}
          />
          <span>{isToggling ? "Saving" : todo.completed ? "Complete" : "Open"}</span>
        </label>
        <button
          className="todo-delete"
          disabled={isDisabled}
          type="button"
          onClick={() => {
            onDelete(todo);
          }}
        >
          {isDeleting ? "Deleting" : "Delete"}
        </button>
      </div>
    </li>
  );
}

export function TodoList(): JSX.Element {
  const queryClient = useQueryClient();
  const {
    data: todos = [],
    error,
    isError,
    isLoading
  } = useQuery({
    queryKey: todoQueryKeys.all,
    queryFn: fetchTodos
  });
  const toggleTodoMutation = useMutation({
    mutationFn: (todo: Todo) =>
      updateTodoCompleted(todo.id, { completed: !todo.completed }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: todoQueryKeys.all });
    }
  });
  const deleteTodoMutation = useMutation({
    mutationFn: (todo: Todo) => deleteTodo(todo.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: todoQueryKeys.all });
    }
  });

  const actionError =
    toggleTodoMutation.isError || deleteTodoMutation.isError
      ? errorMessage(
          toggleTodoMutation.error ?? deleteTodoMutation.error,
          "Unable to update todo"
        )
      : null;
  const togglingTodoId = toggleTodoMutation.isPending
    ? toggleTodoMutation.variables?.id
    : null;
  const deletingTodoId = deleteTodoMutation.isPending
    ? deleteTodoMutation.variables?.id
    : null;
  const isActionPending = toggleTodoMutation.isPending || deleteTodoMutation.isPending;

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
          <TodoListItem
            key={todo.id}
            isDeleting={deletingTodoId === todo.id}
            isDisabled={isActionPending}
            isToggling={togglingTodoId === todo.id}
            todo={todo}
            onDelete={(todoToDelete) => {
              deleteTodoMutation.mutate(todoToDelete);
            }}
            onToggle={(todoToToggle) => {
              toggleTodoMutation.mutate(todoToToggle);
            }}
          />
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
      {actionError ? (
        <div className="todo-action-error" role="alert">
          {actionError}
        </div>
      ) : null}
      {content}
    </section>
  );
}
