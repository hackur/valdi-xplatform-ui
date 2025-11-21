/**
 * ListsDemo Component
 * Demonstrates dynamic list rendering with forEach, array operations, search, sorting, and performance optimization
 */

import { StatefulComponent } from 'valdi_core/src/Component';
import { Style } from 'valdi_core/src/Style';
import { NavigationController } from 'valdi_navigation/src/NavigationRoot';
import { NavigationPageComponent } from 'valdi_navigation/src/NavigationPageComponent';
import { NavigationPage } from 'valdi_navigation/src/decorators';
import { View, Label, Layout, ScrollView, TextField } from 'valdi_tsx/src/NativeTemplateElements';

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

export interface ListsDemoViewModel {
  navigationController: NavigationController;
}

interface ListItem {
  id: string;
  title: string;
  subtitle: string;
  timestamp: number;
}

interface ListsDemoState {
  // Basic rendering
  items: ListItem[];
  selectedId?: string;
  nextId: number;

  // Array operations
  operationItems: ListItem[];
  operationNextId: number;

  // Search
  allItems: ListItem[];
  filteredItems: ListItem[];
  searchQuery: string;

  // Sorting
  sortItems: ListItem[];
  sortBy: 'title' | 'date' | 'none';
  sortDirection: 'asc' | 'desc';

  // Performance
  largeListItems: ListItem[];
  useViewportLimit: boolean;
  viewportExtension: number;
}

@NavigationPage(module)
export class ListsDemo extends StatefulComponent<ListsDemoViewModel, ListsDemoState> {
  state: ListsDemoState = {
    // Basic rendering
    items: this.createSampleItems(0, 5),
    selectedId: undefined,
    nextId: 6,

    // Array operations
    operationItems: this.createSampleItems(100, 10),
    operationNextId: 111,

    // Search
    allItems: this.generateSearchItems(),
    filteredItems: this.generateSearchItems(),
    searchQuery: '',

    // Sorting
    sortItems: this.createSampleItems(200, 8),
    sortBy: 'none',
    sortDirection: 'asc',

    // Performance
    largeListItems: this.generateLargeDataset(100),
    useViewportLimit: true,
    viewportExtension: 200,
  };

