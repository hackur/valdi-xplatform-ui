/**
 * Mock NavigationController for testing
 *
 * Test double for NavigationController that records all navigation calls
 * for verification in unit tests. Useful for testing components that
 * trigger navigation without actually navigating.
 *
 * @example
 * ```typescript
 * // In your test
 * const mockNav = new MockNavigationController();
 * const component = new MyComponent({ navigation: mockNav });
 *
 * component.handleButtonPress();
 *
 * // Verify navigation occurred
 * expect(mockNav.pushCalls).toHaveLength(1);
 * expect(mockNav.pushCalls[0].component).toBe(DetailsScreen);
 * expect(mockNav.pushCalls[0].props).toEqual({ id: 123 });
 * ```
 */
export class MockNavigationController {
  /** Array of all push() calls with their arguments */
  public pushCalls: Array<{ component: any; props?: any }> = [];

  /** Count of pop() calls */
  public popCalls: number = 0;

  /** Count of popToRoot() calls */
  public popToRootCalls: number = 0;

  /** Array of all replace() calls with their arguments */
  public replaceCalls: Array<{ component: any; props?: any }> = [];

  /** Array of all present() calls with their arguments */
  public presentCalls: Array<{ component: any; props?: any }> = [];

  /** Count of dismiss() calls */
  public dismissCalls: number = 0;

  /**
   * Mock push navigation
   *
   * Records a push navigation call for later verification.
   *
   * @param component - The component to navigate to
   * @param props - Optional props to pass to the component
   *
   * @example
   * ```typescript
   * mockNav.push(DetailsScreen, { id: 123 });
   * ```
   */
  push(component: any, props?: any): void {
    this.pushCalls.push({ component, props });
  }

  /**
   * Mock pop navigation
   *
   * Records a pop navigation call (increments counter).
   *
   * @example
   * ```typescript
   * mockNav.pop();
   * expect(mockNav.popCalls).toBe(1);
   * ```
   */
  pop(): void {
    this.popCalls++;
  }

  /**
   * Mock pop to root navigation
   *
   * Records a popToRoot navigation call (increments counter).
   *
   * @example
   * ```typescript
   * mockNav.popToRoot();
   * expect(mockNav.popToRootCalls).toBe(1);
   * ```
   */
  popToRoot(): void {
    this.popToRootCalls++;
  }

  /**
   * Mock replace navigation
   *
   * Records a replace navigation call for later verification.
   *
   * @param component - The component to replace with
   * @param props - Optional props to pass to the component
   *
   * @example
   * ```typescript
   * mockNav.replace(LoginScreen);
   * expect(mockNav.replaceCalls[0].component).toBe(LoginScreen);
   * ```
   */
  replace(component: any, props?: any): void {
    this.replaceCalls.push({ component, props });
  }

  /**
   * Mock present (modal) navigation
   *
   * Records a modal presentation call for later verification.
   *
   * @param component - The component to present modally
   * @param props - Optional props to pass to the component
   *
   * @example
   * ```typescript
   * mockNav.present(SettingsModal, { theme: 'dark' });
   * expect(mockNav.presentCalls).toHaveLength(1);
   * ```
   */
  present(component: any, props?: any): void {
    this.presentCalls.push({ component, props });
  }

  /**
   * Mock dismiss (close modal) navigation
   *
   * Records a dismiss call (increments counter).
   *
   * @example
   * ```typescript
   * mockNav.dismiss();
   * expect(mockNav.dismissCalls).toBe(1);
   * ```
   */
  dismiss(): void {
    this.dismissCalls++;
  }

  /**
   * Reset all recorded calls
   *
   * Clears all navigation call records. Useful for resetting state
   * between tests or test assertions.
   *
   * @example
   * ```typescript
   * mockNav.push(Screen1);
   * mockNav.reset();
   * expect(mockNav.pushCalls).toHaveLength(0);
   * ```
   */
  reset(): void {
    this.pushCalls = [];
    this.popCalls = 0;
    this.popToRootCalls = 0;
    this.replaceCalls = [];
    this.presentCalls = [];
    this.dismissCalls = 0;
  }
}

/**
 * Create a new MockNavigationController instance
 *
 * Factory function for creating mock navigation controllers in tests.
 * Provides a clean way to instantiate mocks with clear intent.
 *
 * @returns A new MockNavigationController instance
 *
 * @example
 * ```typescript
 * describe('MyComponent', () => {
 *   let mockNav: MockNavigationController;
 *
 *   beforeEach(() => {
 *     mockNav = createMockNavigationController();
 *   });
 *
 *   it('should navigate on button press', () => {
 *     const component = new MyComponent({ navigation: mockNav });
 *     component.onButtonPress();
 *     expect(mockNav.pushCalls).toHaveLength(1);
 *   });
 * });
 * ```
 */
export function createMockNavigationController(): MockNavigationController {
  return new MockNavigationController();
}
