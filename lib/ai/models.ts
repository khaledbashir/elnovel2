export const DEFAULT_CHAT_MODEL: string = "chat-model";

export type ChatModel = {
  id: string;
  name: string;
  description: string;
};

export const chatModels: ChatModel[] = [
  {
    id: "glm-4.6",
    name: "Z.AI GLM-4.6",
    description: "Advanced general purpose model",
  },
];
