import type { ExtensionContext } from 'coc.nvim';
import { ModelManager } from './models';
import { ToolManager } from './tools';
import type {
  CancellationToken,
  Disposable,
  LanguageModelChat,
  LanguageModelChatSelector,
  LanguageModelTool,
  LanguageModelToolInvocationOptions,
  LanguageModelToolResult,
  LmApi,
} from './types';

// Re-export types for external use
export type {
  CancellationToken,
  Disposable,
  Event,
  LanguageModelChat,
  LanguageModelChatRequestOptions,
  LanguageModelChatResponse,
  LanguageModelChatSelector,
  LanguageModelChatTool,
  LanguageModelChatToolMode,
  LanguageModelTool,
  LanguageModelToolInformation,
  LanguageModelToolInvocationOptions,
  LanguageModelToolInvocationToken,
  LanguageModelToolResult,
  LanguageModelToolResultPart,
  LmApi,
} from './types';

// Re-export classes and enums for external use
export {
  LanguageModelChatMessage,
  LanguageModelChatMessageRole,
  LanguageModelError,
  LanguageModelTextPart,
  LanguageModelToolCallPart,
} from './types';

function createLmApi(): LmApi {
  const toolManager = new ToolManager();
  const modelManager = new ModelManager();

  return {
    get tools() {
      return toolManager.tools;
    },

    get onDidChangeChatModels() {
      return modelManager.onDidChangeChatModels;
    },

    selectChatModels: async (selector: LanguageModelChatSelector = {}) => {
      return modelManager.select(selector);
    },

    registerTool: <T>(name: string, tool: LanguageModelTool<T>): Disposable => {
      return toolManager.registerTool(name, tool);
    },

    invokeTool: async (
      name: string,
      options: LanguageModelToolInvocationOptions<object>,
      token?: CancellationToken
    ): Promise<LanguageModelToolResult> => {
      return toolManager.invokeTool(name, options, token);
    },

    registerChatModel: (model: LanguageModelChat) => {
      modelManager.register(model);
    },

    unregisterChatModel: (modelId: string) => {
      return modelManager.unregister(modelId);
    },

    getRegisteredModels: () => {
      return modelManager.getAll();
    },
  };
}

export async function activate(_context: ExtensionContext): Promise<LmApi> {
  console.log('LM API extension activation started');
  const lmApi = createLmApi();
  console.log('LM API: Created lmApi instance');
  console.log('LM API extension activation completed');
  return lmApi;
}
