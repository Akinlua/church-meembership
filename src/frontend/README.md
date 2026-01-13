# Church Membership Application

## Build and Release Guide

This application is built using Electron and React. Below are the instructions for building the application for macOS and Windows.

### Prerequisites
- Node.js installed.
- Run `npm install` in this directory to install dependencies.

### Building for macOS
To build the application for macOS (Apple Silicon/M1/M2/M3):

```bash
npm run electron:build
```

**Output Files:**
- The installer file is located at: `dist/ChurchMembership-1.0.0-arm64.dmg`
- There is also a zip file: `dist/ChurchMembership-1.0.0-arm64-mac.zip`

**For Distribution:**
Upload the `.dmg` file to GitHub Releases. Users on macOS can download this file, open it, and drag the app to their Applications folder.

### Building for Windows
To build the application for Windows (64-bit) from macOS:

```bash
npm run electron:build:win
```

**Output Files:**
- The installer file is located at: `dist/ChurchMembership Setup 1.0.0.exe`
- The `dist/win-unpacked` folder contains the uncompressed application files (useful for testing but not for distribution).

**For Distribution:**
Upload the `.exe` file (`ChurchMembership Setup 1.0.0.exe`) to GitHub Releases. Windows users can download and run this installer.

### GitHub Release Instructions
1.  Go to your GitHub repository.
2.  Click "Releases" -> "Draft a new release".
3.  Tag version: `v1.0.0` (or your current version).
4.  Release title: `v1.0.0 Release`.
5.  Description: Describe changes in this release.
6.  **Attach binaries**: Drag and drop the following files from your `dist` folder:
    -   `ChurchMembership-1.0.0-arm64.dmg`
    -   `ChurchMembership Setup 1.0.0.exe`
7.  Click "Publish release".
