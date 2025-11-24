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
  function $createElement(
    type: any,
    props: any,
    ...children: any[]
  ): any;

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
      view: import('valdi_tsx/src/NativeTemplateElements').View;
      layout: import('valdi_tsx/src/NativeTemplateElements').Layout;
      scroll: import('valdi_tsx/src/NativeTemplateElements').ScrollView;
      scrollView: import('valdi_tsx/src/NativeTemplateElements').ScrollView;
      label: import('valdi_tsx/src/NativeTemplateElements').Label;
      textfield: import('valdi_tsx/src/NativeTemplateElements').TextField;
      textInput: import('valdi_tsx/src/NativeTemplateElements').TextField;
      textview: import('valdi_tsx/src/NativeTemplateElements').TextView;
      image: import('valdi_tsx/src/NativeTemplateElements').ImageView;
      video: import('valdi_tsx/src/NativeTemplateElements').VideoView;
      shape: import('valdi_tsx/src/NativeTemplateElements').ShapeView;
      blur: import('valdi_tsx/src/NativeTemplateElements').BlurView;
      spinner: import('valdi_tsx/src/NativeTemplateElements').SpinnerView;
      animatedimage: import('valdi_tsx/src/NativeTemplateElements').AnimatedImage;
      slot: import('valdi_tsx/src/NativeTemplateElements').Slot;
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
 * Valdi Core Component Module
 * Exports base component classes for building Valdi applications
 */
declare module 'valdi_core/src/Component' {
  import { IRenderer } from 'valdi_core/src/IRenderer';

  /**
   * Base Component class for Valdi applications
   * @template ViewModel - The component's props/view model type
   * @template ComponentContext - The component's context type
   */
  export class Component<ViewModel = object, ComponentContext = object> {
    readonly viewModel: Readonly<ViewModel>;
    readonly context: Readonly<ComponentContext>;
    readonly renderer: IRenderer;

    constructor(renderer: IRenderer, viewModel: ViewModel, componentContext: any);

    /**
     * Called when the component is created for the first time
     */
    onCreate(): void;

    /**
     * Called during render pass - override to define JSX structure
     */
    onRender(): void;

    /**
     * Called when the component is destroyed
     */
    onDestroy(): void;

    /**
     * Called when the view model changes
     */
    onViewModelUpdate(previousViewModel?: Readonly<ViewModel>): void;

    /**
     * Schedule a render for the component
     */
    scheduleRender(): void;

    /**
     * Register a cleanup function to be called on destroy
     */
    registerDisposable(disposable: (() => void) | { unsubscribe: () => void }): void;

    /**
     * Register multiple cleanup functions
     */
    registerDisposables(disposables: Array<(() => void) | { unsubscribe: () => void }>): void;

    /**
     * Set a timeout that auto-clears on component destroy
     */
    setTimeoutDisposable(handler: () => void, timeout?: number): number;

    /**
     * Check if component has been destroyed
     */
    isDestroyed(): boolean;

    /**
     * Animate changes with options
     */
    animate(options: any, animations: () => void): void;

    /**
     * Animate changes and return a promise
     */
    animatePromise(options: any, animations: () => void): Promise<void>;

    /**
     * Create a cancellable animation
     */
    createAnimation(options: any, animations: () => void): any;

    static disallowNullViewModel: boolean;
  }

  /**
   * Stateful Component class with built-in state management
   * @template ViewModel - The component's props/view model type
   * @template State - The component's state type
   * @template ComponentContext - The component's context type
   */
  export class StatefulComponent<
    ViewModel = object,
    State = object,
    ComponentContext = object
  > extends Component<ViewModel, ComponentContext> {
    state?: Readonly<State>;

    /**
     * Update component state and trigger re-render
     */
    setState(state: Readonly<Partial<State>>): void;

    /**
     * Update state with animation
     */
    setStateAnimated(state: Readonly<Partial<State>>, animationOptions: any): void;

    /**
     * Update state with animation and return promise
     */
    setStateAnimatedPromise(state: Readonly<Partial<State>>, animationOptions: any): Promise<void>;
  }

  /**
   * Component interface
   */
  export interface IComponent<ViewModel = any, Context = any> {
    readonly viewModel: Readonly<ViewModel>;
    readonly context: Readonly<Context>;
    readonly renderer: IRenderer;
    onCreate(): void;
    onRender(): void;
    onDestroy(): void;
    onViewModelUpdate(previousViewModel?: Readonly<ViewModel>): void;
  }

