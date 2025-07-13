import { Emitter } from 'coc.nvim';
import type { Event, LanguageModelChat, LanguageModelChatSelector } from './types';

export class ModelManager {
  private models = new Map<string, LanguageModelChat>();
  private _onDidChangeChatModels = new Emitter<void>();

  readonly onDidChangeChatModels: Event<void> = this._onDidChangeChatModels.event;

  register(model: LanguageModelChat): void {
    console.log(
      `LM API: Registering model ${model.id} (vendor: ${model.vendor}, family: ${model.family})`
    );
    this.models.set(model.id, model);
    console.log(
      `LM API: Model ${model.id} registered successfully. Total models: ${this.models.size}`
    );
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
    console.log('LM API: Selecting models with selector:', selector);
    const allModels = Array.from(this.models.values());
    console.log(`LM API: Total available models: ${allModels.length}`);

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

    console.log(
      `LM API: Selected ${filteredModels.length} models:`,
      filteredModels.map((m) => m.id)
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
