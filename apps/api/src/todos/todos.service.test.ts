import { beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { prisma } from "../db/prisma.js";
import {
  createTodo,
  deleteTodo,
  listTodos,
  updateTodoCompleted
} from "./todos.service.js";

vi.mock("../db/prisma.js", () => ({
  prisma: {
    todo: {
      create: vi.fn(),
      deleteMany: vi.fn(),
      findMany: vi.fn(),
      findUniqueOrThrow: vi.fn(),
      updateMany: vi.fn()
    }
  }
}));

const todoDelegate = prisma.todo as unknown as {
  create: Mock;
  deleteMany: Mock;
  findMany: Mock;
  findUniqueOrThrow: Mock;
  updateMany: Mock;
};

describe("todo service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a todo and maps the database record for API responses", async () => {
    todoDelegate.create.mockResolvedValue({
      id: "4e42ce44-7eac-47f3-bbf3-ae7628f0c303",
      text: "Buy milk",
      completed: false,
      createdAt: new Date("2026-01-02T03:04:05.000Z")
    });

    await expect(createTodo({ text: "Buy milk" })).resolves.toEqual({
      id: "4e42ce44-7eac-47f3-bbf3-ae7628f0c303",
      text: "Buy milk",
      completed: false,
      createdAt: "2026-01-02T03:04:05.000Z"
    });
    expect(todoDelegate.create).toHaveBeenCalledWith({
      data: {
        text: "Buy milk"
      }
    });
  });

  it("lists todos newest-first and maps dates to ISO strings", async () => {
    todoDelegate.findMany.mockResolvedValue([
      {
        id: "c4f4d27a-c487-44cd-afeb-bae70f68f74e",
        text: "Newer todo",
        completed: false,
        createdAt: new Date("2026-01-03T00:00:00.000Z")
      },
      {
        id: "bf77e974-0c0a-4c01-8ab4-79a9df9cf309",
        text: "Older todo",
        completed: true,
        createdAt: new Date("2026-01-01T00:00:00.000Z")
      }
    ]);

    await expect(listTodos()).resolves.toEqual([
      {
        id: "c4f4d27a-c487-44cd-afeb-bae70f68f74e",
        text: "Newer todo",
        completed: false,
        createdAt: "2026-01-03T00:00:00.000Z"
      },
      {
        id: "bf77e974-0c0a-4c01-8ab4-79a9df9cf309",
        text: "Older todo",
        completed: true,
        createdAt: "2026-01-01T00:00:00.000Z"
      }
    ]);
    expect(todoDelegate.findMany).toHaveBeenCalledWith({
      orderBy: {
        createdAt: "desc"
      }
    });
  });

  it("updates a todo's completed status", async () => {
    todoDelegate.updateMany.mockResolvedValue({ count: 1 });
    todoDelegate.findUniqueOrThrow.mockResolvedValue({
      id: "28076fae-513d-4d14-9e59-b6745a965528",
      text: "Finish task",
      completed: true,
      createdAt: new Date("2026-01-04T00:00:00.000Z")
    });

    await expect(
      updateTodoCompleted("28076fae-513d-4d14-9e59-b6745a965528", {
        completed: true
      })
    ).resolves.toEqual({
      id: "28076fae-513d-4d14-9e59-b6745a965528",
      text: "Finish task",
      completed: true,
      createdAt: "2026-01-04T00:00:00.000Z"
    });
    expect(todoDelegate.updateMany).toHaveBeenCalledWith({
      where: {
        id: "28076fae-513d-4d14-9e59-b6745a965528"
      },
      data: {
        completed: true
      }
    });
    expect(todoDelegate.findUniqueOrThrow).toHaveBeenCalledWith({
      where: {
        id: "28076fae-513d-4d14-9e59-b6745a965528"
      }
    });
  });

  it("returns null when no todo is updated", async () => {
    todoDelegate.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      updateTodoCompleted("d818c79a-32ed-4951-8995-49cb7907f58d", {
        completed: false
      })
    ).resolves.toBeNull();
    expect(todoDelegate.findUniqueOrThrow).not.toHaveBeenCalled();
  });

  it("deletes a todo by id", async () => {
    todoDelegate.deleteMany.mockResolvedValue({ count: 1 });

    await expect(deleteTodo("08c0fb10-32d2-436f-9515-4b9520f1292e")).resolves.toBe(
      true
    );
    expect(todoDelegate.deleteMany).toHaveBeenCalledWith({
      where: {
        id: "08c0fb10-32d2-436f-9515-4b9520f1292e"
      }
    });
  });

  it("returns false when no todo is deleted", async () => {
    todoDelegate.deleteMany.mockResolvedValue({ count: 0 });

    await expect(deleteTodo("021f1b1d-dcf7-49a0-9a5e-dafce3bb9a7c")).resolves.toBe(
      false
    );
  });
});
