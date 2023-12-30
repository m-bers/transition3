import React, { forwardRef } from 'react';
import {
  Grid,
  IconButton,
  TextField,
  Slider,
  Stack
} from '@mui/material';
import PublicIcon from '@mui/icons-material/Public';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import DragIndicator from '@mui/icons-material/DragIndicator';

export const Item = forwardRef(({ prompt, updatePrompt, updateSlider, index, attributes, listeners, ...props }, ref) => {
  return (
    <Grid container spacing={1} alignItems="center" {...props} ref={ref}>
      {prompt.type === 'global' && (
        <>

          <Grid item xs={1.5} >

            <DragIndicator sx={{marginLeft: 1, touchAction: 'manipulation'}}{...listeners} />

          </Grid>
          <Grid item xs={8.5}>
            <TextField
              fullWidth
              label="Global"
              placeholder="e.g. woman portrait"
              multiline
              variant="filled"
              value={prompt.tag}
              onChange={(e) => updatePrompt(index, 'tag', e.target.value)}
            />
          </Grid>
          <Grid item xs={1.65}>
            <PublicIcon sx={{ marginLeft: 0.3 }} />
          </Grid>
        </>
      )}
      {prompt.type === 'transition' && (
        <>
          <Grid item xs={1.5}>
            <DragIndicator sx={{marginLeft: 1, touchAction: 'manipulation'}} {...listeners} />
          </Grid>
          <Grid item xs={8.5}>
            <TextField
              fullWidth
              label="Before"
              placeholder="e.g. goth aesthetic"
              multiline
              variant="filled"
              value={prompt.before.tag}
              onChange={(e) => updatePrompt(index, 'before', e.target.value)}
            />
            <TextField
              fullWidth
              label="After"
              placeholder="e.g. hippie aesthetic"
              multiline
              variant="filled"
              value={prompt.after.tag}
              onChange={(e) => updatePrompt(index, 'after', e.target.value)}
            />
          </Grid>
          <Grid item xs={1.65}>
            <Stack spacing={2} direction="column" sx={{ mb: 1, marginTop: 1}} alignItems="center">
              <HourglassTopIcon />
              <Slider
                sx={{ height: 30 }}
                getAriaLabel={() => 'Temperature'}
                orientation="vertical"
                value={[100 - Number(prompt.after.value), 100 - Number(prompt.before.value)]}
                onChange={(e, newValue) => updateSlider(index, newValue)}
                valueLabelDisplay="off"
                min={0}
                max={100}
              />
              <HourglassBottomIcon />
            </Stack>
          </Grid>
        </>
      )}
    </Grid>
  );
});
