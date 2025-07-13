import type { ExtensionContext } from 'coc.nvim';
import { ModelManager } from './models';
import { ToolManager } from './tools';
import type {
  CancellationToken,
  Disposable,
  Event,
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
  LanguageModelChatMessage,
  LanguageModelChatMessageRole,
  LanguageModelChatRequestOptions,
  LanguageModelChatResponse,
  LanguageModelChatSelector,
  LanguageModelChatTool,
  LanguageModelChatToolMode,
  LanguageModelError,
  LanguageModelTextPart,
  LanguageModelTool,
  LanguageModelToolCallPart,
  LanguageModelToolInformation,
  LanguageModelToolInvocationOptions,
  LanguageModelToolInvocationToken,
  LanguageModelToolResult,
  LanguageModelToolResultPart,
  LmApi,
} from './types';

export function createLmApi(): LmApi {
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

export async function activate(context: ExtensionContext): Promise<LmApi> {
  const lmApi = createLmApi();
  return lmApi;
}
