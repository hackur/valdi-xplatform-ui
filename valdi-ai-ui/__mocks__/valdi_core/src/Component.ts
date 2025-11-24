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
