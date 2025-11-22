/**
 * Mock NavigationController for testing
 */

export class MockNavigationController {
  public pushCalls: Array<{ component: any; props?: any }> = [];
  public popCalls: number = 0;
  public popToRootCalls: number = 0;
  public replaceCalls: Array<{ component: any; props?: any }> = [];
  public presentCalls: Array<{ component: any; props?: any }> = [];
  public dismissCalls: number = 0;

  push(component: any, props?: any): void {
    this.pushCalls.push({ component, props });
  }

  pop(): void {
    this.popCalls++;
  }

  popToRoot(): void {
    this.popToRootCalls++;
  }

  replace(component: any, props?: any): void {
    this.replaceCalls.push({ component, props });
  }

  present(component: any, props?: any): void {
    this.presentCalls.push({ component, props });
  }

  dismiss(): void {
    this.dismissCalls++;
  }

  reset(): void {
    this.pushCalls = [];
    this.popCalls = 0;
    this.popToRootCalls = 0;
    this.replaceCalls = [];
    this.presentCalls = [];
    this.dismissCalls = 0;
  }
}

export function createMockNavigationController(): MockNavigationController {
  return new MockNavigationController();
}
