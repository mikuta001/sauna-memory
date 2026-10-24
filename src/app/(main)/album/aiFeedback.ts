import "server-only";

import OpenAI from "openai";
import { type UserRecord } from "./page";

export async function getAIFeedback(userRecords: UserRecord[]) {
  const client = new OpenAI();
  const data = JSON.stringify(userRecords);

  console.log("called ai feedback!!!");

  const response = await client.responses.create({
    model: "gpt-6-astra",
    input: data,
    instructions:  "入力された集計データ(サウナ活動記録)をもとに、日本語で、モチベーションが上がる、短い振り返りを書いてください。データにない事実は追加しないでください。",
  });

  // const response = "feedback script from openai!!!!!";

  return response.output_text;
}
