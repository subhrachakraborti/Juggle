'use server';

import { ai, defaultModel } from '@/ai/openrouter';
import { z } from 'zod';

const ForecastCashFlowInputSchema = z.object({
  transactionHistory: z.string().describe('Transaction history data in JSON format.'),
  calendarEvents: z.string().describe('Calendar event data in JSON format.'),
});
export type ForecastCashFlowInput = z.infer<typeof ForecastCashFlowInputSchema>;

const ProjectionDataPointSchema = z.object({
  date: z.string().describe("The date for the data point in YYYY-MM-DD format."),
  balance: z.number().describe('The projected balance for that date.'),
});

const ForecastCashFlowOutputSchema = z.object({
  forecast: z.string().describe('A forecast of potential cash flow shortfalls and personalized recommendations.'),
  projectionData: z.array(ProjectionDataPointSchema).describe("An array of daily projected balances for the next 30 days to be used in a chart. Each point should have a date and a balance."),
});
export type ForecastCashFlowOutput = z.infer<typeof ForecastCashFlowOutputSchema>;

export async function forecastCashFlow(input: ForecastCashFlowInput): Promise<ForecastCashFlowOutput> {
  const prompt = `You are a personal financial advisor. Analyze the provided transaction history and calendar events to forecast potential cash flow shortfalls and provide personalized recommendations to avoid them.

Transaction History:
${input.transactionHistory}

Calendar Events:
${input.calendarEvents}

Based on this information, do two things:
1. Generate a text forecast with specific, actionable recommendations for the user.
2. Generate a projectionData array containing the user daily projected balance for the next 30 days. Start with the last known balance from transactions and project forward, accounting for upcoming bills and income.

Respond in JSON format with the following structure:
{
  "forecast": "forecast text with recommendations",
  "projectionData": [
    {"date": "YYYY-MM-DD", "balance": number},
    ...
  ]
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
  return ForecastCashFlowOutputSchema.parse(parsed);
}
