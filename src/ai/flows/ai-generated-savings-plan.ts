
'use server';

import { ai, defaultModel } from '@/ai/openrouter';
import { z } from 'zod';

const SavingsPlanInputSchema = z.object({
  income: z.number().describe('The user monthly income.'),
  expenses: z.number().describe('The user monthly expenses.'),
  upcomingCommitments: z.string().describe('A description of the user upcoming financial commitments, including amounts and dates.'),
  pastFinancialBehavior: z.string().describe('A summary of the user past financial behavior and habits.'),
});
export type SavingsPlanInput = z.infer<typeof SavingsPlanInputSchema>;

const SavingsPlanOutputSchema = z.object({
  savingsPlan: z.string().describe('A detailed, personalized savings plan to address potential cash flow shortfalls.'),
  projectedShortfall: z.number().describe('The projected amount of the shortfall, if any.'),
  recommendations: z.string().describe('Specific recommendations for micro-savings plans or other actions to take.'),
});
export type SavingsPlanOutput = z.infer<typeof SavingsPlanOutputSchema>;

export async function generateSavingsPlan(input: SavingsPlanInput): Promise<SavingsPlanOutput> {
  const prompt = `You are an AI financial advisor specializing in creating personalized savings plans.

Based on the user income, expenses, upcoming commitments, and past financial behavior, generate a savings plan to address potential cash flow shortfalls.
Identify the projected shortfall amount, if any.
Provide specific, actionable recommendations, such as suggesting micro-savings plans, to help the user reduce financial stress.

Income: $${input.income}
Expenses: $${input.expenses}
Upcoming Commitments: ${input.upcomingCommitments}
Past Financial Behavior: ${input.pastFinancialBehavior}

Respond in JSON format with the following structure:
{
  "savingsPlan": "detailed savings plan text",
  "projectedShortfall": number,
  "recommendations": "specific recommendations text"
}`;

  const response = await ai.chat.completions.create({
    model: defaultModel,
    messages: [{
      role: 'user',
      content: prompt,
    }],
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error('No response from AI');

  const parsed = JSON.parse(content);
  return SavingsPlanOutputSchema.parse(parsed);
}
