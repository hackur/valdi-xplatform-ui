# Dynamic Lists Demo - Implementation Plan

## Overview
Demonstrate Valdi's dynamic list rendering capabilities using forEach with keys. Show array operations (add, remove, filter, sort), search functionality, and performance optimization with viewport limiting for large lists.

## Valdi Capabilities Identified

### forEach with Keys
```typescript
// Array rendering with forEach
{arrayData.forEach((item, index) => (
  <view key={item.id}>  {/* Key is crucial for efficient updates */}
    <label value={item.title} />
  </view>
))}

// Common pattern from existing demos
{Array.from({ length: count }).map((_, i) => (
  <view key={i}>
    <label value={`Item ${i + 1}`} />
  </view>
))}
```

### ScrollView with Viewport Optimization
```typescript
interface ScrollView {
  limitToViewport?: boolean;  // Only render visible items
  viewportExtensionTop?: number;  // Preload distance above
  viewportExtensionBottom?: number;  // Preload distance below
  viewportExtensionLeft?: number;
  viewportExtensionRight?: number;
}
```

### Key Concepts
- **Keys**: Unique identifiers for efficient list updates
- **Immutable Updates**: Always create new arrays for state changes
- **Viewport Limiting**: Performance optimization for long lists
- **Dynamic Operations**: Add, remove, filter, sort array elements

## Implementation Sections

### 1. Basic List Rendering with forEach (1.5 hours)

**Features to demonstrate:**
- Simple array rendering
- Using keys correctly
- List item components
- Array.from vs existing arrays
- Indexed items

**Example structure:**
```typescript
interface ListItem {
  id: string;
  title: string;
  subtitle: string;
  timestamp: number;
}

interface BasicListState {
  items: ListItem[];
  selectedId?: string;
}

private createSampleItems(count: number): ListItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `item-${Date.now()}-${i}`,
    title: `Item ${i + 1}`,
    subtitle: `Description for item ${i + 1}`,
    timestamp: Date.now() + i,
  }));
}

<DemoSection title="Basic List Rendering">
  <Card>
    <scroll style={styles.listContainer}>
      <layout>
        {/* forEach with proper keys */}
        {this.state.items.forEach(item => (
          <view
            key={item.id}
            style={{
              ...styles.listItem,
              backgroundColor: this.state.selectedId === item.id
                ? Colors.primaryLight
                : Colors.white,
            }}
            onTap={() => this.setState({ selectedId: item.id })}
          >
            <layout>
              <label value={item.title} font={Fonts.body} color={Colors.text} />
              <label value={item.subtitle} font={Fonts.caption} color={Colors.textSecondary} />
              <label
                value={new Date(item.timestamp).toLocaleTimeString()}
                font={Fonts.caption}
                color={Colors.textSecondary}
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
          </view>
        )}
      </layout>
    </scroll>

    <layout flexDirection="row">
      <Button
        title="Add 5 Items"
        variant="primary"
        onTap={() => this.addItems(5)}
      />
      <Button
        title="Clear All"
        variant="outline"
        onTap={() => this.setState({ items: [] })}
      />
    </layout>
  </Card>
</DemoSection>
```

### 2. Array Operations (Add, Remove, Filter) (2 hours)

**Features:**
- Add item to start
- Add item to end
- Insert item at position
- Remove specific item
- Remove by index
- Clear all
- Filter by criteria
- Animated additions/removals

**State management:**
```typescript
interface ArrayOpsState {
  items: ListItem[];
  nextId: number;
}

private addItemToStart() {
  const newItem: ListItem = {
    id: `item-${this.state.nextId}`,
    title: `New Item ${this.state.nextId}`,
    subtitle: 'Added to start',
    timestamp: Date.now(),
  };

  this.setState({
    items: [newItem, ...this.state.items],
    nextId: this.state.nextId + 1,
  });
}

private addItemToEnd() {
  const newItem: ListItem = {
    id: `item-${this.state.nextId}`,
    title: `New Item ${this.state.nextId}`,
    subtitle: 'Added to end',
    timestamp: Date.now(),
  };

  this.setState({
    items: [...this.state.items, newItem],
    nextId: this.state.nextId + 1,
  });
}

private insertItemAt(index: number) {
  const newItem: ListItem = {
    id: `item-${this.state.nextId}`,
    title: `Inserted Item ${this.state.nextId}`,
    subtitle: `Inserted at position ${index}`,
    timestamp: Date.now(),
  };

  const newItems = [
    ...this.state.items.slice(0, index),
    newItem,
    ...this.state.items.slice(index),
  ];

  this.setState({
    items: newItems,
    nextId: this.state.nextId + 1,
  });
}

private removeItem(id: string) {
  this.setState({
    items: this.state.items.filter(item => item.id !== id),
  });
}

private removeItemAt(index: number) {
  this.setState({
    items: this.state.items.filter((_, i) => i !== index),
  });
}

private filterItems(predicate: (item: ListItem) => boolean) {
  this.setState({
    items: this.state.items.filter(predicate),
  });
}
```

