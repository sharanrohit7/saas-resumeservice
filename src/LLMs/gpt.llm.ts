import axios from "axios";
import { LLMModel } from "../../Interface/llm";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.CHATGPT_API_KEY,
  organization: process.env.organization,
  project: process.env.project,
  maxRetries: 3, // This is the default and can be omitted
});

const retryDelayMs = 5000; // Set your desired delay between retries (in milliseconds)

export async function callGPTLLM(prompt: any,model: string): Promise<any> {
  let retries = 0;

  while (retries <= openai.maxRetries) {
    try {
      const chatCompletion = await openai.chat.completions.create({
        messages: [{ role: "system", content: prompt }],
        model:model,
      });
      // console.log(chatCompletion.choices[0].message.content);
      console.dir(chatCompletion.usage?.completion_tokens_details)
      console.log(chatCompletion.usage?.prompt_tokens);
      console.log("Total tokens",chatCompletion.usage?.total_tokens)
      return chatCompletion.choices[0].message;
    } catch (error: any) {
      if (error instanceof OpenAI.APIError) {
        switch (error.status) {
          case 400:
            throw new Error(
              "Bad Request: The request was unacceptable, often due to missing a required parameter.",
            );
          case 401:
            throw new Error("Unauthorized: No valid API key provided.");
          case 403:
            throw new Error(
              "Forbidden: The API key doesn't have permissions to perform the request.",
            );
          case 404:
            throw new Error("Not Found: The requested resource doesn't exist.");
          case 429:
            throw new Error(
              "Too Many Requests: Too many requests hit the API too quickly.",
            );
          case 500:
          case 502:
          case 503:
          case 504:
            throw new Error(
              "Server Errors: Something went wrong on OpenAI's end.",
            );
          default:
            throw new Error(`Unexpected Error: ${error.message}`);
        }
      } else {
        throw new Error(`Unknown Error: ${error.message}`);
      }
    }
  }

  throw new Error("Exceeded maximum number of retries.");
}