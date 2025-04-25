const { app, BrowserWindow, Menu } = require('electron');
// const path = require('node:path');

const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

// Optional: Log autoUpdater events for debugging
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';


const { fork } = require("child_process");
const path = require("path");

// Run each server in its own working directory
fork(path.join(__dirname, "Backend/server.js"), {
  cwd: path.join(__dirname, "Backend")
});

fork(path.join(__dirname, "Printed/server.js"), {
  cwd: path.join(__dirname, "Printed")
});

fork(path.join(__dirname, "Security/server.js"), {
  cwd: path.join(__dirname, "Security")
});

if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow;
let loadingWindow;

app.whenReady().then(() => {



  // Create Loading Window
  loadingWindow = new BrowserWindow({
    width: 500,
    height: 400,
    icon: path.join(__dirname, 'terminal.ico'),
    frame: false,
    resizable: false,
    transparent: true,
    alwaysOnTop: true,
    webPreferences: {
    nodeIntegration: true,
    },
  });

  loadingWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(`
    <html>
    <head>
        <style>
            body {
                user-select: none;
                background-color: #2d2d2d;
                color: #fff;
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
            }
        </style>
    </head>
    <body>
       <container><h1>  TERMINAL....</h1></container>
         
       
        <h2>BLUEHEARTDEV.COM</h2>
    </body>
    </html>
  `)}`);

  loadingWindow.show();

  // Create Main Window
  const createWindow = () => {
    mainWindow = new BrowserWindow({
      width: 600,
      height: 400,
      frame: false,
      resizable: false,
    transparent: true,
    alwaysOnTop: true,
    webPreferences: {
        nodeIntegration: true,
    },
      show: false, // Initially hidden
      icon: path.join(__dirname, 'terminal.ico'),
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
      },
    });

    mainWindow.once("ready-to-show", () => {
      loadingWindow.close(); // Close loading screen
      mainWindow.show();
    });

    mainWindow.loadFile(path.join(__dirname,  'index.html')); // Load your app

    autoUpdater.checkForUpdatesAndNotify();

    autoUpdater.on('update-downloaded', () => {
      dialog.showMessageBox({
        type: 'info',
        title: 'Update Ready',
        message: 'A new version has been downloaded. Restart the app to apply the update?',
        buttons: ['Yes', 'Later']
      }).then(result => {
        if (result.response === 0) autoUpdater.quitAndInstall();
      });
    });

  };

  setTimeout(() => {
    createWindow();
  }, 5000); // Simulating loading delay






  const { ipcMain } = require("electron");

  ipcMain.on("login-success", (event, userData) => {
    console.log("✅ Login successful message received from renderer");
  
    const { username, contact, email } = userData;
  
    console.log(username, contact, email);

    
  
    if (mainWindow) {
      require("./frontend.js");
      mainWindow.close();
    }
  
    const newWindow = new BrowserWindow({
      width: 1024,
      height: 768,
      icon: path.join(__dirname, 'terminal.ico'),
      webPreferences: {
        nodeIntegration: false
      }
    });
  
    if (!app.isPackaged) {
      newWindow.webContents.openDevTools();
    }

    newWindow.loadURL("http://localhost:4000/");



    newWindow.webContents.once('did-finish-load', () => {
      // Execute JavaScript in the renderer to set sessionStorage
      newWindow.webContents.executeJavaScript(`
        sessionStorage.setItem('username', '${username}');
        sessionStorage.setItem('email', '${email}');
        sessionStorage.setItem('contact', '${contact}');
      `);
    });



    autoUpdater.on('update-available', () => {
      dialog.showMessageBox({
        type: 'info',
        title: 'Update available',
        message: 'A new version is available. Downloading now...'
      });
    });
    
   

  });
  






  
  // Create App Menu
  const tray = [
    {
      label: "Support",
      submenu:[
        {
          label: "Facebook",
          click: async () => {
            const { shell } = require("electron");
            await shell.openExternal("https://facebook.com/SHEIIKH.RIIYAD");
          }
        },
        {
          label: "Github",
          click: async () => {
            const { shell } = require("electron");
            await shell.openExternal("https://github.com/sheiikh-riiyad");
          }
        },
      ]
    },
    {
      label: "Help",
      submenu: [
        {
          label: "Edit",
          submenu:[{ label: "If you register a truck weight then you can edit it again. You must fill the scale fees." }]
        },
        {
          label: "Delete",
          submenu:[{ label: "If you have already registered a truck and it is misplaced, you can delete it by clicking the Delete button." }]
        },
        {
          label: "Print",
          submenu:[{ label:"If you have registered the weight of a truck and want to print it, you must enter the gross, tare, and scale fee correctly." }]
        },
        {
          label:"Reprint",
          submenu:[{ label: "To reprint a slip, go to the console and select which one to print." }]
        },
      ]
    }
  ];

  const appmenu = Menu.buildFromTemplate(tray);
  Menu.setApplicationMenu(appmenu);

});

// Ensure the window is recreated if closed (for macOS)
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Quit when all windows are closed (except macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
