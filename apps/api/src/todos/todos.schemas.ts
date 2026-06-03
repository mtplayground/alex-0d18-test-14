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
