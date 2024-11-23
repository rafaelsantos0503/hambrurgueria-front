// script.js

let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];  // Carrega o carrinho do localStorage, se houver

// Função para adicionar item ao carrinho
function adicionarAoCarrinho(nome, preco) {
    carrinho.push({ nome, preco });
    alert(`${nome} adicionado ao carrinho!`);
    localStorage.setItem('carrinho', JSON.stringify(carrinho));  // Salva o carrinho no localStorage
    atualizarCarrinho();
}

// Função para atualizar o carrinho exibido na página
function atualizarCarrinho() {
    const carrinhoDiv = document.getElementById('carrinho');
    carrinhoDiv.innerHTML = '';  // Limpa o carrinho antes de atualizar
    let total = 0;

    carrinho.forEach((item, index) => {
        carrinhoDiv.innerHTML += `<p>${item.nome} - R$ ${item.preco.toFixed(2)} <button onclick="removerDoCarrinho(${index})">Remover</button></p>`;
        total += item.preco;  // Soma o preço dos itens
    });

    document.getElementById('total').innerText = `Total: R$ ${total.toFixed(2)}`;  // Atualiza o total
}

// Função para remover item do carrinho
function removerDoCarrinho(index) {
    carrinho.splice(index, 1);  // Remove o item do carrinho
    localStorage.setItem('carrinho', JSON.stringify(carrinho));  // Atualiza o carrinho no localStorage
    atualizarCarrinho();
}

// Função para finalizar o pedido e enviar os dados ao backend
function finalizarPedido() {
    if (carrinho.length > 0) {
        const usuario = JSON.parse(localStorage.getItem('usuario'));  // Recupera os dados do usuário
        if (usuario && usuario.endereco) {
            // Cria o objeto de pedido
            const pedido = {
                endereco: usuario.endereco,
                itens: carrinho.map(item => ({ nome: item.nome, preco: item.preco }))
            };

            // Envia o pedido para o backend usando fetch
            fetch('http://localhost:8080/pedido/finalizar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(pedido)  // Envia o objeto pedido como JSON
            })
            .then(response => response.json())
            .then(data => {
                alert('Pedido realizado com sucesso!');
                localStorage.removeItem('carrinho');  // Limpa o carrinho
                carrinho = [];  // Limpa o carrinho na aplicação
                atualizarCarrinho();  // Atualiza a tela
            })
            .catch(error => {
                console.error('Erro ao enviar o pedido:', error);
                alert('Ocorreu um erro ao processar o pedido.');
            });

        } else {
            alert('Para finalizar o pedido, você precisa estar logado e cadastrar seu endereço.');
        }
    } else {
        alert('Seu carrinho está vazio!');
    }
}

// Carregar o carrinho ao carregar a página 'pedido.html'
window.onload = function() {
    carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    atualizarCarrinho();
};
