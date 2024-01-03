import * as React from 'react';

export const useDevSetup = () => {
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log("Running in development");
      window.final = {};
      window.setPrompt = (prompt) => {
        window.final.prompt = prompt.replace(/\\\\/g, '');
      };
      window.setNegativePrompt = (negativePrompt) => {
        window.final.negativePrompt = negativePrompt.replace(/\\\\/g, '');
      };
      window.imageGen = (final) => {
        const iframe = document.createElement('iframe');
        const canvas = document.createElement('canvas');
        window.final.resolution = final.resolution;
        window.final.seed = final.seed;
        window.final.guidanceScale = final.guidanceScale;
        iframe.style.width = `${parseInt(final.resolution.split('x')[0], 10) * (75 / 128)}px`;
        iframe.style.height = `${parseInt(final.resolution.split('x')[1], 10) * (75 / 128)}px`;
        canvas.width = parseInt(final.resolution.split('x')[0], 10) * (75 / 128);
        canvas.height = parseInt(final.resolution.split('x')[1], 10) * (75 / 128);
        const context = canvas.getContext('2d');
        context.fillStyle = "#444";
        context.fillRect(0, 0, canvas.width, canvas.height); // Fill the entire canvas with black
        const mockUrl = `https://dev-mock-url.com/#${encodeURIComponent(JSON.stringify(window.final))}`;
        iframe.setAttribute('data-src', mockUrl);
        window.final.onFinish({ iframe, canvas });
        return { iframe, canvas };
      };
    } else {
      window.p();
    }
  }, []);
}
