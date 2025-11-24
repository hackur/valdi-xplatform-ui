/**
 * WorkflowDemoScreen
 *
 * Interactive demo screen showcasing different AI workflow patterns:
 * - Sequential: Steps execute one after another
 * - Parallel: Steps execute simultaneously
 * - Routing: Conditional branching based on results
 * - EvaluatorOptimizer: Iterative refinement with feedback
 */

import { Component } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { View, ScrollView } from 'valdi_tsx/src/NativeTemplateElements';
import { Card, Button, Colors, Fonts, Spacing, BorderRadius } from '../common/src';
import { WorkflowCard, WorkflowExecutionState } from './WorkflowCard';
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
 * WorkflowDemo Screen Component
 */
export class WorkflowDemoScreen extends Component<{}, WorkflowDemoScreenState> {
  state: WorkflowDemoScreenState = {
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
  private workflows: WorkflowInfo[] = [
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
  private handleTabSelect = (tabId: WorkflowType): void => {
    this.setState({ selectedTab: tabId });
  };

  /**
   * Handle workflow execution
   */
  private handleRunWorkflow = async (
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
            this.updateWorkflowState(workflowType, state),
          );
          break;
        case 'parallel':
          result = await runParallelDemo((state) =>
            this.updateWorkflowState(workflowType, state),
          );
          break;
        case 'routing':
          result = await runRoutingDemo((state) =>
            this.updateWorkflowState(workflowType, state),
          );
          break;
        case 'evaluator':
          result = await runEvaluatorOptimizerDemo((state) =>
            this.updateWorkflowState(workflowType, state),
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
  private updateWorkflowState = (
    workflowType: WorkflowType,
    state: Partial<WorkflowExecutionState>,
  ): void => {
    this.setState({
      executionStates: {
        ...this.state.executionStates,
        [workflowType]: {
          ...this.state.executionStates[workflowType],
          ...state,
        },
      },
    });
  };

  onRender() {
    const { selectedTab, executionStates } = this.state;
    const selectedWorkflow = this.workflows.find((w) => w.id === selectedTab)!;
    const executionState = executionStates[selectedTab];

    return (
      <ScrollView style={styles.container}>
        {/* Header */}
        <view style={styles.header}>
          <label value="Workflow Patterns Demo" style={Fonts.h1} />
          <label
            value="Explore different AI workflow patterns and see how they execute step-by-step"
            style={{
              ...Fonts.body,
              color: Colors.textSecondary,
              marginTop: Spacing.sm,
            }}
          />
        </view>

        {/* Tabs */}
        <view style={styles.tabsContainer}>
          <ScrollView horizontal={true} style={styles.tabsScroll}>
            {this.workflows.map((workflow) => (
              <view
                key={workflow.id}
                style={{
                  ...styles.tab,
                  backgroundColor:
                    selectedTab === workflow.id
                      ? Colors.primary
                      : Colors.surface,
                  borderWidth: 1,
                  borderColor:
                    selectedTab === workflow.id
                      ? Colors.primary
                      : Colors.border,
                }}
                onTap={() => this.handleTabSelect(workflow.id)}
              >
                <label
                  value={`${workflow.icon} ${workflow.name}`}
                  style={{
                    ...Fonts.buttonSmall,
                    color:
                      selectedTab === workflow.id
                        ? Colors.textInverse
                        : Colors.textPrimary,
                  }}
                />
              </view>
            ))}
          </ScrollView>
        </view>

        {/* Selected Workflow Content */}
        <view style={styles.content}>
          {/* Workflow Info Card */}
          <Card elevation="md" style={styles.infoCard}>
            <label
              value={`${selectedWorkflow.icon} ${selectedWorkflow.name}`}
              style={Fonts.h2}
            />
            <label
              value={selectedWorkflow.description}
              style={{
                ...Fonts.body,
                color: Colors.textSecondary,
                marginTop: Spacing.md,
              }}
            />

            {/* Use Cases */}
            <view style={styles.useCasesContainer}>
              <label
                value="Common Use Cases:"
                style={{
                  ...Fonts.captionBold,
                  color: Colors.textSecondary,
                  marginBottom: Spacing.sm,
                }}
              />
              {selectedWorkflow.useCases.map((useCase, index) => (
                <view key={index} style={styles.useCaseItem}>
                  <label
                    value="•"
                    style={{ ...Fonts.body, color: Colors.primary }}
                  />
                  <label
                    value={useCase}
                    style={{
                      ...Fonts.body,
                      color: Colors.textSecondary,
                      marginLeft: Spacing.sm,
                    }}
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
              onTap={() => this.handleRunWorkflow(selectedTab)}
              style={{ marginTop: Spacing.xl }}
            />
          </Card>

          {/* Workflow Execution Card */}
          <WorkflowCard
            workflowName={selectedWorkflow.name}
            executionState={executionState}
          />
        </view>
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

  tabsContainer: new Style<View>({
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  }),

  tabsScroll: new Style<ScrollView>({
    padding: Spacing.base,
  }),

  tab: new Style<View>({
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.base,
    marginRight: Spacing.sm,
  }),

  content: new Style<View>({
    padding: Spacing.xl,
    gap: Spacing.xl,
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
};
