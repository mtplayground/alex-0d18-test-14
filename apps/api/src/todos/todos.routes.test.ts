import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../app.js";
import {
  createTodo,
  deleteTodo,
  listTodos,
  updateTodoCompleted
} from "./todos.service.js";

vi.mock("./todos.service.js", () => ({
  createTodo: vi.fn(),
  deleteTodo: vi.fn(),
  listTodos: vi.fn(),
  updateTodoCompleted: vi.fn()
}));

const serviceMock = {
  createTodo: vi.mocked(createTodo),
  deleteTodo: vi.mocked(deleteTodo),
  listTodos: vi.mocked(listTodos),
  updateTodoCompleted: vi.mocked(updateTodoCompleted)
};

describe("todo routes", () => {
  const app = createApp();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists todos", async () => {
    serviceMock.listTodos.mockResolvedValue([
      {
        id: "7b65bf01-944f-44bb-8213-fb9264e45489",
        text: "Review todos",
        completed: false,
        createdAt: "2026-01-02T03:04:05.000Z"
      }
    ]);

    const response = await request(app).get("/todos").expect(200);

    expect(response.body).toEqual({
      todos: [
        {
          id: "7b65bf01-944f-44bb-8213-fb9264e45489",
          text: "Review todos",
          completed: false,
          createdAt: "2026-01-02T03:04:05.000Z"
        }
      ]
    });
    expect(serviceMock.listTodos).toHaveBeenCalledOnce();
  });

  it("creates a todo with validated input", async () => {
    serviceMock.createTodo.mockResolvedValue({
      id: "c0630a9a-3164-420a-ab09-52169967e3d0",
      text: "Buy milk",
      completed: false,
      createdAt: "2026-01-02T03:04:05.000Z"
    });

    const response = await request(app)
      .post("/todos")
      .send({ text: " Buy milk " })
      .expect(201);

    expect(response.body).toEqual({
      todo: {
        id: "c0630a9a-3164-420a-ab09-52169967e3d0",
        text: "Buy milk",
        completed: false,
        createdAt: "2026-01-02T03:04:05.000Z"
      }
    });
    expect(serviceMock.createTodo).toHaveBeenCalledWith({ text: "Buy milk" });
  });

  it("rejects invalid create input", async () => {
    const response = await request(app).post("/todos").send({ text: "" }).expect(400);

    expect(response.body).toMatchObject({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid todo input"
      }
    });
    expect(response.body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "text",
          message: "Todo text is required"
        })
      ])
    );
    expect(serviceMock.createTodo).not.toHaveBeenCalled();
  });

  it("updates a todo completed status", async () => {
    serviceMock.updateTodoCompleted.mockResolvedValue({
      id: "97042f93-c0d0-40e1-b383-f55ffd585d90",
      text: "Ship feature",
      completed: true,
      createdAt: "2026-01-02T03:04:05.000Z"
    });

    const response = await request(app)
      .patch("/todos/97042f93-c0d0-40e1-b383-f55ffd585d90")
      .send({ completed: true })
      .expect(200);

    expect(response.body).toEqual({
      todo: {
        id: "97042f93-c0d0-40e1-b383-f55ffd585d90",
        text: "Ship feature",
        completed: true,
        createdAt: "2026-01-02T03:04:05.000Z"
      }
    });
    expect(serviceMock.updateTodoCompleted).toHaveBeenCalledWith(
      "97042f93-c0d0-40e1-b383-f55ffd585d90",
      { completed: true }
    );
  });

  it("rejects invalid update input", async () => {
    const response = await request(app)
      .patch("/todos/97042f93-c0d0-40e1-b383-f55ffd585d90")
      .send({ completed: "yes" })
      .expect(400);

    expect(response.body).toMatchObject({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid todo input"
      }
    });
    expect(serviceMock.updateTodoCompleted).not.toHaveBeenCalled();
  });

  it("returns not found when updating a missing todo", async () => {
    serviceMock.updateTodoCompleted.mockResolvedValue(null);

    const response = await request(app)
      .patch("/todos/97042f93-c0d0-40e1-b383-f55ffd585d90")
      .send({ completed: false })
      .expect(404);

    expect(response.body).toEqual({
      error: {
        code: "NOT_FOUND",
        message: "Todo not found"
      }
    });
  });

  it("rejects invalid todo ids", async () => {
    const response = await request(app)
      .patch("/todos/not-a-uuid")
      .send({ completed: true })
      .expect(400);

    expect(response.body).toMatchObject({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid todo input"
      }
    });
    expect(serviceMock.updateTodoCompleted).not.toHaveBeenCalled();
  });

  it("deletes a todo", async () => {
    serviceMock.deleteTodo.mockResolvedValue(true);

    await request(app)
      .delete("/todos/97042f93-c0d0-40e1-b383-f55ffd585d90")
      .expect(204);

    expect(serviceMock.deleteTodo).toHaveBeenCalledWith(
      "97042f93-c0d0-40e1-b383-f55ffd585d90"
    );
  });

  it("returns not found when deleting a missing todo", async () => {
    serviceMock.deleteTodo.mockResolvedValue(false);

    const response = await request(app)
      .delete("/todos/97042f93-c0d0-40e1-b383-f55ffd585d90")
      .expect(404);

    expect(response.body).toEqual({
      error: {
        code: "NOT_FOUND",
        message: "Todo not found"
      }
    });
  });
});
