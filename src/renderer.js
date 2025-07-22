
// Lógica de CRUD de produtos e carrinho de compras
let carrinho = [];

function atualizarTabelaProdutos(produtos) {
  const tbody = document.querySelector('#tabela-produtos tbody');
  tbody.innerHTML = '';
  produtos.forEach(prod => {
    const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${prod.nome}</td>
          <td>R$ ${prod.preco.toFixed(2)}</td>
          <td>${prod.estoque}</td>
          <td>
            <button onclick="editarProduto(${prod.id}, '${prod.nome}', ${prod.preco}, ${prod.estoque})">Editar ✏️</button>
            <button class='btn-excluir' onclick="deletarProduto(${prod.id})">Excluir 🗑️</button>
            <button onclick="adicionarAoCarrinho(${prod.id}, '${prod.nome}', ${prod.preco})">Adicionar ao Carrinho</button>
          </td>
        `;
    tbody.appendChild(tr);
  });
}

function atualizarTabelaCarrinho() {
  const tbody = document.querySelector('#tabela-carrinho tbody');
  tbody.innerHTML = '';
  let total = 0;
  carrinho.forEach((item, idx) => {
    const subtotal = item.preco * item.qtd;
    total += subtotal;
    const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${item.nome}</td>
          <td>R$ ${item.preco.toFixed(2)}</td>
          <td><input type='number' min='1' value='${item.qtd}' onchange='alterarQtdCarrinho(${idx}, this.value)'></td>
          <td>R$ ${subtotal.toFixed(2)}</td>
          <td><button class='btn-remover' onclick='removerDoCarrinho(${idx})'>Remover ⛔</button></td>
        `;
    tbody.appendChild(tr);
  });
  document.getElementById('total-carrinho').innerText = `Total: R$ ${total.toFixed(2)}`;
}

function alterarQtdCarrinho(idx, qtd) {
  carrinho[idx].qtd = parseInt(qtd);
  atualizarTabelaCarrinho();
}

function removerDoCarrinho(idx) {
  carrinho.splice(idx, 1);
  atualizarTabelaCarrinho();
}

function adicionarAoCarrinho(id, nome, preco) {
  const idx = carrinho.findIndex(item => item.id === id);
  if (idx >= 0) {
    carrinho[idx].qtd++;
  } else {
    carrinho.push({ id, nome, preco, qtd: 1 });
  }
  atualizarTabelaCarrinho();
}

function editarProduto(id, nome, preco, estoque) {
  document.getElementById('produto-id').value = id;
  document.getElementById('produto-nome').value = nome;
  document.getElementById('produto-preco').value = preco;
  document.getElementById('produto-estoque').value = estoque;
  document.getElementById('cancelar-edicao').style.display = '';
}

function deletarProduto(id) {
  window.api.deleteProduct(id).then(() => carregarProdutos());
}

document.getElementById('form-produto').addEventListener('submit', function(e) {
  e.preventDefault();
  const id = document.getElementById('produto-id').value;
  const nome = document.getElementById('produto-nome').value;
  const preco = parseFloat(document.getElementById('produto-preco').value);
  const estoque = parseInt(document.getElementById('produto-estoque').value);
  if (id) {
    window.api.updateProduct({ id, nome, preco, estoque }).then(() => {
      carregarProdutos();
      this.reset();
      document.getElementById('cancelar-edicao').style.display = 'none';
    });
  } else {
    window.api.addProduct({ nome, preco, estoque }).then(() => {
      carregarProdutos();
      this.reset();
    });
  }
});

document.getElementById('cancelar-edicao').addEventListener('click', function() {
  document.getElementById('form-produto').reset();
  document.getElementById('produto-id').value = '';
  this.style.display = 'none';
});

function carregarProdutos() {
  window.api.getProducts().then(produtos => atualizarTabelaProdutos(produtos));
}

window.onload = () => {
  carregarProdutos();
  atualizarTabelaCarrinho();
};
