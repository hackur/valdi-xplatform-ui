/**
 * ToolExecutionCard
 *
 * Displays the results of a tool execution including:
 * - Tool name and description
 * - Input parameters
 * - Output result (formatted JSON)
 * - Execution time
 * - Success/error indicator
 */

import { Component } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { View } from 'valdi_tsx/src/NativeTemplateElements';
import { Card } from '@common';
import { Colors, Fonts, Spacing, BorderRadius } from '@common/theme';

/**
 * Tool Execution Result
 */
export interface ToolExecutionResult {
  /** Tool display name */
  toolName: string;

  /** Tool description */
  description: string;

  /** Input parameters passed to the tool */
  input: Record<string, unknown>;

  /** Output result from the tool */
  output: unknown;

  /** Execution time in milliseconds */
  executionTime: number;

  /** Whether execution was successful */
  success: boolean;

  /** Error message (if failed) */
  error?: string;

  /** Timestamp of execution */
  timestamp: string;
}

/**
 * Component Props
 */
export interface ToolExecutionCardProps {
  /** Execution result to display */
  result: ToolExecutionResult;
}

/**
 * ToolExecutionCard Component
 */
export class ToolExecutionCard extends Component<ToolExecutionCardProps> {
  /**
   * Format timestamp for display
   */
  private formatTimestamp(timestamp: string): string {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString();
    } catch {
      return timestamp;
    }
  }

  /**
   * Format execution time
   */
  private formatExecutionTime(ms: number): string {
    if (ms < 1000) {
      return `${ms}ms`;
    }
    return `${(ms / 1000).toFixed(2)}s`;
  }

  /**
   * Format JSON for display
   */
  private formatJson(data: unknown): string {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  }

  onRender() {
    const { result } = this.viewModel;

    return (
      <Card elevation="md" style={styles.container}>
        {/* Header */}
        <view style={styles.header}>
          <view style={styles.headerLeft}>
            <view style={styles.statusBadge}>
              <view
                style={{
                  ...styles.statusIndicator,
                  backgroundColor: result.success
                    ? Colors.success
                    : Colors.error,
                }}
              />
              <label
                value={result.success ? 'Success' : 'Failed'}
                style={{
                  ...Fonts.captionBold,
                  color: result.success ? Colors.success : Colors.error,
                }}
              />
            </view>
            <label
              value={result.toolName}
              style={Fonts.h3}
            />
          </view>
          <view style={styles.headerRight}>
            <label
              value={this.formatTimestamp(result.timestamp)}
              style={{
                ...Fonts.caption,
                color: Colors.textSecondary,
              }}
            />
          </view>
        </view>

        {/* Description */}
        <label
          value={result.description}
          style={{
            ...Fonts.body,
            color: Colors.textSecondary,
            marginBottom: Spacing.md,
          }}
        />

        {/* Execution Time */}
        <view style={styles.metadataRow}>
          <label
            value="Execution Time:"
            style={{
              ...Fonts.captionBold,
              color: Colors.textSecondary,
            }}
          />
          <label
            value={this.formatExecutionTime(result.executionTime)}
            style={{
              ...Fonts.caption,
              color: Colors.primary,
            }}
          />
        </view>

        {/* Input Section */}
        <view style={styles.section}>
          <label
            value="Input Parameters"
            style={{
              ...Fonts.captionBold,
              color: Colors.textSecondary,
              marginBottom: Spacing.xs,
            }}
          />
          <view style={styles.codeBlock}>
            <label
              value={this.formatJson(result.input)}
              style={{
                ...Fonts.code,
                color: Colors.codeText,
              }}
            />
          </view>
        </view>

        {/* Output Section */}
        <view style={styles.section}>
          <label
            value={result.success ? 'Output Result' : 'Error'}
            style={{
              ...Fonts.captionBold,
              color: Colors.textSecondary,
              marginBottom: Spacing.xs,
            }}
          />
          <view
            style={{
              ...styles.codeBlock,
              borderColor: result.success
                ? Colors.codeBorder
                : Colors.errorLight,
              backgroundColor: result.success
                ? Colors.codeBackground
                : Colors.errorLight,
            }}
          >
            <label
              value={
                result.success
                  ? this.formatJson(result.output)
                  : result.error || 'Unknown error occurred'
              }
              style={{
                ...Fonts.code,
                color: result.success ? Colors.codeText : Colors.errorDark,
              }}
            />
          </view>
        </view>
      </Card>
    );
  }
}

const styles = {
  container: new Style<View>({
    padding: Spacing.xl,
  }),

  header: new Style<View>({
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  }),

  headerLeft: new Style<View>({
    flex: 1,
    gap: Spacing.xs,
  }),

  headerRight: new Style<View>({
    alignItems: 'flex-end',
  }),

  statusBadge: new Style<View>({
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  }),

  statusIndicator: new Style<View>({
    width: 8,
    height: 8,
    borderRadius: 4,
  }),

  metadataRow: new Style<View>({
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  }),

  section: new Style<View>({
    marginTop: Spacing.md,
  }),

  codeBlock: new Style<View>({
    backgroundColor: Colors.codeBackground,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.codeBorder,
  }),
};
