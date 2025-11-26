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
import { View, Label } from 'valdi_tsx/src/NativeTemplateElements';
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
   * Get step icon style
   */
  private getStepIconStyle(statusColor: string) {
    return new Style<View>({
      ...styles.stepIcon,
      backgroundColor: statusColor,
    });
  }

  /**
   * Get step connector style
   */
  private getStepConnectorStyle(isCompleted: boolean) {
    return new Style<View>({
      ...styles.stepConnector,
      backgroundColor: isCompleted ? Colors.success : Colors.gray300,
    });
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
              style={this.getStepIconStyle(statusColor)}
            >
              <label
                value={statusIcon}
                style={styles.stepIconLabel}
              />
            </view>
            {!isLast && (
              <view
                style={this.getStepConnectorStyle(step.status === 'completed')}
              />
            )}
          </view>

          <view style={styles.stepContent}>
            <view style={styles.stepTitleRow}>
              <label value={step.name} style={Fonts.h4} />
              {executionTime && (
                <label
                  value={executionTime}
                  style={styles.stepExecutionTime}
                />
              )}
            </view>

            <label
              value={step.description}
              style={styles.stepDescription}
            />

            {/* Step Output */}
            {step.status === 'completed' && step.output && (
              <view style={styles.stepOutputContainer}>
                <label
                  value="Output:"
                  style={styles.stepOutputLabel}
                />
                <view style={styles.outputBox}>
                  <label
                    value={step.output}
                    style={styles.stepOutputText}
                  />
                </view>
              </view>
            )}

            {/* Step Error */}
            {step.status === 'error' && step.error && (
              <view style={styles.stepErrorContainer}>
                <label
                  value="Error:"
                  style={styles.stepErrorLabel}
                />
                <view style={styles.errorBox}>
                  <label
                    value={step.error}
                    style={styles.stepErrorText}
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
              style={styles.headerTime}
            />
          )}
        </view>

        {/* Progress Indicator */}
        {executionState.status === 'running' && (
          <view style={styles.progressContainer}>
            <label
              value={`Step ${executionState.currentStep + 1} of ${executionState.steps.length}`}
              style={styles.progressLabel}
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
                style={styles.resultHeaderLabel}
              />
            </view>
            <view style={styles.resultBox}>
              <label
                value={executionState.result}
                style={styles.resultText}
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
                style={styles.errorHeaderLabel}
              />
            </view>
            <view style={styles.errorBox}>
              <label
                value={executionState.error}
                style={styles.workflowErrorText}
              />
            </view>
          </view>
        )}
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
    alignItems: 'center',
    marginBottom: Spacing.lg,
  }),

  headerTime: new Style<Label>({
    ...Fonts.caption,
    color: Colors.textSecondary,
  }),

  progressContainer: new Style<View>({
    padding: Spacing.md,
    backgroundColor: Colors.primaryLighter,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.lg,
    alignItems: 'center',
  }),

  progressLabel: new Style<Label>({
    ...Fonts.body,
    color: Colors.primary,
  }),

  stepsContainer: new Style<View>({
  }),

  stepContainer: new Style<View>({
    marginBottom: Spacing.none,
  }),

  stepHeader: new Style<View>({
    flexDirection: 'row',
  }),

  stepIndicator: new Style<View>({
    alignItems: 'center',
    paddingTop: Spacing.xs,
  }),

  stepIcon: new Style<View>({
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  }),

  stepConnector: new Style<View>({
    width: 2,
    flexGrow: 1,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
  }),

  stepContent: new Style<View>({
    flexGrow: 1,
    paddingBottom: Spacing.lg,
  }),

  stepTitleRow: new Style<View>({
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  }),

  stepOutputContainer: new Style<View>({
    marginTop: Spacing.md,
  }),

  stepErrorContainer: new Style<View>({
    marginTop: Spacing.md,
  }),

  outputBox: new Style<View>({
    padding: Spacing.md,
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  }),

  errorBox: new Style<View>({
    padding: Spacing.md,
    backgroundColor: Colors.errorLight,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.error,
  }),

  resultContainer: new Style<View>({
    marginTop: Spacing.xl,
    padding: Spacing.lg,
    backgroundColor: Colors.successLight,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.success,
  }),

  resultHeader: new Style<View>({
    marginBottom: Spacing.md,
  }),

  resultBox: new Style<View>({
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
  }),

  errorContainer: new Style<View>({
    marginTop: Spacing.xl,
    padding: Spacing.lg,
    backgroundColor: Colors.errorLight,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.error,
  }),

  errorHeader: new Style<View>({
    marginBottom: Spacing.md,
  }),
};
