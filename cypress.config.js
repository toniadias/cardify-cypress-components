import { defineConfig } from 'cypress';

export default defineConfig({
  video: true,
  videosFolder: 'cypress/videos',
  screenshotOnRunFailure: true,
  component: {
    devServer: {
      framework: 'react',
      bundler: 'vite',
    },
    video: true, // força vídeo também para CT
  },
});
