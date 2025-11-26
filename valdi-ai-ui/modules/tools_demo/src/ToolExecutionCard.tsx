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
import { View, Label } from 'valdi_tsx/src/NativeTemplateElements';
import { Card, Colors, Fonts, Spacing, BorderRadius } from 'common/src';

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

  private getStatusIndicatorStyle(success: boolean) {
    return new Style<View>({
      ...styles.statusIndicator,
      backgroundColor: success ? Colors.success : Colors.error,
    });
  }

  private getStatusLabelStyle(success: boolean) {
    return new Style<Label>({
      ...Fonts.captionBold,
      color: success ? Colors.success : Colors.error,
    });
  }

  private getOutputCodeBlockStyle(success: boolean) {
    return new Style<View>({
      ...styles.codeBlock,
      borderColor: success ? Colors.codeBorder : Colors.errorLight,
      backgroundColor: success ? Colors.codeBackground : Colors.errorLight,
    });
  }

  private getOutputLabelStyle(success: boolean) {
    return new Style<Label>({
      ...Fonts.code,
      color: success ? Colors.codeText : Colors.errorDark,
    });
  }

  override onRender() {
    const { result } = this.viewModel;

    return (
      <Card elevation="md" style={styles.container}>
        {/* Header */}
        <view style={styles.header}>
          <view style={styles.headerLeft}>
            <view style={styles.statusBadge}>
              <view
                style={this.getStatusIndicatorStyle(result.success)}
              />
              <label
                value={result.success ? 'Success' : 'Failed'}
                style={this.getStatusLabelStyle(result.success)}
              />
            </view>
            <label value={result.toolName} style={Fonts.h3} />
          </view>
          <view style={styles.headerRight}>
            <label
              value={this.formatTimestamp(result.timestamp)}
              style={styles.timestampLabel}
            />
          </view>
        </view>

        {/* Description */}
        <label
          value={result.description}
          style={styles.descriptionLabel}
        />

        {/* Execution Time */}
        <view style={styles.metadataRow}>
          <label
            value="Execution Time:"
            style={styles.metadataLabel}
          />
          <label
            value={this.formatExecutionTime(result.executionTime)}
            style={styles.metadataValue}
          />
        </view>

        {/* Input Section */}
        <view style={styles.section}>
          <label
            value="Input Parameters"
            style={styles.sectionLabel}
          />
          <view style={styles.codeBlock}>
            <label
              value={this.formatJson(result.input)}
              style={styles.codeLabel}
            />
          </view>
        </view>

        {/* Output Section */}
        <view style={styles.section}>
          <label
            value={result.success ? 'Output Result' : 'Error'}
            style={styles.sectionLabel}
          />
          <view
            style={this.getOutputCodeBlockStyle(result.success)}
          >
            <label
              value={
                result.success
                  ? this.formatJson(result.output)
                  : result.error || 'Unknown error occurred'
              }
              style={this.getOutputLabelStyle(result.success)}
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
    flexGrow: 1,
  }),

  headerRight: new Style<View>({
    alignItems: 'flex-end',
  }),

  statusBadge: new Style<View>({
    flexDirection: 'row',
    alignItems: 'center',
  }),

  statusIndicator: new Style<View>({
    width: 8,
    height: 8,
    borderRadius: 4,
  }),

  timestampLabel: new Style<Label>({
    ...Fonts.caption,
    color: Colors.textSecondary,
  }),

  descriptionLabel: new Style<Label>({
    ...Fonts.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  }),

  metadataRow: new Style<View>({
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  }),

  metadataLabel: new Style<Label>({
    ...Fonts.captionBold,
    color: Colors.textSecondary,
  }),

  metadataValue: new Style<Label>({
    ...Fonts.caption,
    color: Colors.primary,
  }),

  section: new Style<View>({
    marginTop: Spacing.md,
  }),

  sectionLabel: new Style<Label>({
    ...Fonts.captionBold,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  }),

  codeBlock: new Style<View>({
    backgroundColor: Colors.codeBackground,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.codeBorder,
  }),

  codeLabel: new Style<Label>({
    ...Fonts.code,
    color: Colors.codeText,
  }),
};
