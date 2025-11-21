/**
 * HomePage Component
 * Main landing page with demo section cards
 */

import { Component } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { NavigationController } from 'valdi_navigation/src/NavigationRoot';
import { NavigationPageComponent } from 'valdi_navigation/src/NavigationPageComponent';
import { NavigationPage } from 'valdi_navigation/src/decorators';
import { View, Label, Layout, ScrollView } from 'valdi_tsx/src/NativeTemplateElements';

import { Colors, Fonts, Spacing, BorderRadius, Shadows } from '../../common/src/index';

// Demo imports
import { LayoutsDemo } from '../../layouts_demo/src/index';
import { TextDemo } from '../../text_demo/src/index';
import { ImagesDemo } from '../../images_demo/src/index';
import { ScrollingDemo } from '../../scrolling_demo/src/index';
import { GesturesDemo } from '../../gestures_demo/src/index';
import { StylingDemo } from '../../styling_demo/src/index';
import { StateDemo } from '../../state_demo/src/index';
import { AnimationDemo } from '../../animation_demo/src/index';
import { ShapesDemo } from '../../shapes_demo/src/index';
import { FormsDemo } from '../../forms_demo/src/index';
import { ListsDemo } from '../../lists_demo/src/index';

export interface HomePageViewModel {
  navigationController: NavigationController;
}

/**
 * Demo section data structure
 */
interface DemoSection {
  id: string;
  title: string;
  description: string;
  emoji: string;
  color: string;
  // page: Component class to navigate to
}

@NavigationPage(module)
export class HomePage extends NavigationPageComponent<HomePageViewModel> {
  private demoSections: DemoSection[] = [
    {
      id: 'layouts',
      title: 'Layouts & Flexbox',
      description: 'Explore <layout>, <view>, and flexbox positioning',
      emoji: '📐',
      color: Colors.primary,
    },
    {
      id: 'text',
      title: 'Text Elements',
      description: '<label>, <textfield>, <textview> with styling',
      emoji: '📝',
      color: Colors.secondary,
    },
    {
      id: 'media',
      title: 'Images & Media',
      description: '<image>, <video>, and animated content',
      emoji: '🖼️',
      color: Colors.success,
    },
    {
      id: 'scroll',
      title: 'Scrolling & Lists',
      description: '<scroll> with vertical and horizontal content',
      emoji: '📜',
      color: Colors.warning,
    },
    {
      id: 'gestures',
      title: 'Gestures',
      description: 'Tap, drag, pinch, rotate, and long press',
      emoji: '👆',
      color: Colors.error,
    },
    {
      id: 'styling',
      title: 'Advanced Styling',
      description: 'Gradients, shadows, borders, and transforms',
      emoji: '🎨',
      color: '#EC4899', // Pink
    },
    {
      id: 'state',
      title: 'State & Lifecycle',
      description: 'Component state management and lifecycle',
      emoji: '🔄',
      color: '#14B8A6', // Teal
    },
    {
      id: 'animations',
      title: 'Animations',
      description: 'Smooth transitions and spring animations',
      emoji: '✨',
      color: '#F59E0B', // Amber
    },
    {
      id: 'shapes',
      title: 'Shapes & Paths',
      description: 'Custom shapes with <shape> element',
      emoji: '⬛',
      color: '#6366F1', // Indigo
    },
    {
      id: 'slots',
      title: 'Slots & Composition',
      description: 'Content projection with <slot>',
      emoji: '🧩',
      color: '#8B5CF6', // Purple
    },
    {
      id: 'forms',
      title: 'Forms & Validation',
      description: 'Input handling and form validation',
      emoji: '📋',
      color: '#10B981', // Green
    },
    {
      id: 'lists',
      title: 'Dynamic Lists',
      description: 'Rendering and managing dynamic content',
      emoji: '📊',
      color: '#3B82F6', // Blue
    },
  ];

