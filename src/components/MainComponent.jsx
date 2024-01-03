// MainComponent.jsx
import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { styled, Typography } from '@mui/material';
import CardMedia from '@mui/material/CardMedia';
import Toolbar from '@mui/material/Toolbar';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import { useDevSetup } from './Dev';
import { ZoomIn, HourglassTop, HourglassBottom, Compare } from '@mui/icons-material';
import ButtonBase from '@mui/material/ButtonBase';


import Slider from '@mui/material/Slider'; // Import Slider from Material-UI


const MainComponent = ({
  drawerWidth,
  seed,
  guidanceScale,
  resolution,
  mainPromptData,
  antiPromptData,
  count,
  debugMode,
  shouldGenerate,
  setShouldGenerate,
  uploadedImage,
  imageSizeValue,
  settingsData,
  setSettingsData,
  isRandomGeneration,
  handleTransition
}) => {

  const [currentIndex, setCurrentIndex] = useState(0);
  const [cards, setCards] = useState([]);
  const onFinish = useRef([]);
  const cardRefs = useRef([]);

  const [finalData, setFinalData] = useState({
    mainPromptData,
    antiPromptData,
    seed: settingsData.seed,
    resolution: settingsData.resolution,
    guidanceScale: settingsData.guidanceScale
  });

  const ImageBackdrop = styled('span')(({ theme }) => ({
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: theme.palette.common.black,
    opacity: 0,
    transition: theme.transitions.create('opacity'),
  }));

  const ImageText = styled(Typography)(({ theme }) => ({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: theme.palette.common.white,
    display: 'none',
  }));

  const ImageButton = styled(ButtonBase)(({ theme }) => ({
    '&:hover': {
      '& .MuiImageBackdrop-root': {
        opacity: 0.4, // Dim the image on hover
      },
      '& .MuiImageText-root': {
        display: 'block', // Show text on hover
      },
    },
  }));

  const formatPrompt = (promptData, index, count) => {
    return promptData.map(prompt => {
      if (prompt.type === 'transition') {
        const rValue = interpolateRValue(prompt.before.value, prompt.after.value, index, count);
        return `\\\\[${prompt.after.tag}:${prompt.before.tag}:${rValue}\\\\]`;
      }
      return prompt.tag;
    }).join(', ');
  };

  const cardDimensions = () => {
    const [resWidth, resHeight] = finalData.resolution.split('x').map(Number);
    const aspectRatio = resHeight / resWidth;
    const width = parseInt(finalData.resolution.split('x')[0], 10) * imageSizeValue;
    const height = width * aspectRatio;
    return { width, height };
  };

  const interpolateRValue = (initialValue, finalValue, index, total) => {
    const initVal = (parseFloat(initialValue)) / 100;
    const finalVal = (parseFloat(finalValue)) / 100;
    if (isNaN(initVal) || isNaN(finalVal)) {
      console.error('Initial or final value is not a number', { initialValue, finalValue });
      return 0;
    }
    const reversedIndex = (total - 1) - index;
    const result = initVal + (finalVal - initVal) * reversedIndex / (total - 1);

    if (Number.isInteger(result)) {
      return result.toFixed(2); // Converts integer to a string with two decimal places
    }
    return result; // Returns the original number with its inherent precision
  };

  const showInput = (index, isFinal = false) => {
    const data = isFinal ? finalData : {
      mainPromptData,
      antiPromptData,
      seed: settingsData.seed,
      resolution: settingsData.resolution,
      guidanceScale: settingsData.guidanceScale
    };

    return {
      prompt: formatPrompt(data.mainPromptData, index, count),
      negativePrompt: formatPrompt(data.antiPromptData, index, count),
      resolution: data.resolution,
      seed: data.seed,
      guidanceScale: data.guidanceScale
    };
  };

  function showOutput(url) {
    try {
      const urlObj = new URL(url);
      const jsonPart = urlObj.hash.substring(1); // Remove the leading '#'
      const decodedJSON = decodeURIComponent(jsonPart);
      return JSON.parse(decodedJSON);
    } catch (error) {
      return 'Invalid JSON';
    }
  }

  const getRandomSeed = () => Math.floor(Math.random() * 1000000) + 1;

  const generateImage = (index) => {
    let imageParams = showInput(index, true);
    if (isRandomGeneration) {
      const randomSeed = cards[index].randomSeed;
      imageParams = { ...imageParams, seed: randomSeed };
    }
    window.final.onFinish = onFinish.current[index];
    window.final.resolution = imageParams.resolution;
    window.final.seed = imageParams.seed;
    window.final.guidanceScale = imageParams.guidanceScale;
    window.setPrompt(imageParams.prompt);
    window.setNegativePrompt(imageParams.negativePrompt);

    if (uploadedImage) {
      window.final.referenceImage = {
        url: uploadedImage,
        blur: 0 // or any other value you need
      };
    }
    return { __html: window.imageGen(window.final) };
  };

  // Generate onFinish functions for each image
  for (let i = 0; i < count; i++) {
    onFinish.current[i] = (result) => {
      let iframe = result.iframe;
      let canvas = result.canvas;
      let dataUrl = canvas.toDataURL("image/png");
      let iframeWidth = iframe.style.width || '100%';
      let output = decodeURIComponent(iframe.getAttribute('data-src'));
      setCards(prevCards => {
        const newCards = prevCards.map((card, index) =>
          index === i ? { loaded: true, imageUrl: dataUrl, iframeWidth: iframeWidth, output } : card
        );
        return newCards;
      });

      if (currentIndex < count - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setShouldGenerate(false);
      }
    };
  }

  const onImageButtonClick = (outputData) => {
    console.log("card.seed = ", outputData.seed)
    if (isRandomGeneration && outputData.seed) {
      setSettingsData({ ...settingsData, seed: outputData.seed });
      handleTransition();
    }
  };


  useDevSetup();

  useEffect(() => {
    if (isRandomGeneration) {
      const randomSeed = getRandomSeed();
      setCards(prevCards => prevCards.map((card, idx) => idx === currentIndex ? { ...card, randomSeed } : card));
    }
  }, [isRandomGeneration, currentIndex]);

  useEffect(() => {
    if (shouldGenerate) {
      setFinalData({
        mainPromptData,
        antiPromptData,
        seed,
        resolution,
        guidanceScale
      });
      setCards(Array(count).fill({ loaded: false }));
      setCurrentIndex(0);
      setShouldGenerate(false);
    }
  }, [shouldGenerate, setShouldGenerate, count, mainPromptData, antiPromptData]);


  useEffect(() => {
    if (cardRefs.current.length !== count) {
      cardRefs.current = Array(count).fill().map((_, i) => cardRefs.current[i] || React.createRef());
    }
  }, [count]);

  useEffect(() => {
    if (cardRefs.current[currentIndex] && cardRefs.current[currentIndex].current) {
      cardRefs.current[currentIndex].current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [currentIndex]);

  return (
    <Box
      component="main"
      sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}
    >
      <Toolbar />
      <Stack spacing={{ xs: 1, sm: 2 }} direction="row" useFlexGap justifyContent="center" flexWrap="wrap">
        {cards.map((card, index) => {
          const { width, height } = cardDimensions();  // Get dynamic dimensions for each card
          return (
            <Card key={index} ref={cardRefs.current[index]} sx={{
              width
            }}>
              {card.loaded ? (
                <>
                  {debugMode ? (
                    <CardMedia
                      sx={{
                        height,
                        width: '100%',
                        overflow: 'auto'
                      }}
                      image={card.imageUrl}
                    >
                      <p>Card # {index}</p>
                      <pre style={{ textAlign: "left" }}>Input: {JSON.stringify(showInput(index), null, 2).replace(/\\\\/g, '')}</pre>
                      <pre style={{ textAlign: "left" }}>Output: {JSON.stringify(showOutput(card.output), null, 2)}</pre>
                      <p>Card iframe Width = {card.iframeWidth}</p>
                    </CardMedia>
                  ) : (
                    <ImageButton
                      onClick={() => onImageButtonClick(showOutput(card.output))}
                      focusRipple
                      key={index}
                      style={{
                        width: '100%', // Full width of the card
                        position: 'relative',
                        display: 'block', // To make sure it behaves like a block element
                      }}
                      sx={{
                        height, // Dynamic height
                        overflow: 'auto',
                      }}
                    >
                      <CardMedia
                        sx={{
                          height,
                          width: '100%',
                        }}
                        image={card.imageUrl}
                      />
                      <ImageBackdrop className="MuiImageBackdrop-root" />
                      <ImageText className="MuiImageText-root">
                        {isRandomGeneration ? (
                          <Compare sx={{ fontSize: 300 * imageSizeValue }} />
                        ) : (
                          <ZoomIn sx={{ fontSize: 300 * imageSizeValue }} />
                        )}
                      </ImageText>
                    </ImageButton>
                  )}
                </>
              ) : debugMode ? (
                <CardMedia dangerouslySetInnerHTML={generateImage(currentIndex)} />
              ) : (
                <Skeleton sx={{ height, maxWidth: "100%" }} variant="rectangular">
                  <CardMedia dangerouslySetInnerHTML={generateImage(currentIndex)} />
                </Skeleton>
              )
              }
            </Card>
          );
        })}
      </Stack>
    </Box >
  );
};

export default MainComponent;