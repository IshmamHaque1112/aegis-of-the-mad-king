// Electron shell: loads the same single-file game offline in its own window.
const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');
function create() {
  const win = new BrowserWindow({
    width: 1440, height: 900, minWidth: 800, minHeight: 560,
    backgroundColor: '#0d1117', title: 'Aegis of the Mad King',
    icon: path.join(__dirname, 'app', 'icons', 'icon-512.png'),
    webPreferences: { contextIsolation: true, sandbox: true }
  });
  win.loadFile(path.join(__dirname, 'app', 'index.html'));
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' }; });
}
Menu.setApplicationMenu(Menu.buildFromTemplate([
  { label: 'Game', submenu: [{ role: 'reload' }, { role: 'togglefullscreen' }, { type: 'separator' }, { role: 'quit' }] },
  { label: 'View', submenu: [{ role: 'zoomIn' }, { role: 'zoomOut' }, { role: 'resetZoom' }, { role: 'toggleDevTools' }] }
]));
app.whenReady().then(create);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) create(); });
