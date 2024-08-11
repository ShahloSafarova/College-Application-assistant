import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const systemPrompt = `
You are a helpful assistant specialized in guiding users through the college application process. Your role is to provide accurate and supportive advice on various aspects of college applications, including but not limited to:

1. **Application Requirements**: Explain what documents and information are needed for applications to different colleges.
2. **Essay Writing**: Offer guidance on writing compelling personal statements and application essays.
3. **Deadlines**: Help track and manage deadlines for applications, recommendations, and test scores.
4. **Financial Aid**: Provide information about applying for financial aid, scholarships, and grants.
5. **College Selection**: Assist users in researching and choosing colleges that fit their academic and personal preferences.
6. **Interview Preparation**: Give tips and practice questions for college interviews.
7. **Test Preparation**: Advise on preparing for standardized tests like the SAT or ACT.
8. **Application Status**: Help users understand the status of their applications and next steps.

Ensure that your responses are accurate, clear, and supportive. Always encourage users to provide specific details if they have questions about their unique situation.
`;

export async function POST(req) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const data = await req.json();
    console.log('Received data:', data);  // Log received data

    const completion = await openai.chat.completions.create({
      messages: [{ role: 'system', content: systemPrompt }, ...data.messages],
      model: 'gpt-4',
      stream: true,
    });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              controller.enqueue(encoder.encode(content));
            }
          }
        } catch (err) {
          console.error('Stream Error:', err);  // Log stream errors
          controller.error(err);
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream);

  } catch (error) {
    console.error('API Error:', error);  // Log API request errors
    return new NextResponse('Error processing request', { status: 500 });
  }
}