  onRender() {
    <view style={styles.page}>
      {/* Header */}
      <Header
        title="Dynamic Lists"
        showBack={true}
        onBack={() => this.viewModel.navigationController.pop()}
      />

      {/* Content */}
      <scroll style={styles.scroll}>
        <layout style={styles.content}>
          {/* 1. Basic List Rendering */}
          <DemoSection
            title="Basic List Rendering"
            description="Use forEach with unique keys to render dynamic lists"
          >
            <Card>
              <layout width="100%" gap={Spacing.md}>
                <scroll style={styles.listContainer}>
                  <layout width="100%" gap={Spacing.xs}>
                    {this.state.items.forEach(item => (
                      <view
                        key={item.id}
                        style={{
                          ...styles.listItem,
                          backgroundColor: this.state.selectedId === item.id
                            ? Colors.primaryLight
                            : Colors.surface,
                        }}
                        onTap={() => this.setState({ selectedId: item.id })}
                      >
                        <layout width="100%" gap={2}>
                          <label
                            value={item.title}
                            font={Fonts.body}
                            color={
                              this.state.selectedId === item.id ? Colors.primary : Colors.textPrimary
                            }
                          />
                          <label
                            value={item.subtitle}
                            font={Fonts.caption}
                            color={Colors.textSecondary}
                          />
                          <label
                            value={new Date(item.timestamp).toLocaleTimeString()}
                            font={Fonts.caption}
                            color={Colors.textTertiary}
                          />
                        </layout>
                      </view>
                    ))}

                    {this.state.items.length === 0 && (
                      <view style={styles.emptyState}>
                        <label
                          value="No items to display"
                          font={Fonts.body}
                          color={Colors.textSecondary}
                        />
                        <label
                          value="Tap 'Add Items' to get started"
                          font={Fonts.caption}
                          color={Colors.textTertiary}
                        />
                      </view>
                    )}
                  </layout>
                </scroll>

                {this.state.selectedId && (
                  <view style={styles.selectionInfo}>
                    <label
                      value={`Selected: ${this.state.items.find(i => i.id === this.state.selectedId)?.title}`}
                      font={Fonts.caption}
                      color={Colors.primary}
                    />
                  </view>
                )}

                <layout flexDirection="row" gap={Spacing.sm} justifyContent="center">
                  <Button
                    title="Add 5 Items"
                    variant="primary"
                    size="small"
                    onTap={() => this.addBasicItems(5)}
                  />
                  <Button
                    title="Clear All"
                    variant="outline"
                    size="small"
                    onTap={() => this.setState({ items: [], selectedId: undefined })}
                  />
                </layout>

                <label
                  value={`Total items: ${this.state.items.length}`}
                  font={Fonts.caption}
                  color={Colors.textSecondary}
                  textAlign="center"
                />
              </layout>
            </Card>
          </DemoSection>

          {/* 2. Array Operations */}
          <DemoSection
            title="Array Operations"
            description="Add, remove, insert, and filter items with immutable updates"
          >
            <Card>
              <layout width="100%" gap={Spacing.md}>
                {/* Add Operations */}
                <layout width="100%" gap={Spacing.sm}>
                  <label value="Add Operations" font={Fonts.h4} color={Colors.textPrimary} />
                  <layout flexDirection="row" gap={Spacing.xs} flexWrap="wrap">
                    <Button
                      title="Add to Start"
                      variant="primary"
                      size="small"
                      onTap={() => this.addItemToStart()}
                    />
                    <Button
                      title="Add to End"
                      variant="primary"
                      size="small"
                      onTap={() => this.addItemToEnd()}
                    />
                    <Button
                      title="Insert at Middle"
                      variant="secondary"
                      size="small"
                      onTap={() =>
                        this.insertItemAt(Math.floor(this.state.operationItems.length / 2))
                      }
                    />
                  </layout>
                </layout>

                {/* Filter Operations */}
                <layout width="100%" gap={Spacing.sm}>
                  <label value="Filter Operations" font={Fonts.h4} color={Colors.textPrimary} />
                  <layout flexDirection="row" gap={Spacing.xs} flexWrap="wrap">
                    <Button
                      title="Show Even Only"
                      variant="outline"
                      size="small"
                      onTap={() => this.filterEvenItems()}
                    />
                    <Button
                      title="Show Odd Only"
                      variant="outline"
                      size="small"
                      onTap={() => this.filterOddItems()}
                    />
                    <Button
                      title="Reset"
                      variant="outline"
                      size="small"
                      onTap={() =>
                        this.setState({ operationItems: this.createSampleItems(100, 10) })
                      }
                    />
                  </layout>
                </layout>

                {/* Items List */}
                <layout width="100%" gap={Spacing.sm}>
                  <label
                    value={`Items (${this.state.operationItems.length})`}
                    font={Fonts.h4}
                    color={Colors.textPrimary}
                  />
                  <scroll style={styles.operationsList}>
                    <layout width="100%" gap={Spacing.xs}>
                      {this.state.operationItems.forEach((item, index) => (
                        <view key={item.id} style={styles.listItemWithActions}>
                          <layout flexGrow={1} gap={2}>
                            <label value={item.title} font={Fonts.body} color={Colors.textPrimary} />
                            <label
                              value={item.subtitle}
                              font={Fonts.caption}
                              color={Colors.textSecondary}
                            />
                          </layout>
                          <Button
                            title="Remove"
                            variant="outline"
                            size="small"
                            onTap={() => this.removeItem(item.id)}
                          />
                        </view>
                      ))}
                    </layout>
                  </scroll>
                </layout>
              </layout>
            </Card>
          </DemoSection>

          {/* 3. Search and Filter */}
          <DemoSection
            title="Search and Filter"
            description="Real-time search across multiple fields with result count"
          >
            <Card>
              <layout width="100%" gap={Spacing.md}>
                {/* Search Input */}
                <layout flexDirection="row" alignItems="center" gap={Spacing.sm} width="100%">
                  <textfield
                    value={this.state.searchQuery}
                    placeholder="Search items..."
                    returnKeyText="search"
                    onChange={e => this.handleSearch(e.value)}
                    style={styles.searchInput}
                  />
                  {this.state.searchQuery && (
                    <Button
                      title="Clear"
                      variant="outline"
                      size="small"
                      onTap={() => this.clearSearch()}
                    />
                  )}
                </layout>

                {/* Results Count */}
                <label
                  value={`Found ${this.state.filteredItems.length} of ${this.state.allItems.length} items`}
                  font={Fonts.caption}
                  color={Colors.textSecondary}
                />

                {/* Results List */}
                <scroll style={styles.searchResults}>
                  <layout width="100%" gap={Spacing.xs}>
                    {this.state.filteredItems.forEach(item => (
                      <view key={item.id} style={styles.searchResultItem}>
                        <label value={item.title} font={Fonts.body} color={Colors.textPrimary} />
                        <label
                          value={item.subtitle}
                          font={Fonts.caption}
                          color={Colors.textSecondary}
                        />
                      </view>
                    ))}

                    {this.state.filteredItems.length === 0 && this.state.searchQuery && (
                      <view style={styles.noResults}>
                        <label
                          value={`No results for "${this.state.searchQuery}"`}
                          font={Fonts.body}
                          color={Colors.textSecondary}
                        />
                        <label
                          value="Try a different search term"
                          font={Fonts.caption}
                          color={Colors.textTertiary}
                        />
                      </view>
                    )}
                  </layout>
                </scroll>
              </layout>
            </Card>
          </DemoSection>

          {/* 4. Sorting Operations */}
          <DemoSection
            title="Sorting Operations"
            description="Sort lists alphabetically or by date with ascending/descending order"
          >
            <Card>
              <layout width="100%" gap={Spacing.md}>
                {/* Sort Controls */}
                <layout flexDirection="row" gap={Spacing.xs} flexWrap="wrap">
                  <Button
                    title="A-Z"
                    variant={
                      this.state.sortBy === 'title' && this.state.sortDirection === 'asc'
                        ? 'primary'
                        : 'outline'
                    }
                    size="small"
                    onTap={() => this.sortItems('title', 'asc')}
                  />
                  <Button
                    title="Z-A"
                    variant={
                      this.state.sortBy === 'title' && this.state.sortDirection === 'desc'
                        ? 'primary'
                        : 'outline'
                    }
                    size="small"
                    onTap={() => this.sortItems('title', 'desc')}
                  />
                  <Button
                    title="Newest"
                    variant={
                      this.state.sortBy === 'date' && this.state.sortDirection === 'desc'
                        ? 'primary'
                        : 'outline'
                    }
                    size="small"
                    onTap={() => this.sortItems('date', 'desc')}
                  />
                  <Button
                    title="Oldest"
                    variant={
                      this.state.sortBy === 'date' && this.state.sortDirection === 'asc'
                        ? 'primary'
                        : 'outline'
                    }
                    size="small"
                    onTap={() => this.sortItems('date', 'asc')}
                  />
                  <Button
                    title="Reset"
                    variant="outline"
                    size="small"
                    onTap={() =>
                      this.setState({
                        sortItems: this.createSampleItems(200, 8),
                        sortBy: 'none',
                      })
                    }
                  />
                </layout>

                {this.state.sortBy !== 'none' && (
                  <view style={styles.sortInfo}>
                    <label
                      value={`Sorted by ${this.state.sortBy} (${this.state.sortDirection === 'asc' ? 'ascending' : 'descending'})`}
                      font={Fonts.caption}
                      color={Colors.primary}
                    />
                  </view>
                )}

                {/* Sorted List */}
                <scroll style={styles.sortedList}>
                  <layout width="100%" gap={Spacing.xs}>
                    {this.state.sortItems.forEach((item, index) => (
                      <view key={item.id} style={styles.sortedItem}>
                        <layout
                          flexDirection="row"
                          justifyContent="space-between"
                          alignItems="flex-start"
                          width="100%"
                          gap={Spacing.sm}
                        >
                          <layout flexGrow={1} gap={2}>
                            <label
                              value={`${index + 1}. ${item.title}`}
                              font={Fonts.body}
                              color={Colors.textPrimary}
                            />
                            <label
                              value={new Date(item.timestamp).toLocaleString()}
                              font={Fonts.caption}
                              color={Colors.textSecondary}
                            />
                          </layout>
                        </layout>
                      </view>
                    ))}
                  </layout>
                </scroll>
              </layout>
            </Card>
          </DemoSection>

          {/* 5. Large List Performance */}
          <DemoSection
            title="Large List Performance"
            description="Optimize rendering with viewport limiting for long lists"
          >
            <Card>
              <layout width="100%" gap={Spacing.md}>
                {/* Controls */}
                <layout flexDirection="row" gap={Spacing.sm} alignItems="center" flexWrap="wrap">
                  <Button
                    title={this.state.useViewportLimit ? 'Limit: ON' : 'Limit: OFF'}
                    variant={this.state.useViewportLimit ? 'primary' : 'outline'}
                    size="small"
                    onTap={() => this.setState({ useViewportLimit: !this.state.useViewportLimit })}
                  />
                  <label
                    value={`Items: ${this.state.largeListItems.length}`}
                    font={Fonts.body}
                    color={Colors.textPrimary}
                  />
                </layout>

                <layout flexDirection="row" gap={Spacing.xs} flexWrap="wrap">
                  <Button
                    title="50 Items"
                    variant="outline"
                    size="small"
                    onTap={() => this.setState({ largeListItems: this.generateLargeDataset(50) })}
                  />
                  <Button
                    title="100 Items"
                    variant="outline"
                    size="small"
                    onTap={() => this.setState({ largeListItems: this.generateLargeDataset(100) })}
                  />
                  <Button
                    title="500 Items"
                    variant="outline"
                    size="small"
                    onTap={() => this.setState({ largeListItems: this.generateLargeDataset(500) })}
                  />
                  <Button
                    title="1000 Items"
                    variant="outline"
                    size="small"
                    onTap={() => this.setState({ largeListItems: this.generateLargeDataset(1000) })}
                  />
                </layout>

                {/* Viewport Extension Controls */}
                {this.state.useViewportLimit && (
                  <layout width="100%" gap={Spacing.sm}>
                    <label
                      value={`Viewport Extension: ${this.state.viewportExtension}px`}
                      font={Fonts.body}
                      color={Colors.textPrimary}
                    />
                    <layout flexDirection="row" gap={Spacing.xs} flexWrap="wrap">
                      {[0, 200, 500, 1000].map(ext => (
                        <Button
                          key={ext}
                          title={`${ext}px`}
                          variant={this.state.viewportExtension === ext ? 'primary' : 'outline'}
                          size="small"
                          onTap={() => this.setState({ viewportExtension: ext })}
                        />
                      ))}
                    </layout>
                  </layout>
                )}

                {/* Performance Info */}
                <view style={styles.infoBox}>
                  <label
                    value={
                      this.state.useViewportLimit
                        ? 'Viewport limiting: Only visible items + extension area are rendered'
                        : 'No viewport limiting: All items are rendered (may be slow for large lists)'
                    }
                    font={Fonts.caption}
                    color={Colors.textSecondary}
                    numberOfLines={0}
                  />
                </view>

                {/* Large List */}
                <scroll
                  style={styles.largeList}
                  limitToViewport={this.state.useViewportLimit}
                  viewportExtensionTop={
                    this.state.useViewportLimit ? this.state.viewportExtension : undefined
                  }
                  viewportExtensionBottom={
                    this.state.useViewportLimit ? this.state.viewportExtension : undefined
                  }
                >
                  <layout width="100%" gap={1}>
                    {this.state.largeListItems.forEach((item, index) => (
                      <view key={item.id} style={styles.largeListItem}>
                        <layout
                          flexDirection="row"
                          justifyContent="space-between"
                          alignItems="center"
                          width="100%"
                        >
                          <layout flexGrow={1} gap={2}>
                            <label
                              value={`${index + 1}. ${item.title}`}
                              font={Fonts.body}
                              color={Colors.textPrimary}
                            />
                            <label
                              value={item.subtitle}
                              font={Fonts.caption}
                              color={Colors.textSecondary}
                            />
                          </layout>
                        </layout>
                      </view>
                    ))}
                  </layout>
                </scroll>

                <label
                  value={`Total: ${this.state.largeListItems.length} items • Viewport limiting ${this.state.useViewportLimit ? 'enabled' : 'disabled'}`}
                  font={Fonts.caption}
                  color={Colors.textSecondary}
                  textAlign="center"
                />
              </layout>
            </Card>
          </DemoSection>

          {/* Code Example */}
          <DemoSection title="Code Example">
            <CodeBlock
              language="tsx"
              code={`// Basic list rendering with forEach
interface ListItem {
  id: string;
  title: string;
}

<scroll>
  <layout>
    {items.forEach(item => (
      <view key={item.id}>
        <label value={item.title} />
      </view>
    ))}
  </layout>
</scroll>

// Immutable array operations
// Add to start
this.setState({
  items: [newItem, ...this.state.items]
});

// Add to end
this.setState({
  items: [...this.state.items, newItem]
});

// Insert at position
const newItems = [
  ...this.state.items.slice(0, index),
  newItem,
  ...this.state.items.slice(index)
];

// Remove by id
this.setState({
  items: this.state.items.filter(item => item.id !== id)
});

// Search and filter
const filtered = items.filter(item =>
  item.title.toLowerCase().includes(query.toLowerCase())
);

// Sort alphabetically
const sorted = [...items].sort((a, b) =>
  a.title.localeCompare(b.title)
);

// Performance optimization
<scroll
  limitToViewport={true}
  viewportExtensionTop={200}
  viewportExtensionBottom={200}
>
  {largeArray.forEach(item => (
    <view key={item.id}>{item}</view>
  ))}
</scroll>`}
            />
          </DemoSection>
        </layout>
      </scroll>
    </view>;
  }

