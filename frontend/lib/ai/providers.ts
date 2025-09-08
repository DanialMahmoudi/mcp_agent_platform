import { customProvider } from 'ai';
import { createOllama } from 'ai-sdk-ollama';
import {
  artifactModel,
  chatModel,
  reasoningModel,
  titleModel,
} from './models.test';
import { isTestEnvironment } from '../constants';

// Create an Ollama provider instance
const ollamaInstance = createOllama({
  baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434', // your local Ollama server
});

export const myProvider = isTestEnvironment
  ? customProvider({
      languageModels: {
        'chat-model': ollamaInstance('llama3.2:latest'), // simple chat model
        'chat-model-reasoning': ollamaInstance('qwen3:14b', { reasoning: true }), // reasoning model
        'title-model': ollamaInstance('llama3.2:latest'),
        'artifact-model': ollamaInstance('llama3.2:latest'),
      },
    })
  : customProvider({
      languageModels: {
        'chat-model': ollamaInstance('llama3.2:latest'), // simple chat model
        'chat-model-reasoning': ollamaInstance('qwen3:14b', { reasoning: true }), // reasoning model
        'title-model': ollamaInstance('llama3.2:latest'),
        'artifact-model': ollamaInstance('llama3.2:latest'),
      },
    });
