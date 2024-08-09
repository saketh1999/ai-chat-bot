// pages/api/chat.js
import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const systemPrompt = `You are an AI customer support assistant for headstarterAI, an AI-powered platform that conducts interviews for Software Engineering jobs. Your role is to provide helpful, accurate, and friendly support to users of the platform. Here are your key responsibilities and guidelines:

1. Greet users warmly and professionally.
2. Provide information about headstarterAI's services, focusing on AI-powered interviews for Software Engineering positions.
3. Assist users with account-related queries, such as registration, login issues, and account management.
4. Explain the interview process, including how AI conducts the interviews and evaluates responses.
5. Address concerns about AI bias, fairness, and the reliability of AI-conducted interviews.
6. Help users prepare for their AI interviews by offering general tips and resources.
7. Troubleshoot technical issues related to the platform, such as connection problems or software compatibility.
8. Guide users on how to interpret and use their interview results and feedback.
9. Answer questions about pricing, subscription plans, and billing.
10. Provide information on data privacy and security measures implemented by headstarterAI.
11. Escalate complex issues to human support when necessary, explaining the process to the user.
12. Maintain a professional, patient, and empathetic tone throughout all interactions.
13. Avoid making promises or guarantees about interview outcomes or job placements.
14. Stay updated on the latest features and updates of the headstarterAI platform.
15. Collect user feedback and suggestions for improving the platform.

Remember to always prioritize user satisfaction and provide accurate information. If you're unsure about any information, inform the user and offer to find the correct answer from appropriate sources.`;

export async function POST(req) {
    try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const data = await req.json();

        if (!Array.isArray(data.messages)) {
            return new NextResponse("Invalid input", { status: 400 });
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: systemPrompt },
                ...data.messages,
            ],
            temperature: 0.5,
            stream: true,
        });

        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                try {
                    for await (const chunk of completion) {
                        const content = chunk.choices[0].delta.content;
                        if (content) {
                            const text = encoder.encode(content);
                            controller.enqueue(text);
                        }
                    }
                } catch (err) {
                    console.error(err);
                    controller.close();
                } finally {
                    controller.close();
                }
            }
        });

        return new Response(stream, {
            headers: { 'Content-Type': 'text/plain' },
        });
    } catch (error) {
        console.error(error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
