// Settings.jsx
import React from 'react';
import Card from '@mui/material/Card';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import NativeSelect from '@mui/material/NativeSelect';
import Stack from '@mui/material/Stack';

const Settings = ({ 
  onSettingsChange, 
  initialSettings 
}) => {

  const handleChange = (name, value) => {
    onSettingsChange({ ...initialSettings, [name]: value });
  };

  return (
    <div>
      <Card>
        <Box
          component="form"
          sx={{ '& > :not(style)': { m: 1, width: '25ch' } }}
          noValidate
          autoComplete="off"
        >
          <Stack spacing={2} direction="column" sx={{ mb: 1 }} >
          <FormControl fullWidth>
            <InputLabel variant="standard" htmlFor="resolution-native">Resolution</InputLabel>
            <NativeSelect
              value={initialSettings.resolution}
              onChange={e => handleChange('resolution', e.target.value)}
              inputProps={{ name: 'resolution', id: 'resolution-native' }}
            >
              <option value="768x512">768x512 (Landscape)</option>
              <option value="512x512">512x512 (Square)</option>
              <option value="512x768">512x768 (Portrait)</option>
            </NativeSelect>
          </FormControl>
          <TextField 
            id="count" 
            label="Count" 
            value={initialSettings.count} 
            onChange={e => handleChange('count', parseInt(e.target.value, 10) || 0)} 
            variant="filled" 
          />
          <TextField 
            id="seed" 
            label="Seed" 
            value={initialSettings.seed} 
            onChange={e => handleChange('seed', parseInt(e.target.value, 10) || 0)} 
            variant="filled" 
          />
          <TextField 
            id="guidance" 
            label="Guidance" 
            value={initialSettings.guidance} 
            onChange={e => handleChange('guidance', parseFloat(e.target.value) || 0)} 
            variant="filled" 
          />
          </Stack>
        </Box>
      </Card>
    </div>
  );
};

export default Settings;
