// App.jsx
import React, { useState, useCallback, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from './components/AppBar';  // Ensure this is the correct path
import Drawer from './components/Drawer';
import MainComponent from './components/MainComponent.jsx';
import Settings from './components/Settings';
import Prompt from './components/Prompt';
import Stack from '@mui/material/Stack';
import SaveIcon from '@mui/icons-material/Save';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import PermMediaIcon from '@mui/icons-material/PermMedia';
import PublicIcon from '@mui/icons-material/Public';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import NativeSelect from '@mui/material/NativeSelect';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import LooksOneIcon from '@mui/icons-material/LooksOne';
import { Divider } from '@mui/material';
import CompareIcon from '@mui/icons-material/Compare';

const drawerWidth = 265;

export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mainPromptData, setMainPromptData] = useState([]);
  const [antiPromptData, setAntiPromptData] = useState([]);
  const [settingsData, setSettingsData] = useState({ resolution: '512x768', count: 21, seed: 104, guidance: 7 });
  const [shouldGenerate, setShouldGenerate] = useState(false); // New state for triggering generation
  const [hasStarted, setHasStarted] = useState(false);
  const [startSelectedIndex, setStartSelectedIndex] = useState(null);
  const [endSelectedIndex, setEndSelectedIndex] = useState(null);
  const [localMainPromptData, setLocalMainPromptData] = useState(mainPromptData);
  const [localAntiPromptData, setLocalAntiPromptData] = useState(antiPromptData);
  const [randomSeeds, setRandomSeeds] = useState([]);
  const [isRandomGeneration, setIsRandomGeneration] = useState(false);
  const [allCanvasPresent, setAllCanvasPresent] = useState(false);
  const [renderTrigger, setRenderTrigger] = useState(0);
  const [debugMode, setDebugMode] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleChange = (name, value) => {
    handleSettingsChange({ ...settingsData, [name]: value });
  };

  const handleSave = () => {
    const data = {
      resolution: settingsData.resolution,
      count: settingsData.count,
      seed: settingsData.seed,
      guidance: settingsData.guidance,
      main: mainPromptData,
      anti: antiPromptData
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'output.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleLoad = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          setMainPromptData(data.main || []);
          setAntiPromptData(data.anti || []);
          setSettingsData({
            resolution: data.resolution || '512x768',
            count: data.count || 21,
            seed: data.seed || 104,
            guidance: data.guidance || 7
          });
          console.log("Updated state:", data);
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      };
      reader.readAsText(file);
    }
  };

  // Callback functions for updating main and anti prompts
  const handleMainPromptDataChange = useCallback((data) => {
    console.log('Updating mainPromptData:', JSON.stringify(data)); // Add this line
    setMainPromptData(data);
  }, []);


  const handleAntiPromptDataChange = useCallback((data) => {
    setAntiPromptData(data);
  }, []);

  // Callback function for updating settings
  const handleSettingsChange = useCallback((data) => {
    setSettingsData(data);
  }, []);

  const handleTransition = () => {
    setIsRandomGeneration(false);
    setRenderTrigger(rt => rt + 1); // Increment the trigger
    handleGenerate();
  };

  const handleRandomize = () => {
    const newRandomSeeds = Array.from({ length: settingsData.count }, () => Math.floor(Math.random() * 10000000));
    setRandomSeeds(newRandomSeeds);
    setIsRandomGeneration(true);
    setRenderTrigger(rt => rt + 1); // Increment the trigger
    handleGenerate();
  };

  const handleGenerate = () => {
    // setMainPromptData(localMainPromptData);
    // setAntiPromptData(localAntiPromptData);
    setShouldGenerate(true); // Always set to true to trigger generation
    // setHasStarted(true);
    // setStartSelectedIndex(null);
    // setEndSelectedIndex(null);
    // setAllCanvasPresent(false); // Reset the canvas check
  }

  const handleDownload = async () => {
    const zip = require('jszip')();
    // Assuming you have JSZip library for creating a zip file

    for (let i = 0; i < settingsData.count; i++) {
      const canvas = document.querySelector(`#image-${i} canvas`);
      if (canvas) {
        const imageData = canvas.toDataURL("image/png");
        // Add image data to zip. Split dataUrl to get base64 part
        zip.file(`image-${i}.png`, imageData.split(',')[1], { base64: true });
      }
    }

    // Generate zip and trigger download
    zip.generateAsync({ type: "blob" })
      .then(function (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = "images.zip";
        link.click();
        URL.revokeObjectURL(url);
      });
  };


  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        drawerWidth={drawerWidth}
        handleDrawerToggle={handleDrawerToggle}
        handleSave={handleSave}
        handleLoad={handleLoad}
        handleDownload={handleDownload}
        handleTransition={handleTransition}
        handleRandomize={handleRandomize}
        setDebugMode={setDebugMode}
        allCanvasPresent={allCanvasPresent}
        setAllCanvasPresent={setAllCanvasPresent}

      />
      <Drawer drawerWidth={drawerWidth} mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle}>
        <Prompt
          promptType="main"
          onPromptDataChange={handleMainPromptDataChange}
          initialPrompts={mainPromptData}
          count={settingsData.count}
          setMainPromptData={setMainPromptData}
          mainPromptData={mainPromptData} // Pass mainPromptData as a prop
        />

        <Prompt
          promptType="anti"
          onPromptDataChange={handleAntiPromptDataChange}
          initialPrompts={antiPromptData}
          count={settingsData.count}
          setAntiPromptData={setAntiPromptData} // Pass the function as a prop
          antiPromptData={antiPromptData} // Pass mainPromptData as a prop
        />
        <Settings onSettingsChange={handleSettingsChange} initialSettings={settingsData} />



      </Drawer>
      <MainComponent
        drawerWidth={drawerWidth}
        count={settingsData.count}
        mainPromptData={mainPromptData}
        antiPromptData={antiPromptData}
        localMainPromptData={localMainPromptData}
        localAntiPromptData={localAntiPromptData}
        setLocalMainPromptData={setLocalMainPromptData}
        setLocalAntiPromptData={setLocalAntiPromptData}
        seed={settingsData.seed}
        guidanceScale={settingsData.guidance}
        resolution={settingsData.resolution}
        shouldGenerate={shouldGenerate}
        setShouldGenerate={setShouldGenerate}
        hasStarted={hasStarted}
        startSelectedIndex={startSelectedIndex}
        setStartSelectedIndex={setStartSelectedIndex}
        endSelectedIndex={endSelectedIndex}
        setEndSelectedIndex={setEndSelectedIndex}
        isRandomGeneration={isRandomGeneration}
        randomSeeds={randomSeeds}
        allCanvasPresent={allCanvasPresent}
        setAllCanvasPresent={setAllCanvasPresent}
        setSettingsData={setSettingsData}
        renderTrigger={renderTrigger}
        // New props
        debugMode={debugMode}
      >
        <Alert sx={{ color: (theme) => theme.palette.text.primary }} variant="outlined" icon={" "} color="primary">
          <Stack spacing={2} direction="column" alignItems="center" sx={{ mb: 1, maxWidth: 480 }} >
            <Typography variant="h6" noWrap component="div" color="primary">
              <CompareIcon sx={{ marginTop: -5, marginBottom: -0.7 }} /> Transition Generator
            </Typography>
            <Typography>
              This perchance generator can be used to make relatively seamless transitions between a <b>before</b> image
              and an <b>after</b> image, by building a prompt which you can construct using <b>tags</b>.
            </Typography>
            <Typography>
              There are two types of tags: <b>global</b>, and <b>transition</b>. Global tags are applied to ALL images in the sequence equally. Transition tags have a
              <HourglassTopIcon sx={{ marginTop: -5, marginBottom: -0.7 }} /> <b>before</b> and an
              <HourglassBottomIcon sx={{ marginTop: -5, marginBottom: -0.7 }} /> <b>after</b> component,
              each of which contain a <b>value</b> that you can control via the slider to the left.
              The top value in the slider is where the transition starts
              (e.g. 0% of the way through, 10% of the way through, etc.)
              and the bottom of the slider is where the transition ends.
            </Typography>
          </Stack>
        </Alert>
        <Alert sx={{ color: (theme) => theme.palette.text.primary }} variant="outlined" icon={"1)"} color="primary">
          <Stack spacing={2} direction="column" sx={{ mb: 1, maxWidth: 265 }} >
            <Typography>
              First, choose a <b>resolution</b> for the images in the sequence you want to generate. There are three available resolutions.
            </Typography>
            <FormControl fullWidth>
              <InputLabel variant="standard" htmlFor="resolution-native">Resolution</InputLabel>
              <NativeSelect
                value={settingsData.resolution}
                onChange={e => handleChange('resolution', e.target.value)}
                inputProps={{ name: 'resolution', id: 'resolution-native' }}
              >
                <option value="768x512">768x512 (Landscape)</option>
                <option value="512x512">512x512 (Square)</option>
                <option value="512x768">512x768 (Portrait)</option>
              </NativeSelect>
            </FormControl>
          </Stack>
        </Alert>
        <Alert sx={{ color: (theme) => theme.palette.text.primary }} variant="outlined" icon={"2)"} color="primary">
          <Stack spacing={2} direction="column" sx={{ mb: 1, maxWidth: 265 }} >
            <Typography>
              Then, set the <b>count</b>, i.e. the number of images you want in your sequence.
            </Typography>
            <TextField
              id="count"
              label="Count"
              value={settingsData.count}
              onChange={e => handleChange('count', parseInt(e.target.value, 10) || 0)}
              variant="filled"
            />
          </Stack>
        </Alert>
        <Alert sx={{ color: (theme) => theme.palette.text.primary }} variant="outlined" icon={"3)"} color="primary">
          <Stack spacing={2} direction="column" sx={{ mb: 1, maxWidth: 265 }} >
            <Typography>
              Optionally set the seed if you know you want a specific set of images.
            </Typography>
            <TextField
              id="seed"
              label="Seed"
              value={settingsData.seed}
              onChange={e => handleChange('seed', parseInt(e.target.value, 10) || 0)}
              variant="filled"
            />
            {/* INSERT SEED COMPONENT HERE */}
          </Stack>
        </Alert>
        <Alert sx={{ color: (theme) => theme.palette.text.primary }} variant="outlined" icon={"4)"} color="primary">
          <Stack spacing={2} direction="column" sx={{ mb: 1, maxWidth: 265 }} >
            <Typography>
              Optionally set the guidance. Higher value means more prompt fidelity but lower image quality. Try not to mess with this unless you need to (default is 7).
            </Typography>
            <TextField
              id="guidance"
              label="Guidance"
              value={settingsData.guidance}
              onChange={e => handleChange('guidance', parseFloat(e.target.value) || 0)}
              variant="filled"
            />
          </Stack>
        </Alert>
        <Alert sx={{ color: (theme) => theme.palette.text.primary }} variant="outlined" icon={"5)"} color="primary">
          <Stack spacing={2} direction="column" sx={{ mb: 1, maxWidth: 265 }} >
            <Typography>
              Next, add some tags to describe the image. Think of the tags as a priority list: highest priority items at the top, lowest priority at the bottom.
            </Typography>
            <Typography>
              Stable Diffusion will try to generate images that match all your parameters, but isn't perfect and will start to lose track as the list gets longer.
            </Typography>
            <Prompt
              promptType="main"
              onPromptDataChange={handleMainPromptDataChange}
              initialPrompts={mainPromptData}
              count={settingsData.count}
              setMainPromptData={setMainPromptData}
              mainPromptData={mainPromptData} // Pass mainPromptData as a prop
            />
          </Stack>
        </Alert>
        <Alert sx={{ color: (theme) => theme.palette.text.primary }} variant="outlined" icon={"6)"} color="primary">

          <Stack spacing={2} direction="column" sx={{ mb: 1, maxWidth: 265 }} >
            <Typography>
              You can also <b>remove</b> tags from the image, i.e. describe things you do NOT want the text-to-image-plugin to generate.
            </Typography>
            <Prompt
              promptType="anti"
              onPromptDataChange={handleAntiPromptDataChange}
              initialPrompts={antiPromptData}
              count={settingsData.count}
              setAntiPromptData={setAntiPromptData} // Pass the function as a prop
              antiPromptData={antiPromptData} // Pass mainPromptData as a prop
            />
          </Stack>
        </Alert>
        <Alert sx={{ color: (theme) => theme.palette.text.primary }} variant="outlined" icon={"7)"} color="primary">
          <Stack spacing={2} direction="column" sx={{ mb: 1, maxWidth: 265 }} >

            <Typography>
              Once you have your tags and prompt settings configured, click
              the <RestartAltIcon sx={{ marginTop: -5, marginBottom: -0.7 }} /> <b>generate</b> button
              in the toolbar to generate a sequence.
              Once the sequence is queued, you will need to scroll to the end to get all the images to generate.
            </Typography>
          </Stack>
        </Alert>
        <Alert sx={{ color: (theme) => theme.palette.text.primary }} variant="outlined" icon={"8)"} color="primary">
          <Stack spacing={2} direction="column" sx={{ mb: 1, maxWidth: 265 }} >
            <Typography>
              Below each image generated, there are two buttons that control the zoom level.
              The <HourglassTopIcon sx={{ marginTop: -5, marginBottom: -0.7 }} /> <b>start</b> button
              will set the first image in the new sequence and the
              <HourglassBottomIcon sx={{ marginTop: -5, marginBottom: -0.7 }} /> <b>end</b> button will set the last image in the new sequence.
              Once you have both your starting and ending image selected, click the <RestartAltIcon sx={{ marginTop: -5, marginBottom: -0.7 }} /> <b>generate</b> button
              and a new sequence will be generated that is zoomed in on that particular section of the transition.
            </Typography>
          </Stack>
        </Alert>
        <Alert sx={{ color: (theme) => theme.palette.text.primary }} variant="outlined" icon={"9)"} color="primary">
          <Stack spacing={2} direction="column" sx={{ mb: 1, maxWidth: 265 }} >
            <Typography>
              You can also use the <ShuffleIcon sx={{ marginTop: -5, marginBottom: -0.7 }} /> <b>randomize</b> button
              in the toolbar for seed hunting--either for your before image or your after image.
            </Typography>
            <Typography>
              If you want to find a good seed for your ending image, adjust the sliders on each of your
              transitions to the bottom (or just click
              the <HourglassTopIcon sx={{ marginTop: -5, marginBottom: -0.7 }} /> <b>start</b> button
              on the final image in a sequence) and click <RestartAltIcon sx={{ marginTop: -5, marginBottom: -0.7 }} /> <b>generate</b>.
            </Typography>
            <Typography>
              To find a seed for a starting image, adjust the sliders to the top or click
              the <HourglassBottomIcon sx={{ marginTop: -5, marginBottom: -0.7 }} /> <b>end</b> button, and then
              click <RestartAltIcon sx={{ marginTop: -5, marginBottom: -0.7 }} /> <b>generate</b>.
            </Typography>
          </Stack>
        </Alert>
        <Alert sx={{ color: (theme) => theme.palette.text.primary }} variant="outlined" icon={"10)"} color="primary">
          <Stack spacing={2} direction="column" sx={{ mb: 1, maxWidth: 265 }} >
            <Typography>
              Finally, you can save your entire configuration of tags and settings to use later
              by clicking the <SaveIcon sx={{ marginTop: -5, marginBottom: -0.7 }} /> <b>save</b> button
              in the toolbar.
            </Typography>
            <Typography>
              Naturally, you can also load a previously saved configuration by clicking
              the <UploadFileIcon sx={{ marginTop: -5, marginBottom: -0.7 }} /> <b>load</b> button right next to it.
            </Typography>
            <Typography>You can download a zip file containing all images from the last generation by clicking the <PermMediaIcon sx={{ marginTop: -5, marginBottom: -0.7 }} /> <b>media</b> button. </Typography>
          </Stack>
        </Alert>
      </MainComponent>

    </Box>
  );
}
