import { useState } from 'react';
import './TagItem.css';

const TagItem = ({ name, id, onRemove, addRemoveSelectedTag, enableHighlight = false }) => {
  const [highlighted, setHighlighted] = useState(false);

  const handleTagClick = () => {
    const next = !highlighted;
    setHighlighted(next);
    addRemoveSelectedTag(id, next);
  };

  return (
    <div
      className={highlighted ? 'tag-highlighted' : 'tag'}
      onClick={enableHighlight ? handleTagClick : undefined}
      style={{ cursor: enableHighlight ? 'pointer' : 'default' }}
    >
      <span>{name}</span>

      <button
        className="removeButton"
        onClick={e => {
          e.stopPropagation();
          onRemove(id);
        }}
      >
        &times;
      </button>
    </div>
  );
};


export default TagItem;


