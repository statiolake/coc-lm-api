import { type Disposable, Emitter, type Event } from 'coc.nvim';
import type { LanguageModelChat, LanguageModelChatSelector } from './types';

export class ModelManager {
  private models = new Map<string, LanguageModelChat>();
  private _onDidChangeChatModels = new Emitter<void>();

  readonly onDidChangeChatModels: Event<void> = this._onDidChangeChatModels.event;

  register(model: LanguageModelChat): Disposable {
    console.log('LM API: Registering model:', model);
    this.models.set(model.id, model);
    console.log(`LM API: Model ${model.id} registered successfully`);
    this._onDidChangeChatModels.fire();

    return {
      dispose: () => this.unregister(model.id),
    };
  }

  unregister(modelId: string): boolean {
    console.log(`LM API: Unregistering model ${modelId}`);
    const existed = this.models.delete(modelId);
    if (!existed) {
      console.log(`LM API: Model ${modelId} not found for unregistration`);
      return false;
    }

    console.log(`LM API: Model ${modelId} unregistered successfully`);
    this._onDidChangeChatModels.fire();
    return true;
  }

  select(selector: LanguageModelChatSelector = {}): LanguageModelChat[] {
    console.log('LM API: Selecting models with selector:', selector);
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
