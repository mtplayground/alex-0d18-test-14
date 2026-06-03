import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, type JSX, useId, useState } from "react";
import { ApiClientError } from "../api/client";
import { createTodo, todoQueryKeys } from "../api/todos";

const MAX_TODO_LENGTH = 500;

function mutationErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  return "Unable to add todo";
}

export function AddTodoForm(): JSX.Element {
  const [text, setText] = useState("");
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const inputId = useId();
  const feedbackId = useId();
  const queryClient = useQueryClient();
  const createTodoMutation = useMutation({
    mutationFn: createTodo,
    onSuccess: async () => {
      setText("");
      setValidationMessage(null);
      await queryClient.invalidateQueries({ queryKey: todoQueryKeys.all });
    }
  });

  const trimmedText = text.trim();
  const isSubmitting = createTodoMutation.isPending;
  const feedbackMessage =
    validationMessage ??
    (createTodoMutation.isError
      ? mutationErrorMessage(createTodoMutation.error)
      : null);

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    if (!trimmedText) {
      setValidationMessage("Todo text is required");
      return;
    }

    setValidationMessage(null);
    createTodoMutation.mutate({ text: trimmedText });
  }

  return (
    <form className="todo-form" onSubmit={handleSubmit}>
      <label className="todo-form-label" htmlFor={inputId}>
        New todo
      </label>
      <div className="todo-form-row">
        <input
          id={inputId}
          className="todo-input"
          type="text"
          value={text}
          maxLength={MAX_TODO_LENGTH}
          aria-describedby={feedbackMessage ? feedbackId : undefined}
          aria-invalid={feedbackMessage ? "true" : "false"}
          disabled={isSubmitting}
          onChange={(event) => {
            setText(event.target.value);
            setValidationMessage(null);
          }}
        />
        <button className="todo-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Adding" : "Add"}
        </button>
      </div>
      {feedbackMessage ? (
        <p className="todo-form-feedback" id={feedbackId} role="alert">
          {feedbackMessage}
        </p>
      ) : null}
    </form>
  );
}