**UI structure:**
```typescript
<DemoSection title="Array Operations">
  <Card>
    <layout>
      {/* Operation buttons */}
      <label value="Add Operations" font={Fonts.h3} />
      <layout flexDirection="row" flexWrap="wrap">
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
          onTap={() => this.insertItemAt(Math.floor(this.state.items.length / 2))}
        />
      </layout>

      <label value="Filter Operations" font={Fonts.h3} />
      <layout flexDirection="row" flexWrap="wrap">
        <Button
          title="Show Even Only"
          variant="outline"
          size="small"
          onTap={() => this.filterItems(item => {
            const num = parseInt(item.title.match(/\d+/)?.[0] || '0');
            return num % 2 === 0;
          })}
        />
        <Button
          title="Show Odd Only"
          variant="outline"
          size="small"
          onTap={() => this.filterItems(item => {
            const num = parseInt(item.title.match(/\d+/)?.[0] || '0');
            return num % 2 !== 0;
          })}
        />
        <Button
          title="Reset"
          variant="outline"
          size="small"
          onTap={() => this.setState({ items: this.createSampleItems(10) })}
        />
      </layout>

      {/* List with remove buttons */}
      <label value={`Items (${this.state.items.length})`} font={Fonts.h3} />
      <scroll style={styles.operationsList}>
        <layout>
          {this.state.items.forEach((item, index) => (
            <view key={item.id} style={styles.listItemWithActions}>
              <layout flexGrow={1}>
                <label value={item.title} font={Fonts.body} />
                <label value={item.subtitle} font={Fonts.caption} color={Colors.textSecondary} />
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
  </Card>
</DemoSection>
```

### 3. Search and Filter (2 hours)

**Features:**
- Real-time search
- Case-insensitive search
- Search across multiple fields
- Clear search
- Search result count
- No results state

**State management:**
```typescript
interface SearchState {
  allItems: ListItem[];  // Original data
  filteredItems: ListItem[];  // Search results
  searchQuery: string;
}

private handleSearch(query: string) {
  const lowerQuery = query.toLowerCase().trim();

  if (!lowerQuery) {
    // No search query - show all
    this.setState({
      searchQuery: query,
      filteredItems: this.state.allItems,
    });
    return;
  }

  const filtered = this.state.allItems.filter(item => {
    return (
      item.title.toLowerCase().includes(lowerQuery) ||
      item.subtitle.toLowerCase().includes(lowerQuery)
    );
  });

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
```

**UI structure:**
```typescript
<DemoSection title="Search and Filter">
  <Card>
    <layout>
      {/* Search input */}
      <layout flexDirection="row" alignItems="center">
        <textfield
          value={this.state.searchQuery}
          placeholder="Search items..."
          returnKeyText="search"
          onChange={(e) => this.handleSearch(e.value)}
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

      {/* Results count */}
      <label
        value={`Found ${this.state.filteredItems.length} of ${this.state.allItems.length} items`}
        font={Fonts.caption}
        color={Colors.textSecondary}
      />

      {/* Results list */}
      <scroll style={styles.searchResults}>
        <layout>
          {this.state.filteredItems.forEach(item => (
            <view key={item.id} style={styles.searchResultItem}>
              <label value={item.title} font={Fonts.body} />
              <label value={item.subtitle} font={Fonts.caption} color={Colors.textSecondary} />
            </view>
          ))}

          {this.state.filteredItems.length === 0 && this.state.searchQuery && (
            <view style={styles.noResults}>
              <label
                value={`No results for "${this.state.searchQuery}"`}
                font={Fonts.body}
                color={Colors.textSecondary}
              />
            </view>
          )}
        </layout>
      </scroll>
    </layout>
  </Card>
</DemoSection>
```

### 4. Sorting Operations (1.5 hours)

**Features:**
- Sort alphabetically (A-Z, Z-A)
- Sort by date (newest/oldest first)
- Sort by number
- Toggle sort direction
- Multiple sort criteria

