import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { Item } from './Item';

export function SortableItem({ id, prompt, updatePrompt, updateSlider, index }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Item
      ref={setNodeRef}
      style={style}
      attributes={attributes}
      listeners={listeners}
      prompt={prompt}
      updatePrompt={updatePrompt}
      updateSlider={updateSlider}
      index={index}
    />
  );
}
