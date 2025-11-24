/**
 * ToolsDemoScreen
 *
 * Interactive demo screen showcasing AI tool execution.
 * Allows users to test different tools (weather, calculator, search)
 * and see real-time execution results.
 */

import { Component } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { View, ScrollView } from 'valdi_tsx/src/NativeTemplateElements';
import { Card, Button, Colors, Fonts, Spacing, BorderRadius } from '../common/src';
import { ToolExecutionCard, ToolExecutionResult } from './ToolExecutionCard';
import { getAllTools } from '../chat_core/src/ToolDefinitions';

/**
 * Tool Demo Item
 */
interface ToolDemo {
  name: string;
  displayName: string;
  description: string;
  exampleInput: Record<string, string>;
  icon: string;
}

/**
 * Component State
 */
interface ToolsDemoScreenState {
  executionResults: ToolExecutionResult[];
  currentlyExecuting: string | null;
}

/**
 * ToolsDemo Screen Component
 */
export class ToolsDemoScreen extends Component<{}, ToolsDemoScreenState> {
  state: ToolsDemoScreenState = {
    executionResults: [],
    currentlyExecuting: null,
  };

  /**
   * Available tool demos with example inputs
   */
  private toolDemos: ToolDemo[] = [
    {
      name: 'getWeather',
      displayName: 'Get Weather',
      description: 'Retrieve current weather information for any location',
      exampleInput: { location: 'San Francisco' },
      icon: '☀️',
    },
    {
      name: 'calculateExpression',
      displayName: 'Calculator',
      description: 'Evaluate mathematical expressions with basic arithmetic',
      exampleInput: { expression: '(25 * 4) + 100' },
      icon: '🔢',
    },
    {
      name: 'searchWeb',
      displayName: 'Web Search',
      description: 'Search the web for information on any topic',
      exampleInput: { query: 'artificial intelligence' },
      icon: '🔍',
    },
  ];

  /**
   * Execute a tool with example input
   */
  private handleExecuteTool = async (toolDemo: ToolDemo): Promise<void> => {
    const startTime = Date.now();

    this.setState({
      currentlyExecuting: toolDemo.name,
    });

    try {
      // Get all available tools
      const tools = getAllTools();
      const tool = tools[toolDemo.name as keyof typeof tools];

      if (!tool) {
        throw new Error(`Tool ${toolDemo.name} not found`);
      }

      // Execute the tool
      const result = await tool.execute(toolDemo.exampleInput as any);
      const executionTime = Date.now() - startTime;

      // Create execution result
      const executionResult: ToolExecutionResult = {
        toolName: toolDemo.displayName,
        description: toolDemo.description,
        input: toolDemo.exampleInput,
        output: result,
        executionTime,
        success: (result as any).success !== false,
        timestamp: new Date().toISOString(),
      };

      // Add to results (most recent first)
      this.setState({
        executionResults: [executionResult, ...this.state.executionResults],
        currentlyExecuting: null,
      });
    } catch (error) {
      const executionTime = Date.now() - startTime;

      // Create error result
      const executionResult: ToolExecutionResult = {
        toolName: toolDemo.displayName,
        description: toolDemo.description,
        input: toolDemo.exampleInput,
        output: null,
        executionTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      };

      this.setState({
        executionResults: [executionResult, ...this.state.executionResults],
        currentlyExecuting: null,
      });
    }
  };

  /**
   * Clear all execution results
   */
  private handleClearResults = (): void => {
    this.setState({
      executionResults: [],
    });
  };

  onRender() {
    const { executionResults, currentlyExecuting } = this.state;

    return (
      <ScrollView style={styles.container}>
        {/* Header */}
        <view style={styles.header}>
          <label value="Tools Demo" style={Fonts.h1} />
          <label
            value="Interactive demonstration of AI tool execution. Test different tools and see real-time results."
            style={{
              ...Fonts.body,
              color: Colors.textSecondary,
              marginTop: Spacing.sm,
            }}
          />
        </view>

        {/* Tool Cards */}
        <view style={styles.section}>
          <label value="Available Tools" style={Fonts.h2} />
          <view style={styles.toolGrid}>
            {this.toolDemos.map((toolDemo) => (
              <Card key={toolDemo.name} elevation="md" style={styles.toolCard}>
                <view style={styles.toolCardHeader}>
                  <label
                    value={`${toolDemo.icon} ${toolDemo.displayName}`}
                    style={Fonts.h3}
                  />
                </view>

                <label
                  value={toolDemo.description}
                  style={{
                    ...Fonts.body,
                    color: Colors.textSecondary,
                    marginTop: Spacing.sm,
                    marginBottom: Spacing.md,
                  }}
                />

                {/* Example Input Display */}
                <view style={styles.exampleInputContainer}>
                  <label
                    value="Example Input:"
                    style={{
                      ...Fonts.caption,
                      color: Colors.textSecondary,
                      marginBottom: Spacing.xs,
                    }}
                  />
                  <view style={styles.codeBlock}>
                    <label
                      value={JSON.stringify(toolDemo.exampleInput, null, 2)}
                      style={{
                        ...Fonts.code,
                        color: Colors.codeText,
                      }}
                    />
                  </view>
                </view>

                {/* Execute Button */}
                <Button
                  title={
                    currentlyExecuting === toolDemo.name
                      ? 'Executing...'
                      : 'Run Demo'
                  }
                  variant="primary"
                  size="medium"
                  fullWidth={true}
                  loading={currentlyExecuting === toolDemo.name}
                  disabled={currentlyExecuting !== null}
                  onTap={() => this.handleExecuteTool(toolDemo)}
                  style={{ marginTop: Spacing.md }}
                />
              </Card>
            ))}
          </view>
        </view>

        {/* Execution Results */}
        {executionResults.length > 0 && (
          <view style={styles.section}>
            <view style={styles.resultsHeader}>
              <label value="Execution Results" style={Fonts.h2} />
              <Button
                title="Clear All"
                variant="outline"
                size="small"
                onTap={this.handleClearResults}
              />
            </view>

            <view style={styles.resultsContainer}>
              {executionResults.map((result, index) => (
                <ToolExecutionCard key={index} result={result} />
              ))}
            </view>
          </view>
        )}

        {/* Empty State */}
        {executionResults.length === 0 && (
          <view style={styles.emptyState}>
            <label
              value="No executions yet"
              style={{
                ...Fonts.h3,
                color: Colors.textTertiary,
              }}
            />
            <label
              value="Run a tool demo above to see execution results"
              style={{
                ...Fonts.body,
                color: Colors.textTertiary,
                marginTop: Spacing.xs,
              }}
            />
          </view>
        )}
      </ScrollView>
    );
  }
}

const styles = {
  container: new Style<ScrollView>({
    flex: 1,
    backgroundColor: Colors.background,
  }),

  header: new Style<View>({
    padding: Spacing.xl,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  }),

  section: new Style<View>({
    padding: Spacing.xl,
  }),

  toolGrid: new Style<View>({
    marginTop: Spacing.base,
    gap: Spacing.base,
  }),

  toolCard: new Style<View>({
    padding: Spacing.xl,
  }),

  toolCardHeader: new Style<View>({
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  }),

  exampleInputContainer: new Style<View>({
    marginTop: Spacing.md,
  }),

  codeBlock: new Style<View>({
    backgroundColor: Colors.codeBackground,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.codeBorder,
  }),

  resultsHeader: new Style<View>({
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.base,
  }),

  resultsContainer: new Style<View>({
    gap: Spacing.base,
  }),

  emptyState: new Style<View>({
    alignItems: 'center',
    padding: Spacing.xxxl,
  }),
};