  // Helper methods for creating sample data
  private createSampleItems(startId: number, count: number): ListItem[] {
    return Array.from({ length: count }, (_, i) => ({
      id: `item-${startId + i}`,
      title: `Item ${startId + i + 1}`,
      subtitle: `Description for item ${startId + i + 1}`,
      timestamp: Date.now() + i * 1000,
    }));
  }

  private generateSearchItems(): ListItem[] {
    const categories = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry', 'Fig', 'Grape', 'Honeydew'];
    const adjectives = ['Fresh', 'Organic', 'Sweet', 'Ripe', 'Premium', 'Delicious'];

    return Array.from({ length: 30 }, (_, i) => ({
      id: `search-item-${i}`,
      title: `${adjectives[i % adjectives.length]} ${categories[i % categories.length]}`,
      subtitle: `Product #${i + 1} - Available now`,
      timestamp: Date.now() - i * 60000,
    }));
  }

  private generateLargeDataset(count: number): ListItem[] {
    return Array.from({ length: count }, (_, i) => ({
      id: `large-item-${i}`,
      title: `Item ${i + 1}`,
      subtitle: `This is item number ${i + 1} in a large list`,
      timestamp: Date.now() + i * 1000,
    }));
  }

  // Basic rendering methods
  private addBasicItems(count: number) {
    const newItems = this.createSampleItems(this.state.nextId, count);
    this.setState({
      items: [...this.state.items, ...newItems],
      nextId: this.state.nextId + count,
    });
  }