  /**
   * Component constructor type
   */
  export type ComponentConstructor<T extends IComponent<ViewModel, Context>, ViewModel = any, Context = any> = {
    new (renderer: IRenderer, viewModel: ViewModel, context: Context): T;
    disallowNullViewModel?: boolean;
  };
}

/**
 * Valdi Style Module
 * Exports Style class for styling Valdi elements
 */
declare module 'valdi_core/src/Style' {
  /**
   * Style class for Valdi elements
   * Holds styling attributes and efficiently marshalls them to native code
   * @template T - The element type this style applies to
   */
  export class Style<T> {
    readonly attributes: Omit<T, 'style'>;

    /**
     * Create a new Style with the given attributes
     */
    constructor(attributes: T);

    /**
     * Convert style to native representation
     */
    toNative(convertFunc: (attributes: any) => number): number;

    /**
     * Create a new Style by extending this style with additional attributes
     */
    extend<T2>(attributes: T2): Style<Omit<T, 'style'> & T2>;

    /**
     * Merge multiple styles into one
     */
    static merge<S1, S2>(style1: Style<S1>, style2: Style<S2>): Style<S1 & S2>;
    static merge<S1, S2, S3>(
      style1: Style<S1>,
      style2: Style<S2>,
      style3: Style<S3>
    ): Style<S1 & S2 & S3>;
    static merge<S1, S2, S3, S4>(
      style1: Style<S1>,
      style2: Style<S2>,
      style3: Style<S3>,
      style4: Style<S4>
    ): Style<S1 & S2 & S3 & S4>;
    static merge(...styles: Array<Style<any>>): Style<any>;
  }

  export type NativeStyle = number;
  export type StyleToNativeFunc = (attributes: any) => NativeStyle;
}

/**
 * Valdi Native Template Elements Module
 * Exports all native UI element types and interfaces
 */
declare module 'valdi_tsx/src/NativeTemplateElements' {
  /**
   * Base template element
   */
  export interface TemplateElement {
    key?: string;
    ref?: any;
  }

  /**
   * Container element that can have children
   */
  export interface ContainerTemplateElement extends TemplateElement {
    children?: unknown;
  }

  /**
   * View element - the basic building block
   */
  export interface View extends ContainerTemplateElement {
    style?: any;
    width?: string | number;
    height?: string | number;
    backgroundColor?: string;
    padding?: string | number;
    margin?: string | number;
    flex?: number;
    flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
    justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
    alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
    position?: 'relative' | 'absolute';
    top?: string | number;
    left?: string | number;
    right?: string | number;
    bottom?: string | number;
    borderRadius?: string | number;
    borderWidth?: string | number;
    borderColor?: string;
    opacity?: number;
    onTap?: (event: any) => void;
    onLongPress?: (event: any) => void;
    [key: string]: any;
  }

  /**
   * Layout element - like View but without native backing
   */
  export interface Layout extends ContainerTemplateElement {
    style?: any;
    flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
    [key: string]: any;
  }

  /**
   * ScrollView element for scrollable content
   */
  export interface ScrollView extends ContainerTemplateElement {
    style?: any;
    horizontal?: boolean;
    onScroll?: (event: any) => void;
    bounces?: boolean;
    [key: string]: any;
  }

  /**
   * Label element for text display
   */
  export interface Label extends TemplateElement {
    value: string;
    style?: any;
    font?: string;
    color?: string;
    fontSize?: number;
    fontWeight?: string;
    textAlign?: 'left' | 'center' | 'right' | 'justified';
    numberOfLines?: number;
    [key: string]: any;
  }

  /**
   * TextField element for text input
   */
  export interface TextField extends TemplateElement {
    value?: string;
    placeholder?: string;
    style?: any;
    onChange?: (event: any) => void;
    onEditBegin?: (event: any) => void;
    onEditEnd?: (event: any) => void;
    [key: string]: any;
  }

  /**
   * TextInput - alias for TextField
   */
  export type TextInput = TextField;

  /**
   * TextView element for multiline text input
   */
  export interface TextView extends TemplateElement {
    value?: string;
    placeholder?: string;
    style?: any;
    onChange?: (event: any) => void;
    [key: string]: any;
  }

  /**
   * ImageView element for displaying images
   */
  export interface ImageView extends TemplateElement {
    src?: string | any;
    style?: any;
    objectFit?: 'fill' | 'contain' | 'cover' | 'none';
    [key: string]: any;
  }

  /**
   * VideoView element for video playback
   */
  export interface VideoView extends TemplateElement {
    src?: string | any;
    style?: any;
    [key: string]: any;
  }

