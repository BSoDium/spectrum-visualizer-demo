# Spectrum Demo

A demo application for a custom spectrum sound visualization component.

![alt text](assets/recording-dark-theme.gif#gh-dark-mode-only)
![alt text](assets/recording-light-theme.gif#gh-light-mode-only)

## Overview

This application provides real-time audio visualization from microphone input with customizable color schemes and a responsive design.

### Getting Started

1. **Prerequisites**: Ensure you have Node.js and npm or yarn installed.
2. **Installation**:
    ```sh
    git clone https://github.com/your-username/spectrum-demo.git
    cd spectrum-demo
    npm install
    # or
    yarn install
    ```
3. **Running the Application**: Start the development server with:
    ```sh
    npm start
    # or
    yarn start
    ```
    Open [http://localhost:3000](http://localhost:3000) to view it in the browser.
4. **Building for Production**: Create a production build with:
    ```sh
    npm run build
    # or
    yarn build
    ```

### Relevant Files

- [`src/components/Spectrum.tsx`](./src/components/Spectrum.tsx): The main spectrum visualization component, contains the audio processing logic.
- [`src/components/AmplitudeIndicators.tsx`](./src/components/AmplitudeIndicators.tsx): The amplitude indicators for the spectrum.
- [`src/components/Layout.tsx`](./src/components/Layout.tsx): The layout of the demo.

This project was designed with simplicity in mind, so the codebase is relatively small and easy to understand.


## License

This project is licensed under the MIT License.