  onRender() {
    <view style={styles.page}>
      {/* Header */}
      <view style={styles.header}>
        <label style={styles.headerTitle} value="Valdi Kitchen Sink" />
        <label
          style={styles.headerSubtitle}
          value="Comprehensive demonstration of all Valdi features"
          numberOfLines={2}
        />
      </view>

      {/* Scrollable content */}
      <scroll style={styles.scroll}>
        <layout style={styles.grid}>
          {this.demoSections.forEach(section => this.renderDemoCard(section))}
        </layout>
      </scroll>
    </view>;
  }

  private renderDemoCard(section: DemoSection) {
    <view
      style={styles.card}
      onTap={() => this.navigateToDemo(section.id)}
    >
      {/* Color accent bar */}
      <view
        style={styles.cardAccent}
        backgroundColor={section.color}
      />

      {/* Card content */}
      <layout style={styles.cardContent}>
        {/* Emoji icon */}
        <label style={styles.cardEmoji} value={section.emoji} />

        {/* Title and description */}
        <layout style={styles.cardText}>
          <label style={styles.cardTitle} value={section.title} />
          <label
            style={styles.cardDescription}
            value={section.description}
            numberOfLines={2}
          />
        </layout>

        {/* Arrow indicator */}
        <label style={styles.cardArrow} value="→" />
      </layout>
    </view>;
  }

  private navigateToDemo(demoId: string) {
    const navigationMap: Record<string, typeof Component> = {
      'layouts': LayoutsDemo,
      'text': TextDemo,
      'media': ImagesDemo,
      'scroll': ScrollingDemo,
      'gestures': GesturesDemo,
      'styling': StylingDemo,
      'state': StateDemo,
      'animations': AnimationDemo,
      'shapes': ShapesDemo,
      'slots': StateDemo, // TODO: Replace with SlotsDemo when implemented
      'forms': FormsDemo,
      'lists': ListsDemo,
    };

    const DemoComponent = navigationMap[demoId];
    if (DemoComponent) {
      this.viewModel.navigationController.push(DemoComponent, { navigationController: this.viewModel.navigationController }, {});
    }
  }
}

const styles = {
  page: new Style<View>({
    width: '100%',
    height: '100%',
    backgroundColor: Colors.background,
  }),

  header: new Style<View>({
    width: '100%',
    backgroundColor: Colors.primary,
    paddingTop: 60, // Status bar + padding
    paddingBottom: Spacing.xl,
    paddingLeft: Spacing.lg,
    paddingRight: Spacing.lg,
    boxShadow: Shadows.md,
  }),

  headerTitle: new Style<Label>({
    font: Fonts.h1,
    color: Colors.white,
    marginBottom: Spacing.xs,
  }),

  headerSubtitle: new Style<Label>({
    font: Fonts.body,
    color: Colors.white,
    opacity: 0.9,
  }),

  scroll: new Style<ScrollView>({
    width: '100%',
    flex: 1,
  }),

  grid: new Style<Layout>({
    width: '100%',
    padding: Spacing.base,
    gap: Spacing.base,
  }),

  card: new Style<View>({
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    boxShadow: Shadows.base,
    overflow: 'hidden',
  }),

  cardAccent: new Style<View>({
    width: '100%',
    height: 4,
  }),

  cardContent: new Style<Layout>({
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    gap: Spacing.md,
  }),

  cardEmoji: new Style<Label>({
    font: Fonts.h1,
    width: 48,
    textAlign: 'center',
  }),

  cardText: new Style<Layout>({
    flex: 1,
    gap: Spacing.xs,
  }),

  cardTitle: new Style<Label>({
    font: Fonts.h4,
    color: Colors.textPrimary,
  }),

  cardDescription: new Style<Label>({
    font: Fonts.bodySmall,
    color: Colors.textSecondary,
  }),

  cardArrow: new Style<Label>({
    font: Fonts.h3,
    color: Colors.primary,
  }),
};
