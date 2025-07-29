// Tool management for Language Model API

import {
  type CancellationToken,
  CancellationTokenSource,
  type Disposable,
  Emitter,
  type Event,
} from 'coc.nvim';
import { channel } from './log';
import type {
  LanguageModelTool,
  LanguageModelToolInvocationOptions,
  LanguageModelToolResult,
} from './types';

export class ToolManager {
  private tools = new Map<string, LanguageModelTool<unknown>>();
  private _onDidChangeTools = new Emitter<void>();

  readonly onDidChangeTools: Event<void> = this._onDidChangeTools.event;

  register<T>(tool: LanguageModelTool<T>): Disposable {
    channel.appendLine(`LM API: Registering tool: ${tool.information.name}`);
    this.tools.set(tool.information.name, tool);
    channel.appendLine(`LM API: Tool '${tool.information.name}' registered successfully`);
    this._onDidChangeTools.fire();

    return {
      dispose: () => this.unregister(tool.information.name),
    };
  }

  unregister(name: string): boolean {
    channel.appendLine(`LM API: Unregistering tool '${name}'`);
    const existed = this.tools.delete(name);
    if (!existed) {
      channel.appendLine(`LM API: Tool '${name}' not found for unregistration`);
      return false;
    }

    channel.appendLine(`LM API: Tool '${name}' unregistered successfully`);
    this._onDidChangeTools.fire();
    return true;
  }

  async invoke(
    name: string,
    options: LanguageModelToolInvocationOptions<unknown>,
    token?: CancellationToken
  ): Promise<LanguageModelToolResult> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool '${name}' not found`);
    }
    if (token?.isCancellationRequested) {
      throw new Error('Tool invocation was cancelled');
    }

    channel.appendLine(`LM API: Invoking tool '${name}' with options: ${JSON.stringify(options)}`);
    return await tool.invoke(options, token ?? new CancellationTokenSource().token);
  }

  getAll(): readonly LanguageModelTool<unknown>[] {
    return Array.from(this.tools.values());
  }

  dispose(): void {
    this.tools.clear();
    this._onDidChangeTools.dispose();
  }
}
