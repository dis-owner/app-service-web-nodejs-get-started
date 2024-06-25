#!/usr/bin/env node

const express = require('express');
const path = require('path');
const { app: electronApp, BrowserWindow, Tray, Menu, dialog, shell, clipboard } = require('electron');
const http = require('http');
const debug = require('debug')('nodejs-get-started:server');
const isDev = require('electron-is-dev');
const { autoUpdater } = require('electron-updater');

let mainWindow;
const instanceLock = electronApp.requestSingleInstanceLock();
const isMacOS = process.platform === 'darwin';
const PORT = isDev ? '5173' : '51735';
const ICON = 'icon-rounded.png';
const ICON_TEMPLATE = 'iconTemplate.png';

if (require('electron-squirrel-startup')) electronApp.quit();

// Expressアプリケーションの設定
const serverApp = express();
const port = normalizePort(process.env.PORT || '3000');
serverApp.set('port', port);

serverApp.use(express.static(path.join(__dirname, 'public')));

serverApp.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const server = http.createServer(serverApp);
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  var port = parseInt(val, 10);
  if (isNaN(port)) {
    return val;
  }
  if (port >= 0) {
    return port;
  }
  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }
  var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

function createWindow() {
  autoUpdater.checkForUpdatesAndNotify();

  mainWindow = new BrowserWindow({
    autoHideMenuBar: true,
    show: false,
    icon: assetPath(ICON),
  });

  createTray(mainWindow);

  mainWindow.maximize();
  mainWindow.show();

  mainWindow.loadURL(`http://localhost:${PORT}`);

  if (isDev) {
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }

  setupLinksLeftClick(mainWindow);
  setupContextMenu(mainWindow);

  return mainWindow;
}

const assetPath = (asset) => {
  return path.join(__dirname, isDev ? `../public/${asset}` : `../dist/${asset}`);
};

const createTray = (win) => {
  const tray = new Tray(assetPath(!isMacOS ? ICON : ICON_TEMPLATE));
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show',
      click: () => {
        win.maximize();
        win.show();
      },
    },
    {
      label: 'Exit',
      click: () => {
        electronApp.isQuiting = true;
        electronApp.quit();
      },
    },
  ]);

  tray.on('click', () => {
    win.maximize();
    win.show();
  });
  tray.setToolTip('Better ChatGPT');
  tray.setContextMenu(contextMenu);

  return tray;
};

const setupLinksLeftClick = (win) => {
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
};

const setupContextMenu = (win) => {
  win.webContents.on('context-menu', (_, params) => {
    const { x, y, linkURL, selectionText } = params;
    const template = [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'pasteAndMatchStyle' },
      { role: 'delete' },
      { type: 'separator' },
      { role: 'selectAll' },
      { type: 'separator' },
      { role: 'toggleDevTools' },
    ];

    const spellingMenu = [];

    if (selectionText && !linkURL) {
      for (const suggestion of params.dictionarySuggestions) {
        spellingMenu.push(
          new MenuItem({
            label: suggestion,
            click: () => win.webContents.replaceMisspelling(suggestion),
          })
        );
      }
      if (params.misspelledWord) {
        spellingMenu.push(
          new MenuItem({
            label: 'Add to dictionary',
            click: () => win.webContents.session.addWordToSpellCheckerDictionary(params.misspelledWord),
          })
        );
      }
      if (spellingMenu.length > 0) {
        spellingMenu.push({ type: 'separator' });
      }
      template.push(
        { type: 'separator' },
        {
          label: `Search Google for "${selectionText}"`,
          click: () => {
            shell.openExternal(`https://www.google.com/search?q=${encodeURIComponent(selectionText)}`);
          },
        },
        {
          label: `Search DuckDuckGo for "${selectionText}"`,
          click: () => {
            shell.openExternal(`https://duckduckgo.com/?q=${encodeURIComponent(selectionText)}`);
          },
        }
      );
    }

    if (linkURL) {
      template.push(
        { type: 'separator' },
        {
          label: 'Open Link in Browser',
          click: () => {
            shell.openExternal(linkURL);
          },
        },
        {
          label: 'Copy Link Address',
          click: () => {
            clipboard.writeText(linkURL);
          },
        },
        {
          label: 'Save Link As...',
          click: () => {
            dialog.showSaveDialog(win, { defaultPath: path.basename(linkURL) }, (filePath) => {
              if (filePath) {
                download(win, linkURL, { filename: filePath });
              }
            });
          },
        }
      );
    }

    Menu.buildFromTemplate([...spellingMenu, ...template]).popup({ window: win, x, y });
  });
};

electronApp.on('window-all-closed', () => {
  if (!isMacOS) {
    electronApp.quit();
  }
});

process.on('uncaughtException', (error) => {
  dialog.showErrorBox('An error occurred', error.stack);
  process.exit(1);
});

if (!instanceLock) {
  electronApp.quit();
} else {
  electronApp.on('second-instance', (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  electronApp.whenReady().then(() => {
    mainWindow = createWindow();
  });
}