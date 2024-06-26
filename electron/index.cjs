const express = require('express');
const path = require('path');

// エレクトロン環境かどうかをチェック
const isElectron = process.versions.hasOwnProperty('electron');

if (isElectron) {
  const { app, BrowserWindow } = require('electron');
  const isDev = require('electron-is-dev');

  function createWindow() {
    const mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        nodeIntegration: true,
      },
    });

    mainWindow.loadURL(
      isDev
        ? 'http://localhost:3000'
        : `file://${path.join(__dirname, '../dist/index.html')}`
    );

    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  }

  app.on('ready', createWindow);

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
} else {
  // Expressサーバーの設定
  const app = express();
  const port = process.env.PORT || 3000;

  app.use(express.static(path.join(__dirname, '../dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}
