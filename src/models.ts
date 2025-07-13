import { Emitter } from 'coc.nvim';
import type { Event, LanguageModelChat, LanguageModelChatSelector } from './types';

export class ModelManager {
  private models = new Map<string, LanguageModelChat>();
  private _onDidChangeChatModels = new Emitter<void>();

  readonly onDidChangeChatModels: Event<void> = this._onDidChangeChatModels.event;

  register(model: LanguageModelChat): void {
    this.models.set(model.id, model);
    this._onDidChangeChatModels.fire();
  }

  unregister(modelId: string): boolean {
    const existed = this.models.delete(modelId);
    if (existed) {
      this._onDidChangeChatModels.fire();
    }
    return existed;
  }

  select(selector: LanguageModelChatSelector = {}): LanguageModelChat[] {
    const allModels = Array.from(this.models.values());

    return allModels.filter((model) => {
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
  }

  getAll(): LanguageModelChat[] {
    return Array.from(this.models.values());
  }

  dispose(): void {
    this.models.clear();
    this._onDidChangeChatModels.dispose();
  }
}
