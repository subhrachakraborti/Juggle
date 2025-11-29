import OpenAI from 'openai';

export const ai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '',
  dangerouslyAllowBrowser: false,
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:1800' || '*.devtunnels.ms',
    'X-Title': 'Juggle Finance App',
  },
});

export const defaultModel = 'nvidia/nemotron-nano-12b-v2-vl:free';
