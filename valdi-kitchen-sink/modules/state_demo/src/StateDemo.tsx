/**
 * StateDemo Component
 * Demonstrates StatefulComponent, state management, and lifecycle methods
 */

import { StatefulComponent } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { NavigationController } from 'valdi_navigation/src/NavigationRoot';
import { NavigationPageComponent } from 'valdi_navigation/src/NavigationPageComponent';
import { NavigationPage } from 'valdi_navigation/src/decorators';
import { View, Label, Layout, ScrollView } from 'valdi_tsx/src/NativeTemplateElements';

import {
  Colors,
  Fonts,
  Spacing,
  BorderRadius,
  Header,
  DemoSection,
  Card,
  Button,
  CodeBlock,
} from '../../common/src/index';

export interface StateDemoViewModel {
  navigationController: NavigationController;
}

interface StateDemoState {
  counter: number;
  likes: number;
  isToggled: boolean;
  lifecycleLog: string[];
}

@NavigationPage(module)
export class StateDemo extends StatefulComponent<StateDemoViewModel, StateDemoState> {
  state: StateDemoState = {
    counter: 0,
    likes: 0,
    isToggled: false,
    lifecycleLog: [],
  };

  onCreate() {
    // Called when component is first created
    this.addLifecycleLog('onCreate() called');
  }

  onViewModelUpdate(previous?: StateDemoViewModel) {
    // Called when view model (props) change
    this.addLifecycleLog(`onViewModelUpdate() called`);
  }

  onDestroy() {
    // Called when component is destroyed
    this.addLifecycleLog('onDestroy() called');
  }

  onRender() {
    <view style={styles.page}>
      {/* Header */}
      <Header
        title="State & Lifecycle"
        showBack={true}
        onBack={() => this.viewModel.navigationController.pop()}
      />

      {/* Content */}
      <scroll style={styles.scroll}>
        <layout style={styles.content}>
          {/* Counter Example */}
          <DemoSection
            title="State Management"
            description="Use setState() to update component state and trigger re-render"
          >
            <Card>
              <layout width="100%" gap={Spacing.md} alignItems="center">
                <label
                  font={Fonts.h1}
                  color={Colors.primary}
                  value={this.state.counter.toString()}
                />

                <layout flexDirection="row" gap={Spacing.sm}>
                  <Button
                    title="Decrement"
                    variant="outline"
                    onTap={() => this.setState({ counter: this.state.counter - 1 })}
                  />
                  <Button
                    title="Increment"
                    variant="primary"
                    onTap={() => this.setState({ counter: this.state.counter + 1 })}
                  />
                </layout>

                <Button
                  title="Reset"
                  variant="secondary"
                  size="small"
                  onTap={() => this.setState({ counter: 0 })}
                />
              </layout>
            </Card>
          </DemoSection>

          {/* Multiple State Values */}
          <DemoSection
            title="Multiple State Values"
            description="Manage multiple independent state values in one component"
          >
            <Card>
              <layout width="100%" gap={Spacing.md}>
                {/* Likes counter */}
                <layout width="100%" gap={Spacing.sm}>
                  <layout flexDirection="row" alignItems="center" justifyContent="space-between" width="100%">
                    <label font={Fonts.h4} color={Colors.textPrimary} value="Likes" />
                    <label font={Fonts.h3} color={Colors.error} value={`❤️ ${this.state.likes}`} />
                  </layout>
                  <Button
                    title="Like this!"
                    variant="outline"
                    fullWidth={true}
                    onTap={() => this.setState({ likes: this.state.likes + 1 })}
                  />
                </layout>

                {/* Toggle state */}
                <layout width="100%" gap={Spacing.sm}>
                  <layout flexDirection="row" alignItems="center" justifyContent="space-between" width="100%">
                    <label font={Fonts.h4} color={Colors.textPrimary} value="Toggle" />
                    <label
                      font={Fonts.body}
                      color={this.state.isToggled ? Colors.success : Colors.textSecondary}
                      value={this.state.isToggled ? 'ON' : 'OFF'}
                    />
                  </layout>
                  <Button
                    title={this.state.isToggled ? 'Turn Off' : 'Turn On'}
                    variant={this.state.isToggled ? 'secondary' : 'primary'}
                    fullWidth={true}
                    onTap={() => this.setState({ isToggled: !this.state.isToggled })}
                  />
                </layout>
              </layout>
            </Card>
          </DemoSection>

          {/* Lifecycle Methods */}
          <DemoSection
            title="Lifecycle Methods"
            description="Track component lifecycle with onCreate, onViewModelUpdate, and onDestroy"
          >
            <Card>
              <layout width="100%" gap={Spacing.md}>
                <label
                  font={Fonts.body}
                  color={Colors.textSecondary}
                  value="Lifecycle events logged below:"
                  numberOfLines={0}
                />

                <view
                  width="100%"
                  backgroundColor={Colors.gray100}
                  borderRadius={BorderRadius.sm}
                  padding={Spacing.md}
                  maxHeight={200}
                >
                  {this.state.lifecycleLog.length === 0 ? (
                    <label
                      font={Fonts.caption}
                      color={Colors.textTertiary}
                      value="No events yet"
                    />
                  ) : (
                    <layout width="100%" gap={Spacing.xs}>
                      {this.state.lifecycleLog.forEach((log, index) => (
                        <label
                          font={Fonts.caption}
                          color={Colors.textPrimary}
                          value={`${index + 1}. ${log}`}
                          numberOfLines={0}
                        />
                      ))}
                    </layout>
                  )}
                </view>

                <Button
                  title="Trigger State Update"
                  variant="outline"
                  fullWidth={true}
                  onTap={() => this.addLifecycleLog('Manual state update triggered')}
                />
              </layout>
            </Card>
          </DemoSection>

          {/* Code Example */}
          <DemoSection title="Code Example">
            <CodeBlock
              language="tsx"
              code={`import { StatefulComponent } from 'valdi_core/src/Component';

interface MyState {
  count: number;
}

export class Counter extends StatefulComponent<{}, MyState> {
  state: MyState = { count: 0 };

  onCreate() {
    // Component initialization
  }

  onRender() {
    <view>
      <label value={\`Count: \${this.state.count}\`} />
      <view onTap={() => {
        this.setState({ count: this.state.count + 1 });
      }}>
        <label value="Increment" />
      </view>
    </view>;
  }

  onDestroy() {
    // Cleanup
  }
}`}
            />
          </DemoSection>
        </layout>
      </scroll>
    </view>;
  }

  private addLifecycleLog(message: string) {
    this.setState({
      lifecycleLog: [...this.state.lifecycleLog, message],
    });
  }
}

const styles = {
  page: new Style<View>({
    width: '100%',
    height: '100%',
    backgroundColor: Colors.background,
  }),

  scroll: new Style<ScrollView>({
    width: '100%',
    flex: 1,
  }),

  content: new Style<Layout>({
    width: '100%',
    padding: Spacing.base,
  }),
};
