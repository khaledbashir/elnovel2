"use client";

import { generateId } from "ai";
import { createStreamableValue } from "ai/rsc";
import { CoreMessage, streamText } from "ai";
import { openai } from "@/lib/ai/openai";
import {
  deleteMessagesByChatIdAfterTimestamp,
  getMessageById,
} from "@/lib/db/queries";

export async function continueConversation(messages: CoreMessage[]) {
  const result = await streamText({
    model: openai("gpt-4-turbo"),
    messages,
  });

  const stream = createStreamableValue(result.textStream);
  return stream.value;
}

export async function deleteTrailingMessages({ id }: { id: string }) {
  const [message] = await getMessageById({ id });

  if (message) {
    await deleteMessagesByChatIdAfterTimestamp({
      chatId: message.chatId,
      timestamp: message.createdAt,
    });
  }
}
