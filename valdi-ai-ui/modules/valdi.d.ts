/**
 * Valdi Framework Global Type Declarations
 *
 * This file provides TypeScript type declarations for the Valdi framework,
 * including JSX configuration, module declarations, and global types.
 */

/// <reference types="node" />

// ============================================================================
// JSX Configuration
// ============================================================================

declare global {
  /**
   * Global JSX factory function for creating Valdi elements
   * Configured via tsconfig.json: "jsxFactory": "$createElement"
   */
  function $createElement(type: any, props: any, ...children: any[]): any;

  /**
   * Global JSX fragment component for Valdi
   * Configured via tsconfig.json: "jsxFragmentFactory": "$Fragment"
   */
  const $Fragment: any;

  /**
   * JSX namespace for Valdi intrinsic elements and type definitions
   */
  namespace JSX {
    /**
     * Intrinsic elements available in Valdi JSX
     * These map to Valdi's native UI elements
     */
    interface IntrinsicElements {
      view: import('valdi_tsx/src/NativeTemplateElements').ViewProps;
      layout: import('valdi_tsx/src/NativeTemplateElements').ViewProps;
      scroll: import('valdi_tsx/src/NativeTemplateElements').ScrollViewProps;
      scrollView: import('valdi_tsx/src/NativeTemplateElements').ScrollViewProps;
      label: import('valdi_tsx/src/NativeTemplateElements').LabelProps;
      textfield: import('valdi_tsx/src/NativeTemplateElements').TextInputProps;
      textInput: import('valdi_tsx/src/NativeTemplateElements').TextInputProps;
      textview: import('valdi_tsx/src/NativeTemplateElements').TextInputProps;
      image: import('valdi_tsx/src/NativeTemplateElements').ImageProps;
      video: import('valdi_tsx/src/NativeTemplateElements').ViewProps;
      shape: import('valdi_tsx/src/NativeTemplateElements').ViewProps;
      blur: import('valdi_tsx/src/NativeTemplateElements').ViewProps;
      spinner: import('valdi_tsx/src/NativeTemplateElements').ViewProps;
      animatedimage: import('valdi_tsx/src/NativeTemplateElements').ImageProps;
      slot: import('valdi_tsx/src/NativeTemplateElements').ViewProps;
    }

    /**
     * Defines which property on a component class contains its props type
     */
    interface ElementAttributesProperty {
      viewModel: unknown;
    }

    /**
     * Defines which property contains children
     */
    interface ElementChildrenAttribute {
      children?: unknown;
    }

    /**
     * Base class for JSX class components
     */
    interface ElementClass {
      viewModel?: unknown;
      context?: unknown;
      onRender(): void;
    }

    /**
     * Attributes available for all JSX elements
     */
    interface IntrinsicAttributes {
      children?: unknown;
      key?: string;
    }

    /**
     * Attributes available for class-based components
     */
    interface IntrinsicClassAttributes<T> {
      key?: string;
      ref?: any;
      context?: any;
    }

    /**
     * Element type for JSX expressions
     */
    type Element = any;
  }
}

// ============================================================================
// Valdi Core Module Declarations
// ============================================================================

/**
 * Valdi Core Component Module Type Extensions
 * Provides additional type information for Valdi components
 * Note: Actual implementations are in __mocks__ via tsconfig path mappings
 */
declare module 'valdi_core/src/Component' {
  import type { IRenderer } from 'valdi_core/src/IRenderer';

  /**
   * Component interface - extends the mock implementation
   * @template ViewModel - The component's props/view model type
   * @template ComponentContext - The component's context type
   */
  export interface IComponentExtended<ViewModel = object, ComponentContext = object> {
    readonly viewModel?: Readonly<ViewModel>;
    readonly context?: Readonly<ComponentContext>;
    readonly renderer?: IRenderer;
    onCreate?(): void;
    onRender(): void;
    onDestroy?(): void;
    onViewModelUpdate?(previousViewModel?: Readonly<ViewModel>): void;
    scheduleRender?(): void;
    registerDisposable?(
      disposable: (() => void) | { unsubscribe: () => void },
    ): void;
    registerDisposables?(
      disposables: Array<(() => void) | { unsubscribe: () => void }>,
    ): void;
    setTimeoutDisposable?(handler: () => void, timeout?: number): number;
    isDestroyed?(): boolean;
    animate?(options: any, animations: () => void): void;
    animatePromise?(options: any, animations: () => void): Promise<void>;
    createAnimation?(options: any, animations: () => void): any;
  }

  /**
   * Component constructor type
   */
  export type ComponentConstructor<T = any, ViewModel = any, Context = any> = new (
    viewModel: ViewModel,
    context?: Context,
  ) => T;
}

/**
 * Valdi Style Module Type Extensions
 * Note: Actual implementation is in __mocks__ via tsconfig path mappings
 */
