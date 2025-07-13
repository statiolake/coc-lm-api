import type { CancellationToken, Disposable, ExtensionContext } from 'coc.nvim';
import { ModelManager } from './models';
import { ToolManager } from './tools';
import type {
  LanguageModelChat,
  LanguageModelChatSelector,
  LanguageModelTool,
  LanguageModelToolInvocationOptions,
  LanguageModelToolResult,
  LmApi,
} from './types';

// Re-export types for external use
export type {
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
      return toolManager.getAll().map((tool) => tool.information);
    },

    get onDidChangeChatModels() {
      return modelManager.onDidChangeChatModels;
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

    selectChatModels: async (selector: LanguageModelChatSelector = {}) => {
      return modelManager.select(selector);
    },

    registerTool: <T>(name: string, tool: LanguageModelTool<T>): Disposable => {
      // Actually, the `name` parameter is redundant with the current
      // coc-lm-api API interface since we have `tool.information.name`. The
      // signature is kept for compatibility with VS Code's LM API, where the
      // tool information isn't given in tool definition (instead it is given
      // as a one of contributions in package.json.)
      if (name !== tool.information.name) {
        throw new Error(
          `Tool name '${name}' does not match tool information name '${tool.information.name}'`
        );
      }

      return toolManager.register(tool);
    },

    invokeTool: async (
      name: string,
      options: LanguageModelToolInvocationOptions<object>,
      token?: CancellationToken
    ): Promise<LanguageModelToolResult> => {
      return toolManager.invoke(name, options, token);
    },
  };
}

export async function activate(_context: ExtensionContext): Promise<LmApi> {
  return createLmApi();
}
