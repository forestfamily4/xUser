import { Mistral } from "@mistralai/mistralai";
import { System, Answer, Model } from "./api";
import { ChatCompletionResponse } from "@mistralai/mistralai/models/components";

const token = process.env["GITHUB_TOKEN"];
const endpoint = "https://models.inference.ai.azure.com";
const client = new Mistral({
  apiKey: token,
  serverURL: endpoint,
});

export async function runMistral(
  model: Model,
  message: string,
  system: System,
): Promise<Answer> {
  let response: ChatCompletionResponse | null = null;
  let errorMessage = "error";
  try {
    response = await client.chat.complete({
      messages: [
        { role: "system", content: system.systemMessage ?? "" },
        { role: "user", content: message },
      ],
      model: model,
      temperature: 1,
      maxTokens: 1000,
      topP: 1,
    });
    console.log(response);
  } catch (e: any) {
    errorMessage = e.toString();
  }
  return {
    content: response?.choices?.[0].message.content?.toString() ?? undefined,
    error: errorMessage,
  };
}
