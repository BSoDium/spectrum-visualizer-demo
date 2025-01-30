# Spectrum visualizer demo

A demo application for a custom spectrum sound visualization component.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/BSoDium/spectrum-visualizer-demo/main/assets/recording-dark-theme.gif">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/BSoDium/spectrum-visualizer-demo/main/assets/recording-light-theme.gif">
  <img alt="GIF recording of the spectrum visualizer in action">
</picture>

## Overview

This application provides real-time audio visualization from microphone input with customizable color schemes and a responsive design.

### Getting Started

1. **Prerequisites**: Ensure you have Node.js and npm or yarn installed.
2. **Installation**:
    ```sh
    git clone https://github.com/BSoDium/spectrum-visualizer-demo.git
    cd spectrum-visualizer-demo
    ```

    then, depending on your package manager of choice (this project's `package.json` defines yarn as the default one):
   
    ```sh
    yarn install
    ```

    or, alternatively:
    
    ```sh
    npm install
    ```
4. **Running the Application**: Start the development server with:
    ```sh
    yarn start
    ```

    or, for npm users:
   
    ```sh
    npm start
    ```
    Open [http://localhost:3000](http://localhost:3000) to view it in the browser.
6. **Building for Production**: Create a production build with:
    ```sh
    yarn run build
    ```

    or, again:
    
    ```sh
    npm build
    ```

### Relevant Files

- [`src/components/Spectrum.tsx`](./src/components/Spectrum.tsx): The main spectrum visualization component, contains the audio processing logic.
- [`src/components/AmplitudeIndicators.tsx`](./src/components/AmplitudeIndicators.tsx): The amplitude indicators for the spectrum.
- [`src/components/Layout.tsx`](./src/components/Layout.tsx): The layout of the demo.

This project was designed with simplicity in mind, so the codebase is relatively small and easy to understand.


## License

This project is licensed under the MIT License. You are **free to reuse** this code as you please, for personal, lucrative or non-lucrative projects. Any publication of this code without any significant modifications to its logic **must** however be **correctly attributed**.

> Don't be a d*ck, if it ain't your work, it ain't your fame
