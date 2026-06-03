import { expect, type APIRequestContext, test } from "@playwright/test";

const apiBaseUrl = process.env.E2E_API_BASE_URL ?? "http://127.0.0.1:8080";

type Todo = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
};

type TodosResponse = {
  todos: Todo[];
};

async function deleteTodosByText(
  request: APIRequestContext,
  text: string
): Promise<void> {
  const response = await request.get(`${apiBaseUrl}/todos`);

  if (!response.ok()) {
    return;
  }

  const body = (await response.json()) as TodosResponse;
  const matchingTodos = body.todos.filter((todo) => todo.text === text);

  await Promise.all(
    matchingTodos.map((todo) => request.delete(`${apiBaseUrl}/todos/${todo.id}`))
  );
}

test("submits, lists, completes, and deletes a todo", async ({ page, request }) => {
  const todoText = `E2E todo ${Date.now()}`;

  await deleteTodosByText(request, todoText);

  try {
    await page.goto("/");

    await page.getByLabel("New todo").fill(todoText);
    await page.getByRole("button", { name: "Add" }).click();

    const todoItem = page.getByRole("listitem").filter({ hasText: todoText });
    await expect(todoItem).toBeVisible();

    await todoItem.getByRole("checkbox", { name: "Open" }).click();
    await expect(todoItem.getByRole("checkbox", { name: "Complete" })).toBeChecked();

    await todoItem.getByRole("button", { name: "Delete" }).click();
    await expect(page.getByText(todoText)).toHaveCount(0);
    await expect(page.getByText("No todos yet.")).toBeVisible();
  } finally {
    await deleteTodosByText(request, todoText);
  }
});