  /**
   * ShapeView element for drawing shapes
   */
  export interface ShapeView extends TemplateElement {
    style?: any;
    path?: any;
    strokeColor?: string;
    fillColor?: string;
    strokeWidth?: number;
    [key: string]: any;
  }

  /**
   * BlurView element for blur effects
   */
  export interface BlurView extends ContainerTemplateElement {
    style?: any;
    blurStyle?: string;
    [key: string]: any;
  }

  /**
   * SpinnerView element for loading indicators
   */
  export interface SpinnerView extends TemplateElement {
    style?: any;
    color?: string;
    [key: string]: any;
  }

  /**
   * AnimatedImage element for animated content
   */
  export interface AnimatedImage extends TemplateElement {
    src?: string | any;
    style?: any;
    loop?: boolean;
    advanceRate?: number;
    [key: string]: any;
  }

  /**
   * Slot element for content projection
   */
  export interface Slot extends TemplateElement {
    name?: string;
    [key: string]: any;
  }

  // Export all element types
  export {
    View,
    Layout,
    ScrollView,
    Label,
    TextField,
    TextView,
    ImageView,
    VideoView,
    ShapeView,
    BlurView,
    SpinnerView,
    AnimatedImage,
    Slot,
  };
}

/**
 * Valdi Navigation Module
 * Exports NavigationController and navigation-related types
 */
declare module 'valdi_navigation/src/NavigationController' {
  import { IComponent, ComponentConstructor } from 'valdi_core/src/Component';

  /**
   * Navigation options for page transitions
   */
  export interface NavigationOptions {
    animated?: boolean;
    pageBackgroundColor?: string;
    isPartiallyHiding?: boolean;
  }

  /**
   * NavigationController for managing page navigation
   */
  export class NavigationController {
    constructor(navigator: any);

    /**
     * Push a new page onto the navigation stack
     */
    push<T extends IComponent<ViewModel, Context>, ViewModel = any, Context = any>(
      componentConstructor: ComponentConstructor<T, ViewModel, Context>,
      viewModel: ViewModel,
      options?: NavigationOptions
    ): void;

    /**
     * Pop the current page from the navigation stack
     */
    pop(options?: NavigationOptions): void;

    /**
     * Present a page modally
     */
    present<T extends IComponent<ViewModel, Context>, ViewModel = any, Context = any>(
      componentConstructor: ComponentConstructor<T, ViewModel, Context>,
      viewModel: ViewModel,
      options?: NavigationOptions
    ): void;

    /**
     * Dismiss the current modal page
     */
    dismiss(options?: NavigationOptions): void;

    /**
     * Register a back button observer
     */
    registerBackButtonObserver(observer: () => void): void;

    /**
     * Unregister a back button observer
     */
    unregisterBackButtonObserver(observer: () => void): void;
  }
}

/**
 * Valdi Navigation Page Component Module
 * Exports NavigationPageComponent base class
 */
declare module 'valdi_navigation/src/NavigationPageComponent' {
  import { Component, StatefulComponent } from 'valdi_core/src/Component';
  import { NavigationController } from 'valdi_navigation/src/NavigationController';

  /**
   * Navigation page context
   */
  export interface NavigationPageContext {
    navigator: any;
  }

  /**
   * Base class for navigation pages (stateless)
   * Provides automatic NavigationController instance
   */
  export abstract class NavigationPageComponent<
    ViewModel,
    ComponentContext extends NavigationPageContext = NavigationPageContext
  > extends Component<ViewModel, ComponentContext> {
    navigationController: NavigationController;
    static componentPath: string;
  }

  /**
   * Base class for navigation pages (stateful)
   * Provides automatic NavigationController instance with state management
   */
  export abstract class NavigationPageStatefulComponent<
    ViewModel,
    State = object,
    ComponentContext extends NavigationPageContext = NavigationPageContext
  > extends StatefulComponent<ViewModel, State, ComponentContext> {
    navigationController: NavigationController;
    static componentPath: string;
  }
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
    post(url: string, body?: any, options?: HTTPRequestOptions): Promise<HTTPResponse>;

    /**
     * Make a PUT request
     */
    put(url: string, body?: any, options?: HTTPRequestOptions): Promise<HTTPResponse>;

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
export type ValdiComponent<ViewModel = object, Context = object> =
  import('valdi_core/src/Component').Component<ViewModel, Context>;

/**
 * Valdi stateful component type helper
 */
export type ValdiStatefulComponent<ViewModel = object, State = object, Context = object> =
  import('valdi_core/src/Component').StatefulComponent<ViewModel, State, Context>;

// Export all declarations
export {};
