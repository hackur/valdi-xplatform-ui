/**
 * Mock Component for testing
 */

export class Component<T = any> {
  viewModel: T;

  constructor(viewModel: T) {
    this.viewModel = viewModel;
  }

  onRender(): any {
    return null;
  }

  setState(newState: Partial<any>): void {
    // Mock implementation
  }
}

export class StatefulComponent<
  TProps = any,
  TState = any,
> extends Component<TProps> {
  state: TState;

  constructor(viewModel: TProps, initialState?: TState) {
    super(viewModel);
    this.state = initialState || ({} as TState);
  }

  setState(newState: Partial<TState>): void {
    this.state = { ...this.state, ...newState };
  }

  onCreate(): void {
    // Mock lifecycle method
  }

  onDestroy(): void {
    // Mock lifecycle method
  }
}
