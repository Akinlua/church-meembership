const { app, BrowserWindow, Menu, dialog } = require("electron");
const { autoUpdater } = require("electron-updater");
const path = require("path");

let mainWindow;
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", (event, argv, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

// Configure auto-updater
autoUpdater.autoDownload = false; // Don't auto-download, ask user first
autoUpdater.autoInstallOnAppQuit = true; // Auto-install when app quits

// Auto-updater event handlers
autoUpdater.on("checking-for-update", () => {
  console.log("Checking for updates...");
});

autoUpdater.on("update-available", (info) => {
  console.log("Update available:", info.version);

  dialog.showMessageBox(mainWindow, {
    type: "info",
    title: "Update Available",
    message: `A new version (${info.version}) is available!`,
    detail: "Would you like to download it now?",
    buttons: ["Download", "Later"],
    defaultId: 0,
    cancelId: 1
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.downloadUpdate();
    }
  });
});

autoUpdater.on("update-not-available", (info) => {
  console.log("Update not available. Current version:", info.version);
});

autoUpdater.on("error", (err) => {
  console.error("Error in auto-updater:", err);
  dialog.showMessageBox(mainWindow, {
    type: "error",
    title: "Update Error",
    message: "An error occurred while checking for updates.",
    detail: err.message
  });
});

autoUpdater.on("download-progress", (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + " - Downloaded " + progressObj.percent + "%";
  log_message = log_message + " (" + progressObj.transferred + "/" + progressObj.total + ")";
  console.log(log_message);

  // Update window title with progress
  if (mainWindow) {
    mainWindow.setTitle(`Church Membership - Downloading Update ${Math.floor(progressObj.percent)}%`);
  }
});

autoUpdater.on("update-downloaded", (info) => {
  console.log("Update downloaded");

  // Restore original title
  if (mainWindow) {
    mainWindow.setTitle("Church Membership");
  }

  dialog.showMessageBox(mainWindow, {
    type: "info",
    title: "Update Ready",
    message: "Update downloaded successfully!",
    detail: "The application will restart to install the update.",
    buttons: ["Restart Now", "Later"],
    defaultId: 0,
    cancelId: 1
  }).then((result) => {
    if (result.response === 0) {
      autoUpdater.quitAndInstall(false, true);
    }
  });
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "Church Membership",
    webPreferences: {
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, "build", "index.html"));

  // Create menu with update option
  createMenu();

  // Check for updates when window is ready (only in production)
  // if (!process.env.NODE_ENV || process.env.NODE_ENV === "production") {
  mainWindow.webContents.on("did-finish-load", () => {
    // Check for updates 3 seconds after app starts
    setTimeout(() => {
      autoUpdater.checkForUpdates();
    }, 3000);
  });
  // }
}

function createMenu() {
  const template = [
    {
      label: "File",
      submenu: [
        {
          label: "Check for Updates",
          click: () => {
            autoUpdater.checkForUpdates();
          }
        },
        { type: "separator" },
        {
          label: "Exit",
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: "Help",
      submenu: [
        {
          label: "About",
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: "info",
              title: "About Church Membership",
              message: `Church Membership Management System`,
              detail: `Version: ${app.getVersion()}\n\nA comprehensive solution for managing church membership, groups, and reports.`
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

