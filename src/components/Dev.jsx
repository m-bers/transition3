import * as React from 'react';

export const useDevSetup = (setEnvReady) => {
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log("Running in development");

      // Mock window.final object
      window.final = {};

      // Mock window.setPrompt function
      window.setPrompt = (prompt) => {
        window.final.prompt = prompt.replace(/\\\\/g, '');
      };

      // Mock window.setNegativePrompt function
      window.setNegativePrompt = (negativePrompt) => {
        window.final.negativePrompt = negativePrompt.replace(/\\\\/g, '');
      };

      // Mock window.imageGen function for development
      window.imageGen = (final) => {
        // The final object should already be updated via setPrompt and setNegativePrompt
        // Assign other properties from final
        window.final.resolution = final.resolution;
        window.final.seed = final.seed;
        window.final.guidanceScale = final.guidanceScale;

        // Create an iframe element
        const iframe = document.createElement('iframe');
        iframe.style.width = `${parseInt(final.resolution.split('x')[0], 10) * (75 / 128)}px`;
        iframe.style.height = `${parseInt(final.resolution.split('x')[1], 10) * (75 / 128)}px`;

        // Create a canvas element
        const canvas = document.createElement('canvas');
        canvas.width = parseInt(final.resolution.split('x')[0], 10) * (75 / 128);
        canvas.height = parseInt(final.resolution.split('x')[1], 10) * (75 / 128);
        const context = canvas.getContext('2d');

        context.fillStyle = "#444"; 

        context.fillRect(0, 0, canvas.width, canvas.height); // Fill the entire canvas with black


        // Create a mock URL for development with proper encoding
        const mockUrl = `https://dev-mock-url.com/#${encodeURIComponent(JSON.stringify(window.final))}`;
        iframe.setAttribute('data-src', mockUrl);

        // Simulate onFinish call with a delay to mimic async behavior
        setTimeout(() => {
          window.onFinish({ iframe, canvas });
        }, 1);
        return {iframe, canvas};
        // return `<iframe src="${iframe.src}" width="${iframe.style.width}" height="${iframe.style.height}" data-src="${mockUrl}"/>`;
      };
    } else {
      // Define a placeholder for production environment function
      window.p();
    }

    // Indicate that the environment is ready
    setEnvReady(true);
  }, [setEnvReady]);
}
