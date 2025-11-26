/**
 * WorkflowCard
 *
 * Displays workflow execution progress and results:
 * - Visual diagram of workflow steps
 * - Step-by-step progress display
 * - Current step indicator
 * - Final result display
 */

import { Component } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { Card, Colors, Fonts, Spacing, BorderRadius } from 'common/src';

/**
 * Workflow Step
 */
export interface WorkflowStep {
  /** Step name/title */
  name: string;

  /** Step description */
  description: string;

  /** Step status */
  status: 'pending' | 'running' | 'completed' | 'error';

  /** Step output (when completed) */
  output?: string;

  /** Error message (when failed) */
  error?: string;

  /** Step start time */
  startTime?: number;

  /** Step end time */
  endTime?: number;
}

/**
 * Workflow Execution State
 */
export interface WorkflowExecutionState {
  /** Overall workflow status */
  status: 'idle' | 'running' | 'completed' | 'error';

  /** All workflow steps */
  steps: WorkflowStep[];

  /** Current step index */
  currentStep: number;

  /** Final result (when completed) */
  result?: string;

  /** Error message (when failed) */
  error?: string;

  /** Total execution time */
  totalTime?: number;
}

/**
 * Component Props
 */
export interface WorkflowCardProps {
  /** Workflow name */
  workflowName: string;

  /** Execution state */
  executionState: WorkflowExecutionState;
}

/**
 * WorkflowCard Component
 */
export class WorkflowCard extends Component<WorkflowCardProps> {
  /**
   * Format execution time
   */
  private formatTime(ms: number): string {
    if (ms < 1000) {
      return `${ms}ms`;
    }
    return `${(ms / 1000).toFixed(2)}s`;
  }

  /**
   * Get status color
   */
  private getStatusColor(status: WorkflowStep['status']): string {
    switch (status) {
      case 'pending':
        return Colors.gray400;
      case 'running':
        return Colors.primary;
      case 'completed':
        return Colors.success;
      case 'error':
        return Colors.error;
      default:
        return Colors.gray400;
    }
  }

  /**
   * Get status icon
   */
  private getStatusIcon(status: WorkflowStep['status']): string {
    switch (status) {
      case 'pending':
        return '○';
      case 'running':
        return '◐';
      case 'completed':
        return '✓';
      case 'error':
        return '✗';
      default:
        return '○';
    }
  }

  /**
   * Render workflow step
   */
  private renderStep(step: WorkflowStep, index: number, isLast: boolean) {
    const statusColor = this.getStatusColor(step.status);
    const statusIcon = this.getStatusIcon(step.status);
    const executionTime =
      step.startTime && step.endTime
        ? this.formatTime(step.endTime - step.startTime)
        : null;

    return (
      <view key={index} style={styles.stepContainer}>
        {/* Step Header */}
        <view style={styles.stepHeader}>
          <view style={styles.stepIndicator}>
            <view
              style={{
                ...styles.stepIcon,
                backgroundColor: statusColor,
              }}
            >
              <label
                value={statusIcon}
                style={{
                  ...Fonts.h3,
                  color: Colors.textInverse,
                }}
              />
            </view>
            {!isLast && (
              <view
                style={{
                  ...styles.stepConnector,
                  backgroundColor:
                    step.status === 'completed'
                      ? Colors.success
                      : Colors.gray300,
                }}
              />
            )}
          </view>

          <view style={styles.stepContent}>
            <view style={styles.stepTitleRow}>
              <label value={step.name} style={Fonts.h4} />
              {executionTime && (
                <label
                  value={executionTime}
                  style={{
                    ...Fonts.caption,
                    color: Colors.textSecondary,
                  }}
                />
              )}
            </view>

            <label
              value={step.description}
              style={{
                ...Fonts.body,
                color: Colors.textSecondary,
                marginTop: Spacing.xs,
              }}
            />

            {/* Step Output */}
            {step.status === 'completed' && step.output && (
              <view style={styles.stepOutputContainer}>
                <label
                  value="Output:"
                  style={{
                    ...Fonts.captionBold,
                    color: Colors.textSecondary,
                    marginBottom: Spacing.xs,
                  }}
                />
                <view style={styles.outputBox}>
                  <label
                    value={step.output}
                    style={{
                      ...Fonts.body,
                      color: Colors.textPrimary,
                    }}
                  />
                </view>
              </view>
            )}

            {/* Step Error */}
            {step.status === 'error' && step.error && (
              <view style={styles.stepErrorContainer}>
                <label
                  value="Error:"
                  style={{
                    ...Fonts.captionBold,
                    color: Colors.error,
                    marginBottom: Spacing.xs,
                  }}
                />
                <view style={styles.errorBox}>
                  <label
                    value={step.error}
                    style={{
                      ...Fonts.body,
                      color: Colors.errorDark,
                    }}
                  />
                </view>
              </view>
            )}
          </view>
        </view>
      </view>
    );
  }

