import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  const { message, history } = await req.json();
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  const chat = model.startChat({
    history: (history || []).map((h: any) => ({
      role: h.role,
      parts: [{ text: h.text }],
    })),
    systemInstruction:
      "You are a patient, encouraging English teacher. Answer grammar questions, explain rules with examples, correct paragraphs, and improve emails when asked. Keep explanations simple for beginners.",
  });

  const result = await chat.sendMessage(message);
  return Response.json({ reply: result.response.text() });
}
