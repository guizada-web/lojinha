const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
// Handler para registrar venda
ipcMain.handle('registrar-venda', (event, venda) => {
  const vendasPath = path.join(__dirname, 'vendas.json');
  let vendas = [];
  if (fs.existsSync(vendasPath)) {
    try {
      vendas = JSON.parse(fs.readFileSync(vendasPath, 'utf8'));
    } catch (e) { vendas = []; }
  }
  vendas.push(venda);
  fs.writeFileSync(vendasPath, JSON.stringify(vendas, null, 2), 'utf8');
  return true;
});
const path = require('path');
const db = require('./db');

const { getProducts, addProduct, updateProduct, deleteProduct } = db;

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  win.loadFile('src/index.html');
}

// IPC handlers para CRUD
ipcMain.handle('get-products', (event) => {
  return new Promise((resolve, reject) => {
    getProducts((err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
});

ipcMain.handle('add-product', (event, product) => {
  return new Promise((resolve, reject) => {
    addProduct(product, function(err) {
      if (err) reject(err);
      else resolve();
    });
  });
});

ipcMain.handle('update-product', (event, product) => {
  return new Promise((resolve, reject) => {
    updateProduct(product, function(err) {
      if (err) reject(err);
      else resolve();
    });
  });
});

ipcMain.handle('delete-product', (event, id) => {
  return new Promise((resolve, reject) => {
    deleteProduct(id, function(err) {
      if (err) reject(err);
      else resolve();
    });
  });
});

app.whenReady().then(() => {
  db.init();
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
