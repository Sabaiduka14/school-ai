import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
if (!apiKey) {
    console.error("GOOGLE_GEMINI_API_KEY is not set in the environment variables");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
});

async function runWithText(prompt: string) {
    try {
        const enhancedPrompt = `
Answer the following question based on the subject it relates to. 
        - If the question involves mathematical or scientific concepts, format your response using LaTeX math notation.
          - Enclose inline math expressions with single dollar signs ($...$).
          - Enclose block math expressions with double dollar signs ($$...$$).
        - If the question relates to history, literature, or any other non-mathematical topic, provide a clear, concise, and well-structured answer.
        
        Problem: ${prompt}

        Provide a step-by-step explanation if necessary, and ensure that all mathematical expressions are formatted properly in LaTeX.
`;

        const result = await model.generateContent(enhancedPrompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error in runWithText:", error);
        throw new Error(`Error in text processing: ${(error as Error).message}`);
    }
}

async function runWithImage(imageBuffer: ArrayBuffer, mimeType: string) {
    try {
        const prompt = `
Analyze the problem in this image and provide a clear and detailed solution. 
- If the problem involves math, physics, or scientific calculations, format your response using LaTeX math notation.
  - Enclose inline math expressions with single dollar signs ($...$).
  - Enclose block math expressions with double dollar signs ($$...$$).
  
- If the problem involves a non-mathematical subject (e.g., history or literature), provide a well-explained, step-by-step answer in plain text.

Ensure that all mathematical expressions are properly formatted, and provide a clear, step-by-step explanation regardless of the subject.
`;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: Buffer.from(imageBuffer).toString('base64'),
                    mimeType: mimeType
                }
            }
        ]);

        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error in runWithImage:", error);
        throw new Error(`Error in image processing: ${(error as Error).message}`);
    }
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const prompt = formData.get("prompt") as string;
        const image = formData.get("image") as File | null;

        let response;
        if (image) {
            const imageBuffer = await image.arrayBuffer();
            response = await runWithImage(imageBuffer, image.type);
        } else {
            response = await runWithText(prompt);
        }

        return NextResponse.json({ response });
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json(
            { error: `Server error: ${(error as Error).message}` },
            { status: 500 }
        );
    }
}