**State management:**
```typescript
interface SortState {
  items: ListItem[];
  sortBy: 'title' | 'date' | 'none';
  sortDirection: 'asc' | 'desc';
}

private sortItems(by: 'title' | 'date', direction: 'asc' | 'desc') {
  const sorted = [...this.state.items].sort((a, b) => {
    let comparison = 0;

    if (by === 'title') {
      comparison = a.title.localeCompare(b.title);
    } else if (by === 'date') {
      comparison = a.timestamp - b.timestamp;
    }

    return direction === 'asc' ? comparison : -comparison;
  });

  this.setState({
    items: sorted,
    sortBy: by,
    sortDirection: direction,
  });
}

private toggleSortDirection() {
  const newDirection = this.state.sortDirection === 'asc' ? 'desc' : 'asc';
  if (this.state.sortBy !== 'none') {
    this.sortItems(this.state.sortBy, newDirection);
  }
}
```

**UI structure:**
```typescript
<DemoSection title="Sorting">
  <Card>
    <layout>
      {/* Sort controls */}
      <layout flexDirection="row" flexWrap="wrap">
        <Button
          title="A-Z"
          variant={this.state.sortBy === 'title' && this.state.sortDirection === 'asc' ? 'primary' : 'outline'}
          size="small"
          onTap={() => this.sortItems('title', 'asc')}
        />
        <Button
          title="Z-A"
          variant={this.state.sortBy === 'title' && this.state.sortDirection === 'desc' ? 'primary' : 'outline'}
          size="small"
          onTap={() => this.sortItems('title', 'desc')}
        />
        <Button
          title="Newest"
          variant={this.state.sortBy === 'date' && this.state.sortDirection === 'desc' ? 'primary' : 'outline'}
          size="small"
          onTap={() => this.sortItems('date', 'desc')}
        />
        <Button
          title="Oldest"
          variant={this.state.sortBy === 'date' && this.state.sortDirection === 'asc' ? 'primary' : 'outline'}
          size="small"
          onTap={() => this.sortItems('date', 'asc')}
        />
      </layout>

      {this.state.sortBy !== 'none' && (
        <label
          value={`Sorted by ${this.state.sortBy} (${this.state.sortDirection})`}
          font={Fonts.caption}
          color={Colors.textSecondary}
        />
      )}

      {/* Sorted list */}
      <scroll style={styles.sortedList}>
        <layout>
          {this.state.items.forEach((item, index) => (
            <view key={item.id} style={styles.sortedItem}>
              <label value={`${index + 1}. ${item.title}`} font={Fonts.body} />
              <label
                value={new Date(item.timestamp).toLocaleString()}
                font={Fonts.caption}
                color={Colors.textSecondary}
              />
            </view>
          ))}
        </layout>
      </scroll>
    </layout>
  </Card>
</DemoSection>
```

### 5. Performance: Large Lists with Viewport Limiting (2 hours)

**Features:**
- Generate large dataset (100+ items)
- Without viewport limiting (baseline)
- With viewport limiting
- Performance comparison
- Viewport extension configuration
- Scroll position tracking

**State management:**
```typescript
interface PerformanceState {
  items: ListItem[];
  useViewportLimit: boolean;
  viewportExtension: number;
  renderCount: number;  // Track how many items rendered
}

private generateLargeDataset(count: number): ListItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `item-${i}`,
    title: `Item ${i + 1}`,
    subtitle: `This is item number ${i + 1} in a large list`,
    timestamp: Date.now() + i * 1000,
  }));
}
```

