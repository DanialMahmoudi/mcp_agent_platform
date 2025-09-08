export const DEFAULT_CHAT_MODEL: string = 'llama3.2:latest'; // Default to Llama 3.2

export interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'chat-model',
    name: 'Llama 3.2',
    description: 'Lightweight and fast model for general-purpose tasks.',
  },
  {
    id: 'chat-model-reasoning',
    name: 'Llama 3.2 Reasoning',
    description: 'Uses advanced chain-of-thought reasoning for complex problems',
  },
];
