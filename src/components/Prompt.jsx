// Prompt.jsx
import React, { useState, useEffect } from 'react';
import {
  Accordion,
  AccordionSummary,
  Typography,
  Stack,
  Button,
  Divider,
  Grid,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { 
  DndContext, 
  DragOverlay, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  TouchSensor,
  useSensor, 
  useSensors
} from '@dnd-kit/core';
import { arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';

import { SortableItem } from './SortableItem';
import { Item } from './Item';

export default function Prompt({ promptType, onPromptDataChange, initialPrompts }) {
  const [prompts, setPrompts] = useState(
    initialPrompts.map((prompt, index) => ({
      ...prompt,
      id: `item-${index}`,
      ...(prompt.type === 'transition' && {
        after: { ...prompt.after, value: Number(prompt.after.value) || 0 },
        before: { ...prompt.before, value: Number(prompt.before.value) || 0 },
      }),
    })) || []
  );

  const [activeId, setActiveId] = useState(null);
  const touchSensorOptions = {
    // Use either delay or distance
    activationConstraint: {
      delay: 250,     // delay in milliseconds
      tolerance: 5    // tolerance in pixels
    },
    // Or
    // activationConstraint: {
    //   distance: 5, // distance in pixels
    // },
  };
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
    useSensor(TouchSensor, touchSensorOptions)
  );
  

  const [isUpdated, setIsUpdated] = useState(false);

  useEffect(() => {
    if (Array.isArray(initialPrompts)) {
      setPrompts(initialPrompts.map((prompt, index) => ({ ...prompt, id: `item-${index}` })));
    }
  }, [initialPrompts]);

  useEffect(() => {
    if (isUpdated && Array.isArray(prompts)) {
      onPromptDataChange(prompts);
      setIsUpdated(false);
    }
  }, [prompts, onPromptDataChange, isUpdated]);

  const addGlobal = () => {
    const newPrompt = { type: 'global', tag: '', id: `item-${prompts.length}` };
    setPrompts([...prompts, newPrompt]);
  };

  const addTransition = () => {
    const newPrompt = {
      type: 'transition',
      id: `item-${prompts.length}`,
      after: { tag: '', value: 0 },
      before: { tag: '', value: 100 },
    };
    setPrompts([...prompts, newPrompt]);
  };

  const updatePrompt = (index, key, value) => {
    const newPrompts = prompts.map((prompt, idx) => {
      if (idx === index) {
        if (key === 'after' || key === 'before') {
          return { ...prompt, [key]: { ...prompt[key], tag: value } };
        }
        return { ...prompt, [key]: value };
      }
      return prompt;
    });
    setPrompts(newPrompts);
    setIsUpdated(true);
  };

  const updateSlider = (index, value) => {
    const newPrompts = prompts.map((prompt, idx) => {
      if (idx === index && prompt.type === 'transition') {
        return {
          ...prompt,
          after: { ...prompt.after, value: 100 - Number(value[1]) },
          before: { ...prompt.before, value: 100 - Number(value[0]) },
        };
      }
      return prompt;
    });
    setPrompts(newPrompts);
    setIsUpdated(true);
  };

  function handleDragStart(event) {
    const { active } = event;
    setActiveId(active.id);
  }

  function handleDragEnd(event) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setPrompts((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
    setIsUpdated(true);
    setActiveId(null);
  }

  return (
    <div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <SortableContext items={prompts} strategy={verticalListSortingStrategy}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
              <Typography>{promptType === 'main' ? 'Add' : 'Remove'} Tags</Typography>
            </AccordionSummary>
            <Divider />
            <Grid container spacing={1} alignItems="center" sx={{ marginTop: 1, marginBottom: 1}}>
              {Array.isArray(prompts) &&
                prompts.map((prompt, index) => (
                  <SortableItem key={prompt.id} id={prompt.id} prompt={prompt} updatePrompt={updatePrompt} updateSlider={updateSlider} index={index} />
                ))}
            </Grid>
            <Stack spacing={2} direction="column">
              <Stack spacing={1} direction="row" justifyContent="center">
                <Button sx={{ color: (theme) => theme.palette.primary.contrastText }} variant="contained" onClick={addGlobal}>Global</Button>
                <Button sx={{ color: (theme) => theme.palette.primary.contrastText }} variant="contained" onClick={addTransition}>Transition</Button>
              </Stack>
              <Divider />
            </Stack>
          </Accordion>
        </SortableContext>
        <DragOverlay>
          {activeId ? <Item id={activeId} prompt={prompts.find(prompt => prompt.id === activeId)} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
