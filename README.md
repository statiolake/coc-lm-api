# @statiolake/coc-lm-api

Language Model API interface for coc.nvim extensions that provides a unified interface for accessing and managing language models.

## Overview

This extension provides a bridge between language model providers and consumer extensions, allowing for a clean separation of concerns and standardized API access.

## Features

- **Unified Language Model Interface**: Standardized API for chat models across different providers
- **Tool System**: Framework for registering and invoking tools that language models can use
- **Model Management**: Registration and selection of available language models
- **Type Safety**: Full TypeScript support with comprehensive type definitions

## Installation

```bash
:CocInstall @statiolake/coc-lm-api
```

## API Overview

### Core Interfaces

#### `LanguageModelChat`
Interface for chat-capable language models with streaming support:

```typescript
interface LanguageModelChat {
  readonly id: string;
  readonly vendor: string;
  readonly family: string;
  
  sendRequest(
    messages: LanguageModelChatMessage[],
    options?: LanguageModelChatRequestOptions,
    token?: CancellationToken
  ): Promise<LanguageModelChatResponse>;
}
```

#### `LmApi`
Main API interface for extension integration:

```typescript
interface LmApi {
  // Model management
  registerChatModel(model: LanguageModelChat): void;
  selectChatModels(selector?: LanguageModelChatSelector): LanguageModelChat[];
  
  // Tool system
  registerTool(name: string, tool: LanguageModelTool): void;
  invokeTool(name: string, options: LanguageModelToolInvocationOptions): Promise<LanguageModelToolResult>;
  
  // Event handling
  onDidChangeChatModels: Event<void>;
}
```

### Message System

Messages support rich content types:

```typescript
class LanguageModelChatMessage {
  static User(content: Array<LanguageModelTextPart | LanguageModelToolResultPart>): LanguageModelChatMessage;
  static Assistant(content: Array<LanguageModelTextPart | LanguageModelToolCallPart>): LanguageModelChatMessage;
}
```

### Tool System

Register tools that language models can invoke:

```typescript
lmApi.registerTool('getCurrentTime', {
  name: 'getCurrentTime',
  description: 'Get the current date and time',
  inputSchema: {
    type: 'object',
    properties: {}
  },
  invoke: async () => {
    return {
      content: [new LanguageModelTextPart(new Date().toISOString())]
    };
  }
});
```

## Usage for Extension Developers

### Accessing the API

```typescript
import type { LmApi } from '@statiolake/coc-lm-api';

export async function activate(context: ExtensionContext): Promise<void> {
  // Get LM API from the extension
  const lmApiExtension: Extension<LmApi> = extensions.getExtensionById('@statiolake/coc-lm-api');
  const lmApi: LmApi = lmApiExtension.exports;
  
  // Use the API...
}
```

### Registering a Language Model

```typescript
class MyLanguageModel implements LanguageModelChat {
  readonly id = 'my-model';
  readonly vendor = 'MyProvider';
  readonly family = 'my-family';
  
  async sendRequest(messages, options, token) {
    // Implement your model logic
  }
}

lmApi.registerChatModel(new MyLanguageModel());
```

### Using Language Models

```typescript
const models = lmApi.selectChatModels({ vendor: 'GitHub' });
if (models.length > 0) {
  const response = await models[0].sendRequest([
    LanguageModelChatMessage.User([
      new LanguageModelTextPart('Hello, how are you?')
    ])
  ]);
  
  // Process streaming response
  for await (const part of response.stream) {
    if (part instanceof LanguageModelTextPart) {
      console.log(part.value);
    }
  }
}
```

## Extension Dependencies

This extension serves as a foundation for other language model extensions:

- **[@statiolake/coc-github-copilot](https://www.npmjs.com/package/@statiolake/coc-github-copilot)**: GitHub Copilot integration
- **[@statiolake/coc-lm-chat](https://www.npmjs.com/package/@statiolake/coc-lm-chat)**: Interactive chat interface

## License

MIT

## Repository

[GitHub](https://github.com/statiolake/coc-github-copilot)