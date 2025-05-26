import React, { memo } from 'react';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

const VirtualizedList = ({ items = [], renderItem, itemHeight = 50 }) => {
  // Memoize the Row component to prevent unnecessary re-renders
  const Row = memo(({ index, style }) => {
    if (!items[index]) return null;
    return (
      <div style={style}>
        {renderItem(items[index], index)}
      </div>
    );
  });

  // If no items, render an empty state
  if (!items.length) {
    return (
      <div className="empty-state">
        No items to display
      </div>
    );
  }

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <AutoSizer>
        {({ height, width }) => (
          <List
            height={height}
            itemCount={items.length}
            itemSize={itemHeight}
            width={width}
            overscanCount={5} // Pre-render 5 items before/after visible area
          >
            {Row}
          </List>
        )}
      </AutoSizer>
    </div>
  );
};

export default memo(VirtualizedList); 