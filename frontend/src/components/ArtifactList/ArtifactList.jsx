import styles from './ArtifactList.module.css';
import { useState, useEffect, useMemo, memo } from 'react';
import { FixedSizeList as List } from 'react-window';
import ArtifactTextItem from '../ArtifactTextItem';
import ArtifactFileItem from '../ArtifactFileItem';

const ArtifactList = ({ artifacts, onRemoveArtifact, onAddTag, onRemoveTag, onEditArtifact, fetchArtifactsData, hasMoreItems, downloadFileArtifact }) => {
  const [itemsPerRow, setItemsPerRow] = useState(3);
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    const updateItemsPerRow = () => {
      if (window.innerWidth >= 1301) {
        setItemsPerRow(3);
      } else if (window.innerWidth >= 861) {
        setItemsPerRow(2);
      } else {
        setItemsPerRow(1);
      }
    };

    updateItemsPerRow();
    window.addEventListener('resize', updateItemsPerRow);
    return () => window.removeEventListener('resize', updateItemsPerRow);
  }, []);
  const totalRows = useMemo(() => Math.ceil(artifacts.length / itemsPerRow), [artifacts.length, itemsPerRow]);
  const ITEM_HEIGHT = 550;
  const GAP = 15;
  const ROW_HEIGHT = ITEM_HEIGHT + GAP;


  const handleItemsRendered = ({ visibleStopIndex }) => {
    if (visibleStopIndex >= totalRows - 2 && !isFetchingData && hasMoreItems) {
      setIsFetchingData(true);
      fetchArtifactsData().finally(() => {
        setIsFetchingData(false);
      });
    }
    const newIsAtBottom = visibleStopIndex >= totalRows - 1;
    if (newIsAtBottom !== isAtBottom) {
      setIsAtBottom(newIsAtBottom);
    }
  };
  const renderRow = ({ index, style }) => {
    const startIndex = index * itemsPerRow;
    const rowItems = artifacts.slice(startIndex, startIndex + itemsPerRow);

    return (
      <div style={{
        ...style,
        display: 'grid',
        width: `100%`,
        gridTemplateColumns: `repeat(${itemsPerRow}, 1fr)`,
        gap: '15px',
      }}>
        {rowItems.map((artifact) => {
          if (artifact.inputType === 'TEXT') {
            return (
              <ArtifactTextItem
                key={artifact.id}
                artifactId={artifact.id}
                title={artifact.title}
                content={artifact.content}
                tags={artifact.tags || []}
                onRemove={() => onRemoveArtifact(artifact.id)}
                onAddTag={onAddTag}
                onRemoveTag={onRemoveTag}
                onEditArtifact={onEditArtifact}
              />
            );
          } else if (artifact.inputType === 'FILE') {
            return (
              <ArtifactFileItem
                key={artifact.id}
                artifactId={artifact.id}
                title={artifact.title}
                filename={artifact.filename}
                fileSize={artifact.fileSize}
                tags={artifact.tags || []}
                onRemove={() => onRemoveArtifact(artifact.id)}
                onAddTag={onAddTag}
                onRemoveTag={onRemoveTag}
                onEditArtifact={onEditArtifact}
                downloadFileArtifact={downloadFileArtifact}
              />
            );
          }
          return null;
        })}
      </div>
    );
  };


  return (
    <div
      style={{
        position: 'relative',
        borderRadius: `8px`,
        padding: `0px`
      }}
    >
      <List
        height={ITEM_HEIGHT * 2 + GAP}
        style={{ borderRadius: `8px`, overflowX: 'hidden', overflowY: 'scroll', scrollbarWidth: 'none' }}
        width={380 * itemsPerRow + (itemsPerRow - 1) * 15}
        itemCount={totalRows}
        itemSize={ROW_HEIGHT}
        overscanCount={6}
        onItemsRendered={handleItemsRendered}
      >
        {renderRow}
      </List>
      {!isAtBottom && (
        <p className={styles.listScrollIndicator}>---</p>
      )}
    </div>
  );
};

export default memo(ArtifactList);

