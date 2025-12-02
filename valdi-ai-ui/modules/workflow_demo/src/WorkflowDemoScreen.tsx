/**
 * WorkflowDemoScreen
 *
 * Interactive demo screen showcasing different AI workflow patterns:
 * - Sequential: Steps execute one after another
 * - Parallel: Steps execute simultaneously
 * - Routing: Conditional branching based on results
 * - EvaluatorOptimizer: Iterative refinement with feedback
 */

import { StatefulComponent } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import type { View, ScrollView, Label } from 'valdi_tsx/src/NativeTemplateElements';
import type { SimpleNavigationController } from '../../common/src/index';
import {
  Card,
  Button,
  Colors,
  Fonts,
  Spacing,
  BorderRadius,
  ErrorBoundary,
  ErrorScreen,
  Logger,
} from '../../common/src/index';
import type { WorkflowExecutionState } from './WorkflowCard';
import { WorkflowCard } from './WorkflowCard';
import {
  runSequentialDemo,
  runParallelDemo,
  runRoutingDemo,
  runEvaluatorOptimizerDemo,
} from './examples';

/**
 * Workflow Type
 */
type WorkflowType = 'sequential' | 'parallel' | 'routing' | 'evaluator';

/**
 * Workflow Info
 */
interface WorkflowInfo {
  id: WorkflowType;
  name: string;
  description: string;
  icon: string;
  useCases: string[];
}

/**
 * Component State
 */
interface WorkflowDemoScreenState {
  selectedTab: WorkflowType;
  executionStates: Record<WorkflowType, WorkflowExecutionState>;
}

/**
 * WorkflowDemoScreen Props
 */
export interface WorkflowDemoScreenProps {
  navigationController: SimpleNavigationController;
}

/**
 * WorkflowDemo Screen Component
 */
export class WorkflowDemoScreen extends StatefulComponent<WorkflowDemoScreenProps, WorkflowDemoScreenState> {
  private readonly logger = new Logger({ module: 'WorkflowDemoScreen' });

  // Cache handlers for tab selection and workflow execution (per Valdi best practices)
  private readonly tabSelectHandlers = new Map<WorkflowType, () => void>();
  private readonly runWorkflowHandlers = new Map<WorkflowType, () => Promise<void>>();

  override state: WorkflowDemoScreenState = {
    selectedTab: 'sequential',
    executionStates: {
      sequential: { status: 'idle', steps: [], currentStep: 0 },
      parallel: { status: 'idle', steps: [], currentStep: 0 },
      routing: { status: 'idle', steps: [], currentStep: 0 },
      evaluator: { status: 'idle', steps: [], currentStep: 0 },
    },
  };

  /**
   * Workflow configurations
   */
  private readonly workflows: WorkflowInfo[] = [
    {
      id: 'sequential',
      name: 'Sequential Workflow',
      description:
        'Execute agents one after another, passing output from each step to the next. Perfect for linear, multi-step reasoning tasks.',
      icon: '➡️',
      useCases: [
        'Research → Analysis → Summary pipelines',
        'Code generation → Review → Optimization',
        'Translation → Refinement → Quality check',
      ],
    },
    {
      id: 'parallel',
      name: 'Parallel Workflow',
      description:
        'Execute multiple agents simultaneously and combine their results. Ideal for independent tasks that can run concurrently.',
      icon: '⚡',
      useCases: [
        'Multi-source research (news, papers, databases)',
        'Parallel translation to multiple languages',
        'Concurrent sentiment analysis across platforms',
      ],
    },
    {
      id: 'routing',
      name: 'Routing Workflow',
      description:
        'Dynamically route to different agents based on input classification or conditions. Great for conditional branching logic.',
      icon: '🔀',
      useCases: [
        'Customer support (technical vs billing vs general)',
        'Content classification (code, docs, design)',
        'Expertise routing (medical, legal, technical)',
      ],
    },
    {
      id: 'evaluator',
      name: 'Evaluator-Optimizer',
      description:
        'Iteratively refine outputs using an evaluator and optimizer agent pair. Best for tasks requiring quality refinement.',
      icon: '🔄',
      useCases: [
        'Iterative code improvement with quality checks',
        'Content refinement with style evaluation',
        'Design optimization with feedback loops',
      ],
    },
  ];

