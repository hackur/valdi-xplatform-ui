/**
 * Mock NavigationController for testing
 * Valdi navigation API
 */

export interface NavigationOptions {
  animated?: boolean;
  showPlatformNavigationBar?: boolean;
  platformNavigationTitle?: string;
  isPartiallyHiding?: boolean;
}

export interface NavigationPushOptions extends NavigationOptions {}

export interface NavigationPresentOptions extends NavigationOptions {
  wrapInPlatformNavigationController?: boolean;
}

export interface NavigationController {
  push<ViewModel, Context, ProvidedContext extends Omit<Context, 'navigator'>>(
    componentClass: any,
    viewModel: ViewModel,
    context: ProvidedContext,
    options?: NavigationPushOptions,
  ): void;
  pop(animated?: boolean): void;
  popToRoot(animated?: boolean): void;
  popToSelf(animated?: boolean): void;
  present<ViewModel, Context, ProvidedContext extends Omit<Context, 'navigator'>>(
    componentClass: any,
    viewModel: ViewModel,
    context: ProvidedContext,
    options?: NavigationPresentOptions,
  ): void;
  dismiss(animated: boolean): void;
  disableDismissalGesture(): () => void;
}

export class DefaultNavigationController implements NavigationController {
  push<ViewModel, Context, ProvidedContext extends Omit<Context, 'navigator'>>(
    _componentClass: any,
    _viewModel: ViewModel,
    _context: ProvidedContext,
    _options?: NavigationPushOptions,
  ): void {
    // Mock implementation
  }

  pop(_animated: boolean = true): void {
    // Mock implementation
  }

  popToRoot(_animated: boolean = true): void {
    // Mock implementation
  }

  popToSelf(_animated: boolean = true): void {
    // Mock implementation
  }

  present<ViewModel, Context, ProvidedContext extends Omit<Context, 'navigator'>>(
    _componentClass: any,
    _viewModel: ViewModel,
    _context: ProvidedContext,
    _options?: NavigationPresentOptions,
  ): void {
    // Mock implementation
  }

  dismiss(_animated: boolean = true): void {
    // Mock implementation
  }

  disableDismissalGesture(): () => void {
    return () => {
      // Mock implementation
    };
  }
}
