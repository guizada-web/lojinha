const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, 'lojinha.db');
let db;

function init() {
  db = new sqlite3.Database(dbPath);
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS produtos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      preco REAL NOT NULL,
      estoque INTEGER NOT NULL
    )`);
  });
}

function getProducts(cb) {
  db.all('SELECT * FROM produtos', cb);
}

function addProduct(prod, cb) {
  db.run('INSERT INTO produtos (nome, preco, estoque) VALUES (?, ?, ?)', [prod.nome, prod.preco, prod.estoque], cb);
}

function updateProduct(prod, cb) {
  db.run('UPDATE produtos SET nome=?, preco=?, estoque=? WHERE id=?', [prod.nome, prod.preco, prod.estoque, prod.id], cb);
}

function deleteProduct(id, cb) {
  db.run('DELETE FROM produtos WHERE id=?', [id], cb);
}

module.exports = { init, getProducts, addProduct, updateProduct, deleteProduct };