**UI structure:**
```typescript
<DemoSection title="Large List Performance">
  <Card>
    <layout>
      {/* Controls */}
      <layout flexDirection="row" flexWrap="wrap" alignItems="center">
        <Button
          title={this.state.useViewportLimit ? "Limit: ON" : "Limit: OFF"}
          variant={this.state.useViewportLimit ? 'primary' : 'outline'}
          onTap={() => this.setState({ useViewportLimit: !this.state.useViewportLimit })}
        />
        <label
          value={`Items: ${this.state.items.length}`}
          font={Fonts.body}
        />
        <Button
          title="50 Items"
          variant="outline"
          size="small"
          onTap={() => this.setState({ items: this.generateLargeDataset(50) })}
        />
        <Button
          title="100 Items"
          variant="outline"
          size="small"
          onTap={() => this.setState({ items: this.generateLargeDataset(100) })}
        />
        <Button
          title="500 Items"
          variant="outline"
          size="small"
          onTap={() => this.setState({ items: this.generateLargeDataset(500) })}
        />
      </layout>

      {/* Viewport extension slider */}
      {this.state.useViewportLimit && (
        <layout>
          <label
            value={`Viewport Extension: ${this.state.viewportExtension}px`}
            font={Fonts.body}
          />
          <layout flexDirection="row" flexWrap="wrap">
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

      {/* Performance note */}
      <view style={styles.infoBox}>
        <label
          value={
            this.state.useViewportLimit
              ? "Viewport limiting: Only visible items + extension area are rendered"
              : "No viewport limiting: All items are rendered (may be slow for large lists)"
          }
          font={Fonts.caption}
          color={Colors.textSecondary}
        />
      </view>

      {/* Large list */}
      <scroll
        style={styles.largeList}
        limitToViewport={this.state.useViewportLimit}
        viewportExtensionTop={this.state.useViewportLimit ? this.state.viewportExtension : undefined}
        viewportExtensionBottom={this.state.useViewportLimit ? this.state.viewportExtension : undefined}
      >
        <layout>
          {this.state.items.forEach((item, index) => (
            <view key={item.id} style={styles.largeListItem}>
              <label value={`${index + 1}. ${item.title}`} font={Fonts.body} />
              <label value={item.subtitle} font={Fonts.caption} color={Colors.textSecondary} />
            </view>
          ))}
        </layout>
      </scroll>
    </layout>
  </Card>
</DemoSection>
```

## State Management

```typescript
interface DynamicListsDemoState {
  // Basic rendering
  items: ListItem[];
  selectedId?: string;
  nextId: number;

  // Array operations
  operationItems: ListItem[];

  // Search
  allItems: ListItem[];
  filteredItems: ListItem[];
  searchQuery: string;

  // Sorting
  sortBy: 'title' | 'date' | 'none';
  sortDirection: 'asc' | 'desc';

  // Performance
  largeListItems: ListItem[];
  useViewportLimit: boolean;
  viewportExtension: number;
}

interface ListItem {
  id: string;
  title: string;
  subtitle: string;
  timestamp: number;
}
```

## Code Examples to Include

### Immutable Array Updates
```typescript
// Add to start
const newItems = [newItem, ...this.state.items];

// Add to end
const newItems = [...this.state.items, newItem];

// Insert at position
const newItems = [
  ...this.state.items.slice(0, index),
  newItem,
  ...this.state.items.slice(index)
];

// Remove by id
const newItems = this.state.items.filter(item => item.id !== idToRemove);

// Update item
const newItems = this.state.items.map(item =>
  item.id === targetId ? { ...item, ...updates } : item
);
```

### Generic Sort Function
```typescript
function sortBy<T>(
  array: T[],
  key: keyof T,
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    let comparison = 0;
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      comparison = aVal.localeCompare(bVal);
    } else if (typeof aVal === 'number' && typeof bVal === 'number') {
      comparison = aVal - bVal;
    }

    return direction === 'asc' ? comparison : -comparison;
  });
}
```

## Performance Considerations

1. **Keys**: Always use unique, stable keys (not array index if order changes)
2. **Immutability**: Never mutate state arrays directly
3. **Viewport Limiting**: Essential for lists with 50+ items
4. **Viewport Extension**: Balance between preloading and memory (200-500px recommended)
5. **Search Debouncing**: Consider debouncing search input for large datasets
6. **Virtual Scrolling**: Viewport limiting provides virtual scrolling behavior

## Estimated Effort

- **Basic list rendering with forEach**: 1.5 hours
- **Array operations (add, remove, filter)**: 2 hours
- **Search and filter**: 2 hours
- **Sorting operations**: 1.5 hours
- **Large lists with viewport limiting**: 2 hours
- **Testing & polish**: 1 hour

**Total: 10 hours**

## Success Criteria

- [ ] forEach renders items correctly with keys
- [ ] Adding items updates list immediately
- [ ] Removing items updates list immediately
- [ ] Array operations maintain immutability
- [ ] Search filters results in real-time
- [ ] Search is case-insensitive
- [ ] Clear search restores all items
- [ ] Sort A-Z and Z-A work correctly
- [ ] Sort by date works (newest/oldest)
- [ ] Large lists (100+) render without lag
- [ ] Viewport limiting improves performance measurably
- [ ] Viewport extension affects preloading
- [ ] Empty states display correctly
- [ ] No results state displays for empty search
- [ ] Works on both iOS and Android
- [ ] No memory leaks with large datasets

## Advanced Features to Showcase

1. **Infinite Scroll**: Load more items when scrolling to bottom
2. **Pull to Refresh**: Reload list data
3. **Swipe to Delete**: Gesture-based item removal
4. **Drag to Reorder**: Reorderable lists
5. **Grouped Lists**: Section headers and grouped items
