import React from 'react';
import ArtifactTextItem from '../ArtifactTextItem';
import ArtifactFileItem from '../ArtifactFileItem';

const ArtifactList = ({ artifacts, onRemoveArtifact, onAddTag, onRemoveTag, onEditArtifact }) => {
  return (
    <>
      {artifacts.map((artifact) => {
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
            />
          );
        }
        return null;
      })}
    </>
  );
};

export default ArtifactList;

