/**
 * Mock NavigationController for testing
 * Valdi navigation API
 */

export interface NavigationController {
  push(component: any, props?: any): void;
  pop(): void;
  popToRoot(): void;
  replace(component: any, props?: any): void;
  getCurrentRoute(): any;
}

export class DefaultNavigationController implements NavigationController {
  push(_component: any, _props?: any): void {
    // Mock implementation
  }

  pop(): void {
    // Mock implementation
  }

  popToRoot(): void {
    // Mock implementation
  }

  replace(_component: any, _props?: any): void {
    // Mock implementation
  }

  getCurrentRoute(): any {
    return null;
  }
}
