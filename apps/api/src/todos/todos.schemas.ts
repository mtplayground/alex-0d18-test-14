import { z } from "zod";

export const createTodoSchema = z
  .object({
    text: z
      .string()
      .trim()
      .min(1, "Todo text is required")
      .max(500, "Todo text must be 500 characters or fewer")
  })
  .strict();

export type CreateTodoInput = z.infer<typeof createTodoSchema>;

export const todoIdParamSchema = z
  .object({
    id: z.string().uuid("Todo id must be a valid UUID")
  })
  .strict();

export type TodoIdParams = z.infer<typeof todoIdParamSchema>;

export const updateTodoCompletedSchema = z
  .object({
    completed: z.boolean()
  })
  .strict();

export type UpdateTodoCompletedInput = z.infer<typeof updateTodoCompletedSchema>;
