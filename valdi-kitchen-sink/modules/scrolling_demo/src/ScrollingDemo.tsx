/**
 * ScrollingDemo Component
 * Demonstrates ScrollView capabilities including vertical/horizontal scrolling,
 * scroll events, paging, programmatic scrolling, and performance optimization
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
  AnimationDurations,
} from '../../common/src/index';

export interface ScrollingDemoViewModel {
  navigationController: NavigationController;
}

interface ScrollOffset {
  x: number;
  y: number;
}

interface ScrollEvent {
  offset: ScrollOffset;
  overscrollTension: ScrollOffset;
  velocity: ScrollOffset;
}

interface ScrollEndEvent {
  offset: ScrollOffset;
  decelerated: boolean;
}

interface ScrollDragEndingEvent {
  offset: ScrollOffset;
  velocity: ScrollOffset;
  targetOffset: ScrollOffset;
}

interface ScrollDragEndEvent {
  offset: ScrollOffset;
  velocity: ScrollOffset;
}

interface ScrollingDemoState {
  // Basic scrolling
  verticalBounces: boolean;
  horizontalBounces: boolean;

  // Scroll tracking
  scrollPosition: ScrollOffset;
  scrollVelocity: ScrollOffset;
  isScrolling: boolean;
  isDragging: boolean;
  overscrollTension: ScrollOffset;

  // Paging
  currentPage: number;
  totalPages: number;

  // Programmatic scrolling
  targetScrollY: number;

  // Performance
  useViewportLimit: boolean;
  viewportExtension: number;
  itemCount: number;
}

@NavigationPage(module)
export class ScrollingDemo extends StatefulComponent<ScrollingDemoViewModel, ScrollingDemoState> {
  state: ScrollingDemoState = {
    // Basic scrolling
    verticalBounces: true,
    horizontalBounces: true,

    // Scroll tracking
    scrollPosition: { x: 0, y: 0 },
    scrollVelocity: { x: 0, y: 0 },
    isScrolling: false,
    isDragging: false,
    overscrollTension: { x: 0, y: 0 },

    // Paging
    currentPage: 0,
    totalPages: 5,

    // Programmatic scrolling
    targetScrollY: 0,

    // Performance
    useViewportLimit: true,
    viewportExtension: 200,
    itemCount: 100,
  };

  onRender() {
    <view style={styles.page}>
      {/* Header */}
      <Header
        title="Scrolling & Lists"
        showBack={true}
        onBack={() => this.viewModel.navigationController.pop()}
      />

      {/* Content */}
      <scroll style={styles.scroll}>
        <layout style={styles.content}>
          {/* Basic Vertical Scrolling */}
          <DemoSection
            title="Vertical Scrolling"
            description="Basic vertical scrolling with bounce effects"
          >
            <Card>
              <layout width="100%" gap={Spacing.md}>
                <scroll
                  horizontal={false}
                  bounces={this.state.verticalBounces}
                  style={styles.verticalScroll}
                >
                  <layout width="100%" gap={Spacing.sm}>
                    {Array.from({ length: 20 }).map((_, i) => (
                      <view key={i} style={styles.scrollItem}>
                        <label
                          font={Fonts.body}
                          color={Colors.textPrimary}
                          value={`Vertical Item ${i + 1}`}
                        />
                      </view>
                    ))}
                  </layout>
                </scroll>

                <Button
                  title={this.state.verticalBounces ? 'Disable Bounce' : 'Enable Bounce'}
                  variant={this.state.verticalBounces ? 'primary' : 'outline'}
                  size="small"
                  onTap={() => this.setState({ verticalBounces: !this.state.verticalBounces })}
                />
              </layout>
            </Card>
          </DemoSection>

          {/* Horizontal Scrolling */}
          <DemoSection
            title="Horizontal Scrolling"
            description="Horizontal scrolling with row layout"
          >
            <Card>
              <layout width="100%" gap={Spacing.md}>
                <scroll
                  horizontal={true}
                  bounces={this.state.horizontalBounces}
                  style={styles.horizontalScroll}
                >
                  <layout flexDirection="row" gap={Spacing.md}>
                    {Array.from({ length: 10 }).map((_, i) => (
                      <view key={i} style={styles.horizontalItem}>
                        <label
                          font={Fonts.h3}
                          color={Colors.white}
                          value={`${i + 1}`}
                        />
                      </view>
                    ))}
                  </layout>
                </scroll>

                <Button
                  title={this.state.horizontalBounces ? 'Disable Bounce' : 'Enable Bounce'}
                  variant={this.state.horizontalBounces ? 'primary' : 'outline'}
                  size="small"
                  onTap={() => this.setState({ horizontalBounces: !this.state.horizontalBounces })}
                />
              </layout>
            </Card>
          </DemoSection>

          {/* Scroll Event Tracking */}
          <DemoSection
            title="Scroll Event Tracking"
            description="Real-time scroll position, velocity, and event monitoring"
          >
            <Card>
              <layout width="100%" gap={Spacing.md}>
                <scroll
                  onScroll={e => this.onScroll(e)}
                  onScrollEnd={e => this.onScrollEnd(e)}
                  onDragStart={e => this.onDragStart(e)}
                  onDragEnd={e => this.onDragEnd(e)}
                  style={styles.trackedScroll}
                >
                  <layout width="100%" gap={Spacing.sm}>
                    {Array.from({ length: 30 }).map((_, i) => (
                      <view key={i} style={styles.trackedItem}>
                        <label
                          font={Fonts.body}
                          color={Colors.textPrimary}
                          value={`Scroll Item ${i + 1}`}
                        />
                      </view>
                    ))}
                  </layout>
                </scroll>

                {/* Metrics Display */}
                <view style={styles.metricsCard}>
                  <layout width="100%" gap={Spacing.sm}>
                    <label
                      font={Fonts.labelSmall}
                      color={Colors.textSecondary}
                      value="SCROLL METRICS"
                    />
                    <layout flexDirection="row" justifyContent="space-between">
                      <label
                        font={Fonts.body}
                        color={Colors.textPrimary}
                        value="Position:"
                      />
                      <label
                        font={Fonts.body}
                        color={Colors.primary}
                        value={`${Math.round(this.state.scrollPosition.y)}px`}
                      />
                    </layout>
                    <layout flexDirection="row" justifyContent="space-between">
                      <label
                        font={Fonts.body}
                        color={Colors.textPrimary}
                        value="Velocity:"
                      />
                      <label
                        font={Fonts.body}
                        color={Colors.secondary}
                        value={`${Math.round(this.state.scrollVelocity.y)}px/s`}
                      />
                    </layout>
                    <layout flexDirection="row" justifyContent="space-between">
                      <label
                        font={Fonts.body}
                        color={Colors.textPrimary}
                        value="Status:"
                      />
                      <label
                        font={Fonts.body}
                        color={this.state.isScrolling ? Colors.success : Colors.gray400}
                        value={this.state.isScrolling ? 'Scrolling' : 'Stopped'}
                      />
                    </layout>
                    <layout flexDirection="row" justifyContent="space-between">
                      <label
                        font={Fonts.body}
                        color={Colors.textPrimary}
                        value="Dragging:"
                      />
                      <label
                        font={Fonts.body}
                        color={this.state.isDragging ? Colors.warning : Colors.gray400}
                        value={this.state.isDragging ? 'Yes' : 'No'}
                      />
                    </layout>
                    {this.state.overscrollTension.y !== 0 && (
                      <layout flexDirection="row" justifyContent="space-between">
                        <label
                          font={Fonts.body}
                          color={Colors.textPrimary}
                          value="Overscroll:"
                        />
                        <label
                          font={Fonts.body}
                          color={Colors.warning}
                          value={`${this.state.overscrollTension.y.toFixed(2)}`}
                        />
                      </layout>
                    )}
                  </layout>
                </view>
              </layout>
            </Card>
          </DemoSection>

          {/* Paging & Snapping */}
          <DemoSection
            title="Horizontal Paging"
            description="Swipe between pages with snap-to-page behavior"
          >
            <Card>
              <layout width="100%" gap={Spacing.md}>
                <scroll
                  horizontal={true}
                  pagingEnabled={true}
                  onScroll={e => this.onPageScroll(e)}
                  onDragEnding={e => this.onDragEnding(e)}
                  style={styles.pageScroll}
                >
                  <layout flexDirection="row">
                    {Array.from({ length: this.state.totalPages }).map((_, i) => (
                      <view key={i} style={styles.page}>
                        <layout
                          width="100%"
                          height="100%"
                          alignItems="center"
                          justifyContent="center"
                          gap={Spacing.lg}
                        >
                          <label
                            font={Fonts.h1}
                            color={Colors.white}
                            value={`Page ${i + 1}`}
                          />
                          <label
                            font={Fonts.body}
                            color={Colors.white}
                            value="Swipe to see more"
                          />
                        </layout>
                      </view>
                    ))}
                  </layout>
                </scroll>

                {/* Page Indicator Dots */}
                <layout
                  flexDirection="row"
                  justifyContent="center"
                  gap={Spacing.xs}
                  style={styles.pageIndicator}
                >
                  {Array.from({ length: this.state.totalPages }).map((_, i) => (
                    <view
                      key={i}
                      style={{
                        ...styles.dot,
                        backgroundColor:
                          i === this.state.currentPage ? Colors.primary : Colors.gray300,
                      }}
                    />
                  ))}
                </layout>

                <label
                  font={Fonts.caption}
                  color={Colors.textSecondary}
                  textAlign="center"
                  value={`Page ${this.state.currentPage + 1} of ${this.state.totalPages}`}
                />
              </layout>
            </Card>
          </DemoSection>

          {/* Programmatic Scrolling */}
          <DemoSection
            title="Programmatic Scrolling"
            description="Control scroll position with animations"
          >
            <Card>
              <layout width="100%" gap={Spacing.md}>
                <scroll
                  contentOffsetY={this.state.targetScrollY}
                  style={styles.programmaticScroll}
                >
                  <layout width="100%" gap={Spacing.sm}>
                    {Array.from({ length: 30 }).map((_, i) => (
                      <view key={i} style={styles.listItem}>
                        <layout
                          flexDirection="row"
                          justifyContent="space-between"
                          alignItems="center"
                          width="100%"
                        >
                          <label
                            font={Fonts.body}
                            color={Colors.textPrimary}
                            value={`Item ${i + 1}`}
                          />
                          <Button
                            title="Scroll Here"
                            size="small"
                            variant="outline"
                            onTap={() => this.scrollToItem(i)}
                          />
                        </layout>
                      </view>
                    ))}
                  </layout>
                </scroll>

                {/* Scroll Controls */}
                <layout flexDirection="row" gap={Spacing.sm} justifyContent="center">
                  <Button
                    title="↑ Top"
                    variant="outline"
                    size="small"
                    onTap={() => this.scrollToTop()}
                  />
                  <Button
                    title="↓ Bottom"
                    variant="outline"
                    size="small"
                    onTap={() => this.scrollToBottom()}
                  />
                  <Button
                    title="→ Item 15"
                    variant="primary"
                    size="small"
                    onTap={() => this.scrollToItem(14)}
                  />
                </layout>
              </layout>
            </Card>
          </DemoSection>

          {/* Performance Optimization */}
          <DemoSection
            title="Performance Optimization"
            description="Viewport limiting for long lists with many items"
          >
            <Card>
              <layout width="100%" gap={Spacing.md}>
                <layout width="100%" gap={Spacing.sm}>
                  <label
                    font={Fonts.body}
                    color={Colors.textSecondary}
                    value="Rendering optimization for long lists. Enable viewport limiting to render only visible items."
                  />

                  {/* Controls */}
                  <layout flexDirection="row" gap={Spacing.sm} justifyContent="center">
                    <Button
                      title={this.state.useViewportLimit ? 'Limit: ON' : 'Limit: OFF'}
                      variant={this.state.useViewportLimit ? 'primary' : 'outline'}
                      size="small"
                      onTap={() =>
                        this.setState({ useViewportLimit: !this.state.useViewportLimit })
                      }
                    />
                    <view style={styles.extensionLabel}>
                      <label
                        font={Fonts.body}
                        color={Colors.textPrimary}
                        value={`Extension: ${this.state.viewportExtension}px`}
                      />
                    </view>
                  </layout>
                </layout>

                <scroll
                  limitToViewport={this.state.useViewportLimit}
                  viewportExtensionTop={this.state.viewportExtension}
                  viewportExtensionBottom={this.state.viewportExtension}
                  style={styles.performanceScroll}
                >
                  <layout width="100%" gap={Spacing.xs}>
                    {Array.from({ length: this.state.itemCount }).map((_, i) => (
                      <view key={i} style={styles.performanceItem}>
                        <layout
                          flexDirection="row"
                          justifyContent="space-between"
                          alignItems="center"
                          width="100%"
                        >
                          <label
                            font={Fonts.body}
                            color={Colors.textPrimary}
                            value={`Item ${i + 1}`}
                          />
                          <label
                            font={Fonts.caption}
                            color={Colors.textSecondary}
                            value={this.state.useViewportLimit ? 'Optimized' : 'Always rendered'}
                          />
                        </layout>
                      </view>
                    ))}
                  </layout>
                </scroll>

                <label
                  font={Fonts.caption}
                  color={Colors.textSecondary}
                  textAlign="center"
                  value={`Total items: ${this.state.itemCount} • Viewport limiting ${this.state.useViewportLimit ? 'enabled' : 'disabled'}`}
                />
              </layout>
            </Card>
          </DemoSection>

          {/* Code Example */}
          <DemoSection title="Code Example">
            <CodeBlock
              language="tsx"
              code={`// Basic scrolling
<scroll
  horizontal={false}
  bounces={true}
>
  {items.map((item, i) => (
    <view key={i}>{item}</view>
  ))}
</scroll>

// Scroll events
<scroll
  onScroll={(e) => {
    console.log(e.offset.y);
    console.log(e.velocity.y);
  }}
  onScrollEnd={(e) => {
    console.log('Stopped at:', e.offset.y);
  }}
>
  {/* Content */}
</scroll>

// Paging
<scroll
  horizontal={true}
  pagingEnabled={true}
>
  <layout flexDirection="row">
    {pages.map((page, i) => (
      <view key={i} width={300}>
        {page}
      </view>
    ))}
  </layout>
</scroll>

// Programmatic scrolling
<scroll
  contentOffsetY={this.state.targetY}
>
  {/* Content */}
</scroll>

// Animate to position
this.animate(
  { duration: 0.4, curve: 'easeInOut' },
  () => this.setState({ targetY: 500 })
);

// Performance optimization
<scroll
  limitToViewport={true}
  viewportExtensionTop={200}
  viewportExtensionBottom={200}
>
  {/* Long list */}
</scroll>`}
            />
          </DemoSection>
        </layout>
      </scroll>
    </view>;
  }

  // Scroll event handlers
  private onScroll(event: ScrollEvent) {
    this.setState({
      scrollPosition: event.offset,
      scrollVelocity: event.velocity,
      overscrollTension: event.overscrollTension,
      isScrolling: true,
    });
  }

  private onScrollEnd(event: ScrollEndEvent) {
    this.setState({
      isScrolling: false,
      scrollPosition: event.offset,
    });
  }

  private onDragStart(event: ScrollEvent) {
    this.setState({ isDragging: true });
  }

  private onDragEnd(event: ScrollDragEndEvent) {
    this.setState({ isDragging: false });
  }

  // Paging handlers
  private onPageScroll(event: ScrollEvent) {
    // Assuming page width is 300 (matches page style width)
    const pageWidth = 300;
    const currentPage = Math.round(event.offset.x / pageWidth);

    if (currentPage !== this.state.currentPage && currentPage >= 0 && currentPage < this.state.totalPages) {
      this.setState({ currentPage });
    }
  }

  private onDragEnding(event: ScrollDragEndingEvent): ScrollOffset | undefined {
    // Custom snap behavior - snap to nearest page
    const pageWidth = 300;
    const targetPage = Math.round(event.targetOffset.x / pageWidth);

    return {
      x: targetPage * pageWidth,
      y: 0,
    };
  }

  // Programmatic scrolling methods
  private scrollToTop() {
    this.setState({ targetScrollY: 0 });
  }

  private scrollToBottom() {
    const itemHeight = 60;
    const totalItems = 30;
    const contentHeight = totalItems * itemHeight;
    const viewportHeight = 200; // Matches scroll view height
    const maxScroll = contentHeight - viewportHeight;

    const options = {
      duration: AnimationDurations.slow,
      curve: 'easeInOut' as const,
    };

    this.animate(options, () => {
      this.setState({ targetScrollY: maxScroll });
    });
  }

  private scrollToItem(index: number) {
    const itemHeight = 60;
    const targetY = index * itemHeight;

    const options = {
      duration: AnimationDurations.normal,
      curve: 'easeOut' as const,
    };

    this.animate(options, () => {
      this.setState({ targetScrollY: targetY });
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

  // Basic scrolling styles
  verticalScroll: new Style<ScrollView>({
    width: '100%',
    height: 200,
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.base,
  }),

  scrollItem: new Style<View>({
    width: '100%',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
  }),

  horizontalScroll: new Style<ScrollView>({
    width: '100%',
    height: 120,
  }),

  horizontalItem: new Style<View>({
    width: 100,
    height: 100,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.base,
    alignItems: 'center',
    justifyContent: 'center',
  }),

  // Scroll tracking styles
  trackedScroll: new Style<ScrollView>({
    width: '100%',
    height: 200,
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.base,
  }),

  trackedItem: new Style<View>({
    width: '100%',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
  }),

  metricsCard: new Style<View>({
    width: '100%',
    padding: Spacing.md,
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.base,
  }),

  // Paging styles
  pageScroll: new Style<ScrollView>({
    width: '100%',
    height: 250,
  }),

  page: new Style<View>({
    width: 300,
    height: 250,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.base,
    marginRight: Spacing.md,
  }),

  pageIndicator: new Style<Layout>({
    padding: Spacing.sm,
  }),

  dot: new Style<View>({
    width: 8,
    height: 8,
    borderRadius: 4,
  }),

  // Programmatic scrolling styles
  programmaticScroll: new Style<ScrollView>({
    width: '100%',
    height: 200,
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.base,
  }),

  listItem: new Style<View>({
    width: '100%',
    height: 60,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
  }),

  // Performance styles
  performanceScroll: new Style<ScrollView>({
    width: '100%',
    height: 300,
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.base,
  }),

  performanceItem: new Style<View>({
    width: '100%',
    padding: Spacing.sm,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  }),

  extensionLabel: new Style<View>({
    padding: Spacing.sm,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.md,
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.sm,
  }),
};
