import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

export async function askLLM(systemPrompt: string, userQuestion: string): Promise<string> {
  const resp = await client.chat.completions.create({
    model: "deepseek-v4-flash",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userQuestion },
    ],
    max_tokens: 512,
  });
  return resp.choices[0].message.content ?? "";
}
