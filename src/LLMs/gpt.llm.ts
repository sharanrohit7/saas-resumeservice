import axios from "axios";
import { LLMModel } from "../../Interface/llm";

async function callOpenAI(model: LLMModel, prompt: string): Promise<string> {
    const res = await axios.post(
      model.endpoint || 'https://api.openai.com/v1/chat/completions',
      {
        model: model.name,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${model.apiKey}`,
        },
      }
    );
    return res.data.choices[0].message.content;
  }
  