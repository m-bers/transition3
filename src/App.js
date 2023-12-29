import * as React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';

export default function App() {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [cards, setCards] = React.useState([]);
  const onFinishFunctions = React.useRef([]);
  const cardRefs = React.useRef([]); // Refs for each card

  // Update refs array to match the number of cards
  if (cardRefs.current.length !== 11) {
    cardRefs.current = Array(11).fill().map((_, i) => cardRefs.current[i] || React.createRef());
  }

  // Generate onFinish functions for each image
  for (let i = 0; i <= 10; i++) {
    onFinishFunctions.current[i] = (result) => {
      let iframe = result.iframe;
      let canvas = result.canvas;
      let dataUrl = canvas.toDataURL("image/png");
      let iframeWidth = iframe.style.width || '100%';

      setCards(prevCards => {
        const newCards = [...prevCards];
        newCards[i] = { loaded: true, imageUrl: dataUrl, iframeWidth: iframeWidth };
        return newCards;
      });

      if (currentIndex < 10) {
        setCurrentIndex(currentIndex + 1);
      }
    };
  }

  // Generate image parameters
  const imageParametersArray = [];
  for (let r = 0.0, i = 0; r <= 1.0; r += 0.1, i++) {
    const imageParameters = {
      prompt: `Woman Portrait, \\\\[hippie:goth:${r}\\\\] aesthetic`,
      negativePrompt: "Goodbye",
      resolution: "512x768",
      seed: 104,
      guidanceScale: 7
    };
    imageParametersArray.push(imageParameters);
  }

  // Image generation function
  const imageGen = (imageParams, index) => {
    window.onFinish = onFinishFunctions.current[index];
    window.final.resolution = imageParams.resolution;
    window.final.seed = imageParams.seed;
    window.final.guidanceScale = imageParams.guidanceScale;
    window.setPrompt(imageParams.prompt);
    window.setNegativePrompt(imageParams.negativePrompt);
    return { __html: window.imageGen(window.final) };
  };

  // Scroll to the card when it's updated or added
  React.useEffect(() => {
    if (cardRefs.current[currentIndex] && cardRefs.current[currentIndex].current) {
      cardRefs.current[currentIndex].current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [currentIndex, cards]);

  return (
    <Stack spacing={{ xs: 1, sm: 2 }} direction="row" useFlexGap justifyContent="center" flexWrap="wrap">
      {/* Render cards */}
      {cards.map((card, index) => (
        <Card key={index} ref={cardRefs.current[index]}>
          {card.loaded ? (
            <CardMedia
              component="img"
              sx={{ width: card.iframeWidth }}
              image={card.imageUrl}
              title="Generated Image"
            />
          ) : (
            index === currentIndex && (
              <Skeleton variant="rectangular">
                <CardMedia dangerouslySetInnerHTML={imageGen(imageParametersArray[index], index)} />
              </Skeleton>
            )
          )}
          <CardActions>
            <Button size="small">Share</Button>
            <Button size="small">Learn More</Button>
          </CardActions>
        </Card>
      ))}
      {/* Render the current card if not in cards array */}
      {currentIndex >= cards.length && (
        <Card key={currentIndex} ref={cardRefs.current[currentIndex]}>
          <Skeleton variant="rectangular">
            <CardMedia dangerouslySetInnerHTML={imageGen(imageParametersArray[currentIndex], currentIndex)} />
          </Skeleton>
          <CardActions>
            <Button size="small">Share</Button>
            <Button size="small">Learn More</Button>
          </CardActions>
        </Card>
      )}
    </Stack>
  );
}
