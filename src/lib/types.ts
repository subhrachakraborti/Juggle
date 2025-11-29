import { z } from 'zod';

// Define PlaidTransaction schema based on Plaid's response
export const PlaidTransactionSchema = z.object({
  account_id: z.string(),
  amount: z.number(),
  iso_currency_code: z.string().nullable(),
  category: z.array(z.string()).nullable(),
  date: z.string(),
  name: z.string(),
  pending: z.boolean(),
  transaction_id: z.string(),
});
export type PlaidTransaction = z.infer<typeof PlaidTransactionSchema>;
