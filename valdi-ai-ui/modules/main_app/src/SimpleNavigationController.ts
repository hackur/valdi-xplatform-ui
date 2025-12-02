/**
 * SimpleNavigationController - Simplified Navigation System
 *
 * A workaround for NavigationRoot rendering issues.
 * Provides basic push/pop navigation without the complex Valdi navigation stack.
 */

/** Component type for page navigation - accepts any component constructor or function */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PageComponent = any;

/** Navigation props passed to pages */
export type NavigationProps = Record<string, unknown>;

export interface NavigationState {
  currentPage: PageComponent | null;
  pageProps: NavigationProps;
}

export class SimpleNavigationController {
  private updateCallback: ((state: NavigationState) => void) | null = null;
  private state: NavigationState = {
    currentPage: null,
    pageProps: {},
  };

  setUpdateCallback(callback: (state: NavigationState) => void): void {
    this.updateCallback = callback;
  }

  push(
    component: PageComponent,
    props: NavigationProps = {},
    _options: Record<string, unknown> = {},
  ): void {
    this.state = {
      currentPage: component,
      pageProps: { ...props, navigationController: this },
    };
    this.updateCallback?.(this.state);
  }

  pop(): void {
    // For now, just clear the page (go back to home)
    this.state = {
      currentPage: null,
      pageProps: {},
    };
    this.updateCallback?.(this.state);
  }

  getState(): NavigationState {
    return this.state;
  }
}
