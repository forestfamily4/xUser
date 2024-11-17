import { runAzure } from "./azure";

export const models = [
  "cohere-command-r-plus",
  "Mistral-large-2407",
  "AI21-Jamba-1.5-Large",
] as const;
export type Model = (typeof models)[number];
const initModel: Model = "AI21-Jamba-1.5-Large";
export type System = {
  systemMessage?: string;
  model: Model;
};
export type Answer = {
  content?: string;
  error?: string;
};

export async function getSystem(): Promise<System> {;
  return {
    systemMessage: process.env.SYSTEM_MESSAGE,
    model: initModel,
  };
}

export async function runAI(
  content: string,
): Promise<Answer> {
  const system = await getSystem();
  const model = system.model;
  return runAzure(model, content, system);
}
