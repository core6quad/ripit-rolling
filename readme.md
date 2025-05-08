# PoC Electron + Vue Application

App is a GUI for the **yt-dlp** utility, designed to make downloading media files easier and more manageable. The application provides a user-friendly interface with the following features:

- **Media File Information**: It can fetch and display detailed information about a media file, such as resolution, bitrate, audio tracks, and other relevant metadata.
  
- **File Management**: The app maintains a list of files, allowing users to select the file name and audio/video tracks they wish to download.
  
- **Queue-based Downloading**: Downloads are handled using a queue system, enabling users to queue multiple media files and download them one after the other without interruption.
  
With this tool, users can quickly and efficiently download media files from supported sources with full control over the file options and download sequence.

## Key Features:
- Retrieve and display media file details (e.g., video resolution, audio tracks, etc.).
- Maintain a list of selected files with customizable names and track choices.
- Manage multiple downloads using a queue system. (WIP)

## Prerequisites

Before you can build this project, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (version 16 or higher)
- [Yarn](https://yarnpkg.com/) (recommended for package management)

## Setup

1. Clone the repository:

2. Install dependencies:

   You can use either **npm** or **Yarn** to install dependencies, but it’s recommended to use **Yarn**:

   ```
   yarn install
   ```

   Or with npm:

   ```
   npm install
   ```

## Development Mode

To run the application in development mode:

```
yarn go
```

This command will start **Vite** for hot-reloading the frontend, and **Electron** for running the backend.

Alternatively, with **npm**:

```
npm run go
```

## Build for Production

To build the application for production (which will package and distribute the app), use the following command for macOS:

```
yarn build:mac
```

Alternatively, with **npm**:

```
npm run build:mac
```

This will create a `.dmg` file for macOS in the `release-builds` folder.

### Target Platforms

- **Windows**: The default target is **NSIS**.
- **macOS**: The default target is **DMG**.
- **Linux**: The default targets are **AppImage** and **deb**.

The built files will be saved to the `release-builds` folder.

## Packaging and Distribution

Once the build is complete, the distributable files will be available inside the `release-builds` folder.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## VS Code Typescript Configuration for Vue/Vite

In this project, the VS Code setting \`typescript.tsconfig\` is used to apply a specific \`tsconfig.json\` file to the renderer process code, located in the \`src/renderer\` directory. This ensures that TypeScript uses the correct settings for files in that directory, such as those tailored for Vue or Vite, without affecting other parts of the project.

### **Important**:  
Make sure to **add this setting in your VS Code** to ensure proper TypeScript handling for the renderer code. If this configuration is not set, TypeScript may not handle the renderer code correctly.

Below is the configuration:

```json
{
  "typescript.tsconfig": {
    "**/src/renderer/**/*": "tsconfig.renderer.json"
  }
}
```