  /**
   * Handle tab selection
   */
  private readonly handleTabSelect = (tabId: WorkflowType): void => {
    this.setState({ selectedTab: tabId });
  };

  // Cached handler getters (per Valdi best practices)
  private getTabSelectHandler(tabId: WorkflowType): () => void {
    let handler = this.tabSelectHandlers.get(tabId);
    if (!handler) {
      handler = () => { this.handleTabSelect(tabId); };
      this.tabSelectHandlers.set(tabId, handler);
    }
    return handler;
  }

  private getRunWorkflowHandler(workflowType: WorkflowType): () => Promise<void> {
    let handler = this.runWorkflowHandlers.get(workflowType);
    if (!handler) {
      handler = async () => { await this.handleRunWorkflow(workflowType); };
      this.runWorkflowHandlers.set(workflowType, handler);
    }
    return handler;
  }

  /**
   * Handle workflow execution
   */
  private readonly handleRunWorkflow = async (
    workflowType: WorkflowType,
  ): Promise<void> => {
    // Update state to show loading
    this.setState({
      executionStates: {
        ...this.state.executionStates,
        [workflowType]: {
          status: 'running',
          steps: [],
          currentStep: 0,
        },
      },
    });

    try {
      let result;

      // Execute the appropriate workflow demo
      switch (workflowType) {
        case 'sequential':
          result = await runSequentialDemo((state) =>
            { this.updateWorkflowState(workflowType, state); },
          );
          break;
        case 'parallel':
          result = await runParallelDemo((state) =>
            { this.updateWorkflowState(workflowType, state); },
          );
          break;
        case 'routing':
          result = await runRoutingDemo((state) =>
            { this.updateWorkflowState(workflowType, state); },
          );
          break;
        case 'evaluator':
          result = await runEvaluatorOptimizerDemo((state) =>
            { this.updateWorkflowState(workflowType, state); },
          );
          break;
      }

      // Mark as completed
      this.setState({
        executionStates: {
          ...this.state.executionStates,
          [workflowType]: {
            ...this.state.executionStates[workflowType],
            status: 'completed',
            result,
          },
        },
      });
    } catch (error) {
      // Mark as error
      this.setState({
        executionStates: {
          ...this.state.executionStates,
          [workflowType]: {
            ...this.state.executionStates[workflowType],
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        },
      });
    }
  };

  /**
   * Update workflow execution state
   */
  private readonly updateWorkflowState = (
    workflowType: WorkflowType,
    newState: Partial<WorkflowExecutionState>,
  ): void => {
    this.setState({
      executionStates: {
        ...this.state.executionStates,
        [workflowType]: {
          ...this.state.executionStates[workflowType],
          ...newState,
        },
      },
    });
  };

  /**
   * Handle workflow execution errors
   */
  private readonly handleWorkflowError = (error: Error): void => {
    this.logger.error('Workflow demo error', error);
  };

  /**
   * Get tab style based on selection state
   */
  private getTabStyle(isSelected: boolean): Style<View> {
    return new Style<View>({
      paddingLeft: Spacing.xl,
      paddingRight: Spacing.xl,
      paddingTop: Spacing.md,
      paddingBottom: Spacing.md,
      borderRadius: BorderRadius.base,
      marginRight: Spacing.sm,
      backgroundColor: isSelected ? Colors.primary : Colors.surface,
      borderWidth: 1,
      borderColor: isSelected ? Colors.primary : Colors.border,
    });
  }

  /**
   * Get tab label style based on selection state
   */
  private getTabLabelStyle(isSelected: boolean): Style<Label> {
    return new Style<Label>({
      ...Fonts.buttonSmall,
      color: isSelected ? Colors.textInverse : Colors.textPrimary,
    });
  }

  override onRender() {
    const { selectedTab, executionStates } = this.state;
    const selectedWorkflow = this.workflows.find((w) => w.id === selectedTab)!;
    const executionState = executionStates[selectedTab];

    return (
      <ErrorBoundary
        fallback={(error: Error) => (
          <ErrorScreen
            error={error}
            title="Workflow Demo Error"
            message="An error occurred while running the workflow demo."
            showDetails={false}
          />
        )}
        onError={this.handleWorkflowError}
      >
        <scroll style={styles.container}>
        {/* Header */}
        <view style={styles.header}>
          <label value="Workflow Patterns Demo" style={styles.pageTitle} />
          <label
            value="Explore different AI workflow patterns and see how they execute step-by-step"
            style={styles.headerSubtitle}
          />
        </view>

        {/* Tabs */}
        <view style={styles.tabsContainer}>
          <scroll horizontal={true} style={styles.tabsScroll}>
            {this.workflows.map((workflow) => (
              <view
                style={this.getTabStyle(selectedTab === workflow.id)}
                onTap={this.getTabSelectHandler(workflow.id)}
              >
                <label
                  value={`${workflow.icon} ${workflow.name}`}
                  style={this.getTabLabelStyle(selectedTab === workflow.id)}
                />
              </view>
            ))}
          </scroll>
        </view>

        {/* Selected Workflow Content */}
        <view style={styles.content}>
          {/* Workflow Info Card */}
          <Card elevation="md" style={styles.infoCard as unknown as Record<string, unknown>}>
            <label
              value={`${selectedWorkflow.icon} ${selectedWorkflow.name}`}
              style={styles.sectionTitle}
            />
            <label
              value={selectedWorkflow.description}
              style={styles.workflowDescription}
            />

            {/* Use Cases */}
            <view style={styles.useCasesContainer}>
              <label
                value="Common Use Cases:"
                style={styles.useCasesTitle}
              />
              {selectedWorkflow.useCases.map((useCase) => (
                <view style={styles.useCaseItem}>
                  <label
                    value="•"
                    style={styles.useCaseBullet}
                  />
                  <label
                    value={useCase}
                    style={styles.useCaseText}
                  />
                </view>
              ))}
            </view>

            {/* Run Button */}
            <Button
              title={
                executionState.status === 'running' ? 'Running...' : 'Run Demo'
              }
              variant="primary"
              size="large"
              fullWidth={true}
              loading={executionState.status === 'running'}
              disabled={executionState.status === 'running'}
              onTap={this.getRunWorkflowHandler(selectedTab)}
              style={styles.buttonContainer as unknown as Record<string, unknown>}
            />
          </Card>

          {/* Workflow Execution Card */}
          <WorkflowCard
            workflowName={selectedWorkflow.name}
            executionState={executionState}
          />
        </view>
      </scroll>
      </ErrorBoundary>
    );
  }
}

const styles = {
  container: new Style<ScrollView>({
    flexGrow: 1,
    backgroundColor: Colors.background,
  }),

  header: new Style<View>({
    padding: Spacing.xl,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  }),

  tabsContainer: new Style<View>({
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  }),

  tabsScroll: new Style<ScrollView>({
    padding: Spacing.base,
  }),

  tab: new Style<View>({
    paddingLeft: Spacing.xl,
    paddingRight: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
    borderRadius: BorderRadius.base,
    marginRight: Spacing.sm,
  }),

  content: new Style<View>({
    padding: Spacing.xl,
  }),

  infoCard: new Style<View>({
    padding: Spacing.xl,
  }),

  useCasesContainer: new Style<View>({
    marginTop: Spacing.xl,
  }),

  useCaseItem: new Style<View>({
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  }),

  pageTitle: new Style<Label>({
    ...Fonts.h1,
  }),

  sectionTitle: new Style<Label>({
    ...Fonts.h2,
  }),

  headerSubtitle: new Style<Label>({
    ...Fonts.body,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  }),

  workflowDescription: new Style<Label>({
    ...Fonts.body,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  }),

  useCasesTitle: new Style<Label>({
    ...Fonts.captionBold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  }),

  useCaseBullet: new Style<Label>({
    ...Fonts.body,
    color: Colors.primary,
  }),

  useCaseText: new Style<Label>({
    ...Fonts.body,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
  }),

  buttonContainer: new Style<View>({
    marginTop: Spacing.xl,
  }),
};