declare module 'valdi_core/src/Style' {
  export type NativeStyle = number;
  export type StyleToNativeFunc = (attributes: any) => NativeStyle;
}

/**
 * Valdi Native Template Elements Module Type Extensions
 * Note: Actual implementations are in __mocks__ via tsconfig path mappings
 */
declare module 'valdi_tsx/src/NativeTemplateElements' {
  // Additional type aliases for compatibility - actual Props interfaces and classes are in mocks
  export type TemplateElement = {
    key?: string;
    ref?: any;
  };

  export type ContainerTemplateElement = TemplateElement & {
    children?: unknown;
  };
}

/**
 * Valdi Navigation Module Type Extensions
 * Note: Actual implementation is in __mocks__ via tsconfig path mappings
 */
declare module 'valdi_navigation/src/NavigationController' {
  export interface NavigationOptions {
    animated?: boolean;
    pageBackgroundColor?: string;
    isPartiallyHiding?: boolean;
  }
}

/**
 * Valdi Navigation Page Component Module
 * Provides type definitions for NavigationPageComponent
 */
declare module 'valdi_navigation/src/NavigationPageComponent' {
  import type { Component, StatefulComponent } from 'valdi_core/src/Component';
  import type { NavigationController } from 'valdi_navigation/src/NavigationController';

  export interface NavigationPageContext {
    navigator: any;
  }

  // Type aliases for NavigationPageComponent (implemented via Component extension in actual code)
  export type NavigationPageComponent<
    ViewModel = any,
    ComponentContext = any
  > = Component<ViewModel, ComponentContext> & {
    navigationController: NavigationController;
  };

  export type NavigationPageStatefulComponent<
    ViewModel = any,
    State = any,
    ComponentContext = any
  > = StatefulComponent<ViewModel, State> & {
    navigationController: NavigationController;
  };
}

/**
 * Valdi HTTP Module
 * Exports HTTPClient for making HTTP requests
 */
declare module 'valdi_http/src/HTTPClient' {
  /**
   * HTTP request options
   */
  export interface HTTPRequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    headers?: Record<string, string>;
    body?: string | object;
    timeout?: number;
  }

  /**
   * HTTP response
   */
  export interface HTTPResponse {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    data: any;
    text: string;
  }

  /**
   * HTTPClient for making HTTP requests
   */
  export class HTTPClient {
    /**
     * Make a GET request
     */
    get(url: string, options?: HTTPRequestOptions): Promise<HTTPResponse>;

    /**
     * Make a POST request
     */
    post(
      url: string,
      body?: any,
      options?: HTTPRequestOptions,
    ): Promise<HTTPResponse>;

    /**
     * Make a PUT request
     */
    put(
      url: string,
      body?: any,
      options?: HTTPRequestOptions,
    ): Promise<HTTPResponse>;

    /**
     * Make a DELETE request
     */
    delete(url: string, options?: HTTPRequestOptions): Promise<HTTPResponse>;

    /**
     * Make a generic HTTP request
     */
    request(url: string, options?: HTTPRequestOptions): Promise<HTTPResponse>;
  }
}

/**
 * Valdi Renderer Module
 */
declare module 'valdi_core/src/IRenderer' {
  export interface IRenderer {
    renderComponent(component: any, renderFunc?: () => void): void;
    registerComponentDisposable(component: any, disposable: any): void;
    isComponentAlive(component: any): boolean;
    animate(options: any, animations: () => void): void;
  }

  export type ComponentDisposable = (() => void) | { unsubscribe: () => void };
}

/**
 * Valdi System Font Module
 */
declare module 'valdi_core/src/SystemFont' {
  export function systemFont(size: number): string;
  export function systemBoldFont(size: number): string;
  export function systemItalicFont(size: number): string;
}

// ============================================================================
// Global Valdi Types
// ============================================================================

/**
 * Common props for all Valdi components
 */
export type ComponentProps<T = {}> = T & {
  children?: React.ReactNode;
  key?: string;
};

/**
 * Props for View elements
 */
export type ViewProps = ComponentProps<{
  style?: any;
  onTap?: () => void;
  onLongPress?: () => void;
}>;

/**
 * Valdi style type helper
 */
export type ValdiStyle<T> = import('valdi_core/src/Style').Style<T>;

/**
 * Valdi component type helper
 */
export type ValdiComponent<
  ViewModel = object,
  Context = object,
> = import('valdi_core/src/Component').Component<ViewModel, Context>;

/**
 * Valdi stateful component type helper
 */
export type ValdiStatefulComponent<
  ViewModel = object,
  State = object,
  Context = object,
> = import('valdi_core/src/Component').StatefulComponent<
  ViewModel,
  State,
  Context
>;

// Export all declarations
export {};
