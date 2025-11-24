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
  push(component: any, props?: any): void {
    // Mock implementation
  }

  pop(): void {
    // Mock implementation
  }

  popToRoot(): void {
    // Mock implementation
  }

  replace(component: any, props?: any): void {
    // Mock implementation
  }

  getCurrentRoute(): any {
    return null;
  }
}
