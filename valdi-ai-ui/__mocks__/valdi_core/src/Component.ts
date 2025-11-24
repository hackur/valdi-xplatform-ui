/**
 * Mock Component for testing
 * Matches Valdi Component API signature with ViewModel and State generics
 */

export class Component<TViewModel = any, TState = any> {
  viewModel: TViewModel;
  state: TState;

  constructor(viewModel: TViewModel) {
    this.viewModel = viewModel;
    this.state = {} as TState;
  }

  onRender(): void {
    // Valdi components have void onRender
  }

  setState(newState: Partial<TState>): void {
    this.state = { ...this.state, ...newState };
  }

  onCreate(): void {
    // Lifecycle method
  }

  onMount(): void {
    // Lifecycle method
  }

  onUpdate(): void {
    // Lifecycle method
  }

  onViewModelUpdate(previousViewModel?: TViewModel): void {
    // Lifecycle method - called when viewModel changes
  }

  onUnmount(): void {
    // Lifecycle method
  }

  onDestroy(): void {
    // Lifecycle method
  }
}

export class StatefulComponent<
  TProps = any,
  TState = any,
> extends Component<TProps, TState> {
  constructor(viewModel: TProps, initialState?: TState) {
    super(viewModel);
    if (initialState) {
      this.state = initialState;
    }
  }
}

// Navigation page components (for navigation integration)
export class NavigationPageComponent<TViewModel = any> extends Component<TViewModel> {
  navigationController: any; // Will be injected by navigation system

  constructor(viewModel: TViewModel) {
    super(viewModel);
  }
}

export class NavigationPageStatefulComponent<
  TViewModel = any,
  TState = any,
> extends StatefulComponent<TViewModel, TState> {
  navigationController: any; // Will be injected by navigation system

  constructor(viewModel: TViewModel, initialState?: TState) {
    super(viewModel, initialState);
  }
}
