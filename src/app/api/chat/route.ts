import { ai, defaultModel } from '@/ai/openrouter';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { message } = await request.json();

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        const apiResponse = await ai.chat.completions.create({
            model: defaultModel,
            messages: [{
                role: 'user',
                content: message,
            }],
        });

        const response = apiResponse.choices[0].message;

        return NextResponse.json({
            content: response.content,
        });
    } catch (error: any) {
        console.error('Error calling OpenRouter:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to get AI response' },
            { status: 500 }
        );
    }
}