  // Array operation methods
  private addItemToStart() {
    const newItem: ListItem = {
      id: `item-${this.state.operationNextId}`,
      title: `New Item ${this.state.operationNextId}`,
      subtitle: 'Added to start',
      timestamp: Date.now(),
    };

    this.setState({
      operationItems: [newItem, ...this.state.operationItems],
      operationNextId: this.state.operationNextId + 1,
    });
  }

  private addItemToEnd() {
    const newItem: ListItem = {
      id: `item-${this.state.operationNextId}`,
      title: `New Item ${this.state.operationNextId}`,
      subtitle: 'Added to end',
      timestamp: Date.now(),
    };

    this.setState({
      operationItems: [...this.state.operationItems, newItem],
      operationNextId: this.state.operationNextId + 1,
    });
  }

  private insertItemAt(index: number) {
    if (this.state.operationItems.length === 0) {
      this.addItemToStart();
      return;
    }

    const newItem: ListItem = {
      id: `item-${this.state.operationNextId}`,
      title: `Inserted Item ${this.state.operationNextId}`,
      subtitle: `Inserted at position ${index}`,
      timestamp: Date.now(),
    };

    const newItems = [
      ...this.state.operationItems.slice(0, index),
      newItem,
      ...this.state.operationItems.slice(index),
    ];

    this.setState({
      operationItems: newItems,
      operationNextId: this.state.operationNextId + 1,
    });
  }

