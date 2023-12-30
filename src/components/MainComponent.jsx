// MainComponent.jsx
import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import Toolbar from '@mui/material/Toolbar';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import { useDevSetup } from './Dev';

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
  setShouldGenerate
}) => {

  const [currentIndex, setCurrentIndex] = useState(0);
  const [cards, setCards] = useState([]);
  const onFinishFunctions = useRef([]);
  const cardRefs = useRef([]);
  const [envReady, setEnvReady] = useState(false);
  const [capturedInputData, setCapturedInputData] = useState({ mainPromptData, antiPromptData });

  const formatPrompt = (promptData, index, count) => {
    return promptData.map(prompt => {
      if (prompt.type === 'transition') {
        const rValue = interpolateRValue(prompt.before.value, prompt.after.value, index, count);
        return `\\\\[${prompt.after.tag}:${prompt.before.tag}:${rValue}\\\\]`;
      }
      return prompt.tag;
    }).join(', ');
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

  const generateImageParameters = (index) => {
    const mainPrompt = formatPrompt(capturedInputData.mainPromptData, index, count);
    const antiPrompt = formatPrompt(capturedInputData.antiPromptData, index, count);
  

    return {
      prompt: mainPrompt,
      negativePrompt: antiPrompt,
      resolution,
      seed,
      guidanceScale
    };
  };

  const generateImage = (index) => {
    const imageParams = generateImageParameters(index);
    window.onFinish = onFinishFunctions.current[index];

    window.final.resolution = imageParams.resolution;
    window.final.seed = imageParams.seed;
    window.final.guidanceScale = imageParams.guidanceScale;
    window.setPrompt(imageParams.prompt);
    window.setNegativePrompt(imageParams.negativePrompt);

    return { __html: window.imageGen(window.final) };
  };

  const showInputData = (index) => {
    const mainPrompt = formatPrompt(mainPromptData, index, count);
    const antiPrompt = formatPrompt(antiPromptData, index, count);
  
    return {
      prompt: mainPrompt,
      negativePrompt: antiPrompt,
      resolution,
      seed,
      guidanceScale
    };
  };
  

  // Generate onFinish functions for each image
  for (let i = 0; i < count; i++) {
    onFinishFunctions.current[i] = (result) => {
      let iframe = result.iframe;
      let canvas = result.canvas;
      let dataUrl = canvas.toDataURL("image/png");
      let iframeWidth = iframe.style.width || '100%';
      let showOutputData = decodeURIComponent(iframe.getAttribute('data-src'));
      setCards(prevCards => {
        const newCards = prevCards.map((card, index) => 
          index === i ? { loaded: true, imageUrl: dataUrl, iframeWidth: iframeWidth, showOutputData } : card
        );
        return newCards;
      });

      if (currentIndex < count - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // Once all images are generated, reset shouldGenerate
        setShouldGenerate(false);
      }
    };
  }

  function formatOutputJSON(url) {
    try {
      const urlObj = new URL(url);
      const jsonPart = urlObj.hash.substring(1); // Remove the leading '#'
      const decodedJSON = decodeURIComponent(jsonPart);
      return JSON.stringify(JSON.parse(decodedJSON), null, 2);
    } catch (error) {
      return 'Invalid JSON';
    }
  }

  useDevSetup(setEnvReady);

  useEffect(() => {
    if (shouldGenerate) {
      setCapturedInputData({ mainPromptData, antiPromptData });
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
        {cards.map((card, index) => (
          <Card key={index} ref={cardRefs.current[index]}>
            {card.loaded ? (
              <>
                <CardMedia
                  component="img"
                  sx={{ width: card.iframeWidth }}
                  image={card.imageUrl}
                />
                {debugMode && (
                  <>
                    <p>Card # {index}</p>
                    <pre>Input: {JSON.stringify(showInputData(index), null, 2).replace(/\\\\/g, '')}</pre>
                    <pre>Output: {formatOutputJSON(card.showOutputData)}</pre>
                  </>
                )}
              </>
            ) : (
              <Skeleton variant="rectangular" width={card.iframeWidth} height={300} />
            )}
          </Card>
        ))}
        {currentIndex < count && envReady && (
          <Card key={currentIndex} ref={cardRefs.current[currentIndex]}>
            <Skeleton variant="rectangular">
              <CardMedia dangerouslySetInnerHTML={generateImage(currentIndex)} />
            </Skeleton>
          </Card>
        )}
      </Stack>
    </Box>
  );
};

export default MainComponent;