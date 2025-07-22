// Função para registrar venda no backend
function registrarVenda(venda) {
  return window.api.registrarVenda ? window.api.registrarVenda(venda) : Promise.resolve();
}

// Função para finalizar compra
function finalizarCompra() {
  if (carrinho.length === 0) {
    alert('Seu carrinho está vazio! Adicione produtos para finalizar a compra.');
    return;
  }
  // Verifica novamente se há estoque suficiente
  for (const item of carrinho) {
    const prod = produtosAtuais.find(p => p.id === item.id);
    if (!prod || item.qtd > prod.estoque) {
      alert(`Estoque insuficiente para o produto: ${item.nome}`);
      return;
    }
  }
  // Atualiza o estoque no banco
  Promise.all(
    carrinho.map(item => {
      const prod = produtosAtuais.find(p => p.id === item.id);
      return window.api.updateProduct({
        id: item.id,
        nome: prod.nome,
        preco: prod.preco,
        estoque: prod.estoque - item.qtd
      });
    })
  ).then(() => {
    // Registrar venda
    const venda = {
      data: new Date().toLocaleString('pt-BR'),
      itens: carrinho.map(item => ({ nome: item.nome, qtd: item.qtd, preco: item.preco })),
      total: carrinho.reduce((soma, item) => soma + item.preco * item.qtd, 0)
    };
    registrarVenda(venda).then(() => {
      // Mensagem personalizada
      alert(`Obrigado pela sua compra!\nTotal: R$ ${venda.total.toFixed(2)}\nVolte sempre!`);
      // Atualiza estoque localmente para feedback instantâneo
      carrinho.forEach(item => {
        const prod = produtosAtuais.find(p => p.id === item.id);
        if (prod) prod.estoque -= item.qtd;
      });
      carrinho = [];
      atualizarTabelaCarrinho();
      atualizarTabelaProdutos(produtosAtuais);
      carregarProdutos(); // Mantém sincronizado com o banco
    });
  });
}

// Lógica de CRUD de produtos e carrinho de compras
let carrinho = [];
let produtosAtuais = [];

function atualizarTabelaProdutos(produtos) {
  produtosAtuais = produtos;
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
    const prod = produtosAtuais.find(p => p.id === item.id);
    const estoque = prod ? prod.estoque : 0;
    const subtotal = item.preco * item.qtd;
    total += subtotal;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.nome}</td>
      <td>R$ ${item.preco.toFixed(2)}</td>
      <td><input type='number' min='1' max='${estoque}' value='${item.qtd}' onchange='alterarQtdCarrinho(${idx}, this.value)'></td>
      <td>R$ ${subtotal.toFixed(2)}</td>
      <td><button class='btn-remover' onclick='removerDoCarrinho(${idx})'>Remover ⛔</button></td>
    `;
    tbody.appendChild(tr);
  });
  document.getElementById('total-carrinho').innerText = `Total: R$ ${total.toFixed(2)}`;
}

function alterarQtdCarrinho(idx, qtd) {
  qtd = parseInt(qtd);
  const item = carrinho[idx];
  const prod = produtosAtuais.find(p => p.id === item.id);
  if (prod && qtd > prod.estoque) {
    alert('Quantidade escolhida excede o estoque disponível!');
    carrinho[idx].qtd = prod.estoque;
  } else if (qtd < 1) {
    carrinho[idx].qtd = 1;
  } else {
    carrinho[idx].qtd = qtd;
  }
  atualizarTabelaCarrinho();
}

function removerDoCarrinho(idx) {
  carrinho.splice(idx, 1);
  atualizarTabelaCarrinho();
}

function adicionarAoCarrinho(id, nome, preco) {
  const prod = produtosAtuais.find(p => p.id === id);
  if (!prod || prod.estoque < 1) {
    alert('Produto sem estoque disponível!');
    return;
  }
  const idx = carrinho.findIndex(item => item.id === id);
  if (idx >= 0) {
    if (carrinho[idx].qtd + 1 > prod.estoque) {
      alert('Quantidade escolhida excede o estoque disponível!');
      return;
    }
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
  window.api.getProducts().then(produtos => {
    atualizarTabelaProdutos(produtos);
    atualizarTabelaCarrinho(); // Atualiza limites do carrinho se estoque mudar
  });
}

window.onload = () => {
  carregarProdutos();
  atualizarTabelaCarrinho();
  const btnFinalizar = document.getElementById('finalizar-compra');
  if (btnFinalizar) btnFinalizar.onclick = finalizarCompra;
};
