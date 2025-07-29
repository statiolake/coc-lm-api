import { type Disposable, Emitter, type Event } from 'coc.nvim';
import { channel } from './log';
import type { LanguageModelChat, LanguageModelChatSelector } from './types';

export class ModelManager {
  private models = new Map<string, LanguageModelChat>();
  private _onDidChangeChatModels = new Emitter<void>();

  readonly onDidChangeChatModels: Event<void> = this._onDidChangeChatModels.event;

  register(model: LanguageModelChat): Disposable {
    channel.appendLine(`LM API: Registering model: ${model.id}`);
    this.models.set(model.id, model);
    channel.appendLine(`LM API: Model ${model.id} registered successfully`);
    this._onDidChangeChatModels.fire();

    return {
      dispose: () => this.unregister(model.id),
    };
  }

  unregister(modelId: string): boolean {
    channel.appendLine(`LM API: Unregistering model ${modelId}`);
    const existed = this.models.delete(modelId);
    if (!existed) {
      channel.appendLine(`LM API: Model ${modelId} not found for unregistration`);
      return false;
    }

    channel.appendLine(`LM API: Model ${modelId} unregistered successfully`);
    this._onDidChangeChatModels.fire();
    return true;
  }

  select(selector: LanguageModelChatSelector = {}): LanguageModelChat[] {
    channel.appendLine(`LM API: Selecting models with selector: ${JSON.stringify(selector)}`);
    const allModels = Array.from(this.models.values());

    const filteredModels = allModels.filter((model) => {
      if (selector.vendor && model.vendor !== selector.vendor) {
        return false;
      }
      if (selector.family && model.family !== selector.family) {
        return false;
      }
      if (selector.id && model.id !== selector.id) {
        return false;
      }
      if (selector.version && model.version !== selector.version) {
        return false;
      }
      return true;
    });

    channel.appendLine(
      `LM API: Selected ${filteredModels.length} models: ${filteredModels.map((m) => m.id).join(', ')}`
    );
    return filteredModels;
  }

  getAll(): LanguageModelChat[] {
    return Array.from(this.models.values());
  }

  dispose(): void {
    this.models.clear();
    this._onDidChangeChatModels.dispose();
  }
}
