import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as todosApi from "../api/todos";
import { TodoList } from "./TodoList";

vi.mock("../api/todos", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../api/todos")>();

  return {
    ...actual,
    createTodo: vi.fn(),
    deleteTodo: vi.fn(),
    fetchTodos: vi.fn(),
    updateTodoCompleted: vi.fn()
  };
});

const fetchTodosMock = vi.mocked(todosApi.fetchTodos);
const createTodoMock = vi.mocked(todosApi.createTodo);
const updateTodoCompletedMock = vi.mocked(todosApi.updateTodoCompleted);
const deleteTodoMock = vi.mocked(todosApi.deleteTodo);

const openTodo: todosApi.Todo = {
  id: "14f789b5-dcd1-4c36-b430-30a848316c02",
  text: "Plan the release",
  completed: false,
  createdAt: "2026-01-02T03:04:05.000Z"
};

const completedTodo: todosApi.Todo = {
  ...openTodo,
  completed: true
};

function renderTodoList(): ReturnType<typeof render> {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: {
        retry: false
      },
      queries: {
        gcTime: 0,
        retry: false,
        staleTime: 0
      }
    }
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return render(<TodoList />, { wrapper: Wrapper });
}

describe("TodoList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders todos returned by the API", async () => {
    fetchTodosMock.mockResolvedValue([openTodo]);

    renderTodoList();

    expect(screen.getByText("Loading todos")).toBeInTheDocument();
    expect(await screen.findByText("Plan the release")).toBeInTheDocument();
    expect(screen.getByText("1 item")).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Open" })).not.toBeChecked();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("renders an empty state when no todos exist", async () => {
    fetchTodosMock.mockResolvedValue([]);

    renderTodoList();

    expect(await screen.findByText("No todos yet.")).toBeInTheDocument();
    expect(screen.getByText("0 items")).toBeInTheDocument();
  });

  it("validates and submits the add-todo form", async () => {
    const createdTodo: todosApi.Todo = {
      id: "4c6fd5af-a97b-4f65-a09d-287353139ae4",
      text: "Write component tests",
      completed: false,
      createdAt: "2026-01-03T03:04:05.000Z"
    };
    fetchTodosMock.mockResolvedValueOnce([]).mockResolvedValueOnce([createdTodo]);
    createTodoMock.mockResolvedValue(createdTodo);
    const user = userEvent.setup();

    renderTodoList();

    await screen.findByText("No todos yet.");
    await user.click(screen.getByRole("button", { name: "Add" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Todo text is required");

    await user.type(screen.getByLabelText("New todo"), " Write component tests ");
    await user.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() => {
      expect(createTodoMock).toHaveBeenCalled();
    });
    expect(createTodoMock.mock.calls[0]?.[0]).toEqual({
      text: "Write component tests"
    });
    expect(await screen.findByText("Write component tests")).toBeInTheDocument();
    expect(screen.getByLabelText("New todo")).toHaveValue("");
  });

  it("toggles a todo complete and refreshes the list", async () => {
    fetchTodosMock
      .mockResolvedValueOnce([openTodo])
      .mockResolvedValueOnce([completedTodo]);
    updateTodoCompletedMock.mockResolvedValue(completedTodo);
    const user = userEvent.setup();

    renderTodoList();

    await screen.findByText("Plan the release");
    await user.click(screen.getByRole("checkbox", { name: "Open" }));

    await waitFor(() => {
      expect(updateTodoCompletedMock).toHaveBeenCalledWith(openTodo.id, {
        completed: true
      });
    });
    expect(await screen.findByRole("checkbox", { name: "Complete" })).toBeChecked();
  });

  it("deletes a todo and refreshes the list", async () => {
    fetchTodosMock.mockResolvedValueOnce([openTodo]).mockResolvedValueOnce([]);
    deleteTodoMock.mockResolvedValue();
    const user = userEvent.setup();

    renderTodoList();

    await screen.findByText("Plan the release");
    await user.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(deleteTodoMock).toHaveBeenCalledWith(openTodo.id);
    });
    expect(await screen.findByText("No todos yet.")).toBeInTheDocument();
  });
});
