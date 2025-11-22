/**
 * Test utilities for Valdi components
 * Provides helpers for testing Valdi-based components with Jest
 */

import { Component, StatefulComponent } from 'valdi_core/src/Component';

/**
 * Mock render function for testing Valdi components
 * Since Valdi components don't run in a real environment during tests,
 * we extract their render output for testing
 */
export function renderComponent<P>(
  ComponentClass: new (props: P) => Component<P>,
  props: P,
): any {
  const instance = new ComponentClass(props);
  return instance.onRender();
}

/**
 * Mock render function for stateful components
 */
export function renderStatefulComponent<P, S>(
  ComponentClass: new (props: P) => StatefulComponent<P, S>,
  props: P,
): {
  instance: StatefulComponent<P, S>;
  render: () => any;
} {
  const instance = new ComponentClass(props);
  return {
    instance,
    render: () => instance.onRender(),
  };
}

/**
 * Extract component tree structure for assertions
 */
export function extractComponentTree(element: any): any {
  if (!element) return null;

  if (typeof element === 'string' || typeof element === 'number') {
    return element;
  }

  if (Array.isArray(element)) {
    return element.map(extractComponentTree);
  }

  if (typeof element === 'object') {
    if (element.type) {
      return {
        type: element.type,
        props: element.props,
        children: element.children ? extractComponentTree(element.children) : null,
      };
    }
  }

  return element;
}

/**
 * Mock event handler for testing
 */
export function createMockEventHandler(): jest.Mock {
  return jest.fn();
}

/**
 * Wait for async operations in component
 */
export async function waitForAsync(ms: number = 0): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Assert that a component renders without throwing
 */
export function assertComponentRenders<P>(
  ComponentClass: new (props: P) => Component<P>,
  props: P,
): void {
  expect(() => renderComponent(ComponentClass, props)).not.toThrow();
}

/**
 * Mock localStorage for tests
 */
export class MockLocalStorage {
  private store: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.store.get(key) || null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  get length(): number {
    return this.store.size;
  }

  key(index: number): string | null {
    const keys = Array.from(this.store.keys());
    return keys[index] || null;
  }
}

/**
 * Create mock navigation controller for tests
 */
export function createMockNavigationController(): any {
  return {
    push: jest.fn(),
    pop: jest.fn(),
    popToRoot: jest.fn(),
    replace: jest.fn(),
    present: jest.fn(),
    dismiss: jest.fn(),
  };
}

/**
 * Spy on component method
 */
export function spyOnMethod<T extends object>(
  obj: T,
  method: keyof T,
): jest.SpyInstance {
  return jest.spyOn(obj as any, method as string);
}

/**
 * Create mock AI SDK streaming response
 */
export function createMockStreamResponse(tokens: string[]): AsyncIterable<string> {
  return {
    async *[Symbol.asyncIterator]() {
      for (const token of tokens) {
        yield token;
      }
    },
  };
}

/**
 * Create mock AI SDK generateText response
 */
export function createMockGenerateResponse(text: string, usage?: any) {
  return {
    text,
    usage: usage || {
      promptTokens: 10,
      completionTokens: 20,
      totalTokens: 30,
    },
    finishReason: 'stop' as const,
  };
}