  private removeItem(id: string) {
    this.setState({
      operationItems: this.state.operationItems.filter(item => item.id !== id),
    });
  }

  private filterEvenItems() {
    this.setState({
      operationItems: this.state.operationItems.filter(item => {
        const num = parseInt(item.title.match(/\d+/)?.[0] || '0');
        return num % 2 === 0;
      }),
    });
  }

  private filterOddItems() {
    this.setState({
      operationItems: this.state.operationItems.filter(item => {
        const num = parseInt(item.title.match(/\d+/)?.[0] || '0');
        return num % 2 !== 0;
      }),
    });
  }

  // Search methods
  private handleSearch(query: string) {
    const lowerQuery = query.toLowerCase().trim();

    if (!lowerQuery) {
      this.setState({
        searchQuery: query,
        filteredItems: this.state.allItems,
      });
      return;
    }

    const filtered = this.state.allItems.filter(
      item =>
        item.title.toLowerCase().includes(lowerQuery) ||
        item.subtitle.toLowerCase().includes(lowerQuery)
    );

    this.setState({
      searchQuery: query,
      filteredItems: filtered,
    });
  }

  private clearSearch() {
    this.setState({
      searchQuery: '',
      filteredItems: this.state.allItems,
    });
  }

  // Sorting methods
  private sortItems(by: 'title' | 'date', direction: 'asc' | 'desc') {
    const sorted = [...this.state.sortItems].sort((a, b) => {
      let comparison = 0;

      if (by === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (by === 'date') {
        comparison = a.timestamp - b.timestamp;
      }

      return direction === 'asc' ? comparison : -comparison;
    });

    this.setState({
      sortItems: sorted,
      sortBy: by,
      sortDirection: direction,
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

  // Basic list rendering styles
  listContainer: new Style<ScrollView>({
    width: '100%',
    height: 200,
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.base,
  }),

  listItem: new Style<View>({
    width: '100%',
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
  }),

  emptyState: new Style<View>({
    width: '100%',
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  }),

  selectionInfo: new Style<View>({
    width: '100%',
    padding: Spacing.sm,
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.sm,
  }),

  // Array operations styles
  operationsList: new Style<ScrollView>({
    width: '100%',
    height: 200,
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.base,
  }),

  listItemWithActions: new Style<View>({
    width: '100%',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  }),

  // Search styles
  searchInput: new Style<TextField>({
    flexGrow: 1,
    padding: Spacing.md,
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.base,
    borderWidth: 1,
    borderColor: Colors.border,
  }),

  searchResults: new Style<ScrollView>({
    width: '100%',
    height: 250,
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.base,
  }),

  searchResultItem: new Style<View>({
    width: '100%',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
  }),

  noResults: new Style<View>({
    width: '100%',
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  }),

  // Sorting styles
  sortInfo: new Style<View>({
    width: '100%',
    padding: Spacing.sm,
    backgroundColor: Colors.primaryLight,
    borderRadius: BorderRadius.sm,
  }),

  sortedList: new Style<ScrollView>({
    width: '100%',
    height: 200,
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.base,
  }),

  sortedItem: new Style<View>({
    width: '100%',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
  }),

  // Performance styles
  infoBox: new Style<View>({
    width: '100%',
    padding: Spacing.md,
    backgroundColor: Colors.gray100,
    borderRadius: BorderRadius.base,
  }),

  largeList: new Style<ScrollView>({
    width: '100%',
    height: 300,
    backgroundColor: Colors.gray50,
    borderRadius: BorderRadius.base,
  }),

  largeListItem: new Style<View>({
    width: '100%',
    padding: Spacing.sm,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  }),
};