  override onRender() {
    const { executionState } = this.viewModel;

    // Don't render if workflow hasn't started
    if (executionState.status === 'idle') {
      return null;
    }

    return (
      <Card elevation="md" style={styles.container}>
        {/* Header */}
        <view style={styles.header}>
          <label value="Execution Progress" style={Fonts.h2} />
          {executionState.totalTime && (
            <label
              value={`Total: ${this.formatTime(executionState.totalTime)}`}
              style={{
                ...Fonts.caption,
                color: Colors.textSecondary,
              }}
            />
          )}
        </view>

        {/* Progress Indicator */}
        {executionState.status === 'running' && (
          <view style={styles.progressContainer}>
            <label
              value={`Step ${executionState.currentStep + 1} of ${executionState.steps.length}`}
              style={{
                ...Fonts.body,
                color: Colors.primary,
              }}
            />
          </view>
        )}

        {/* Steps */}
        {executionState.steps.length > 0 && (
          <view style={styles.stepsContainer}>
            {executionState.steps.map((step, index) =>
              this.renderStep(
                step,
                index,
                index === executionState.steps.length - 1,
              ),
            )}
          </view>
        )}

        {/* Final Result */}
        {executionState.status === 'completed' && executionState.result && (
          <view style={styles.resultContainer}>
            <view style={styles.resultHeader}>
              <label
                value="✓ Final Result"
                style={{
                  ...Fonts.h3,
                  color: Colors.success,
                }}
              />
            </view>
            <view style={styles.resultBox}>
              <label
                value={executionState.result}
                style={{
                  ...Fonts.body,
                  color: Colors.textPrimary,
                }}
              />
            </view>
          </view>
        )}

        {/* Error State */}
        {executionState.status === 'error' && executionState.error && (
          <view style={styles.errorContainer}>
            <view style={styles.errorHeader}>
              <label
                value="✗ Workflow Failed"
                style={{
                  ...Fonts.h3,
                  color: Colors.error,
                }}
              />
            </view>
            <view style={styles.errorBox}>
              <label
                value={executionState.error}
                style={{
                  ...Fonts.body,
                  color: Colors.errorDark,
                }}
              />
            </view>
          </view>
        )}
      </Card>
    );
  }
}

const styles = {
  container: new Style({
    padding: Spacing.xl,
  }),

  header: new Style({
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  }),

  progressContainer: new Style({
    padding: Spacing.md,
    backgroundColor: Colors.primaryLighter,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.lg,
    alignItems: 'center',
  }),

  stepsContainer: new Style({
    gap: Spacing.none,
  }),

  stepContainer: new Style({
    marginBottom: Spacing.none,
  }),

  stepHeader: new Style({
    flexDirection: 'row',
    gap: Spacing.base,
  }),

  stepIndicator: new Style({
    alignItems: 'center',
    paddingTop: Spacing.xs,
  }),

  stepIcon: new Style({
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  }),

  stepConnector: new Style({
    width: 2,
    flex: 1,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
  }),

  stepContent: new Style({
    flex: 1,
    paddingBottom: Spacing.lg,
  }),

  stepTitleRow: new Style({
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  }),

  stepOutputContainer: new Style({
    marginTop: Spacing.md,
  }),

  stepErrorContainer: new Style({
    marginTop: Spacing.md,
  }),

  outputBox: new Style({
    padding: Spacing.md,
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  }),

  errorBox: new Style({
    padding: Spacing.md,
    backgroundColor: Colors.errorLight,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.error,
  }),

  resultContainer: new Style({
    marginTop: Spacing.xl,
    padding: Spacing.lg,
    backgroundColor: Colors.successLight,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.success,
  }),

  resultHeader: new Style({
    marginBottom: Spacing.md,
  }),

  resultBox: new Style({
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
  }),

  errorContainer: new Style({
    marginTop: Spacing.xl,
    padding: Spacing.lg,
    backgroundColor: Colors.errorLight,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.error,
  }),

  errorHeader: new Style({
    marginBottom: Spacing.md,
  }),
};
