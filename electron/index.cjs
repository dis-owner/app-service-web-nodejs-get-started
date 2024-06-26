#!/usr/bin/env node

const path = require('path');
const { app, shell, clipboard, dialog, download, BrowserWindow, Tray, Menu, MenuItem } = require('electron');
const isDev = require('electron-is-dev');
const { autoUpdater } = require('electron-updater');
const express = require('express');
const http = require('http');
const fs = require('fs');

const PORT = isDev ? '5173' : (process.env.PORT || '51735');
const ICON = 'icon-rounded.png';
const ICON_TEMPLATE = 'iconTemplate.png';

// Expressサーバーの設定
function createExpressServer() {
  const expressApp = express();
  const server = http.createServer(expressApp);

  expressApp.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });

  expressApp.use(express.static(path.join(__dirname, '../dist')));

  server.listen(PORT, () => {
    console.log(`Express server listening on http://localhost:${PORT}/`);
  });

  return expressApp;
}

// エレクトロンの設定
function createElectronWindow() {
  autoUpdater.checkForUpdatesAndNotify();

  let win = new BrowserWindow({
    autoHideMenuBar: true,
    show: false,
    icon: assetPath(ICON),
  });

  createTray(win);

  win.maximize();
  win.show();

  if (!isDev) {
    createExpressServer();
  }

  win.loadURL(`http://localhost:${PORT}`);

  if (isDev) {
    win.webContents.openDevTools({ mode: 'detach' });
  }

  setupLinksLeftClick(win);
  setupContextMenu(win);

  return win;
}

const assetPath = (asset) => {
  return path.join(
    __dirname,
    isDev ? `../public/${asset}` : `../dist/${asset}`
  );
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
            click: () =>
              win.webContents.session.addWordToSpellCheckerDictionary(
                params.misspelledWord
              ),
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
            shell.openExternal(
              `https://www.google.com/search?q=${encodeURIComponent(
                selectionText
              )}`
            );
          },
        },
        {
          label: `Search DuckDuckGo for "${selectionText}"`,
          click: () => {
            shell.openExternal(
              `https://duckduckgo.com/?q=${encodeURIComponent(selectionText)}`
            );
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
            dialog.showSaveDialog(
              win,
              { defaultPath: path.basename(linkURL) },
              (filePath) => {
                if (filePath) {
                  download(win, linkURL, { filename: filePath });
                }
              }
            );
          },
        }
      );
    }

    Menu.buildFromTemplate([...spellingMenu, ...template]).popup({
      window: win,
      x,
      y,
    });
  });
};

const createTray = (win) => {
  const tray = new Tray(assetPath(!process.platform === 'darwin' ? ICON : ICON_TEMPLATE));
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
        app.isQuiting = true;
        app.quit();
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

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

process.on('uncaughtException', (error) => {
  dialog.showErrorBox('An error occurred', error.stack);
  process.exit(1);
});

if (app) {
  const instanceLock = app.requestSingleInstanceLock();
  if (!instanceLock) {
    app.quit();
  } else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
      if (win) {
        if (win.isMinimized()) win.restore();
        win.focus();
      }
    });

    app.whenReady().then(createElectronWindow);
  }
} else {
  createExpressServer();
}
