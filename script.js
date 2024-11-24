// script.js

let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];  // Carrega o carrinho do localStorage, se houver

// Função para adicionar item ao carrinho
function adicionarAoCarrinho(nome, preco) {
    const itemExistente = carrinho.find(item => item.nome === nome);
    if (itemExistente) {
        itemExistente.quantidade += 1;
        itemExistente.preco += preco;
    } else {
        carrinho.push({ nome, preco, quantidade: 1 });
    }
    alert(`${nome} adicionado ao carrinho!`);
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    atualizarCarrinho();
}

// Função para atualizar o carrinho exibido na página
function atualizarCarrinho() {
    const carrinhoDiv = document.getElementById('carrinho');
    if (!carrinhoDiv) return;

    carrinhoDiv.innerHTML = '';
    let total = 0;

    carrinho.forEach((item, index) => {
        carrinhoDiv.innerHTML += `
            <p>${item.nome} - R$ ${item.preco.toFixed(2)} (Quantidade: ${item.quantidade}) 
            <button onclick="removerDoCarrinho(${index})">Remover</button></p>`;
        total += item.preco;
    });

    const totalDiv = document.getElementById('total');
    if (totalDiv) totalDiv.innerText = `Total: R$ ${total.toFixed(2)}`;
}

// Função para remover item do carrinho
function removerDoCarrinho(index) {
    carrinho.splice(index, 1);
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
    atualizarCarrinho();
}

// Função para finalizar o pedido e enviar os dados ao backend
function finalizarPedido() {
    if (carrinho.length > 0) {
        const usuario = JSON.parse(localStorage.getItem('usuario')); // Recupera os dados do usuário
        if (usuario && usuario.endereco) {
            const total = carrinho.reduce((acc, item) => acc + item.preco, 0); // Calcula o total do carrinho

            // Cria o objeto de pedido
            const pedido = {
                itens: carrinho.map(item => ({
                    nome: item.nome,
                    preco: item.preco / item.quantidade, // Preço unitário
                    quantidade: item.quantidade
                })),
                enderecoEntrega: usuario.endereco,
                total: total.toFixed(2) // Total formatado
            };

            // Envia o pedido para o backend usando fetch
            fetch('http://localhost:8080/pedido/finalizar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(pedido) // Envia o objeto pedido como JSON
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erro: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                alert('Pedido realizado com sucesso!');
                localStorage.removeItem('carrinho'); // Limpa o carrinho
                carrinho = []; // Limpa o carrinho na aplicação
                atualizarCarrinho(); // Atualiza a tela
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

// Função para cadastrar usuário
function cadastrarUsuario() {
    // Obter dados do formulário de cadastro
    const nome = document.getElementById('nome').value;
    const telefone = document.getElementById('telefone').value;
    const endereco = document.getElementById('endereco').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('senhaCadastro').value;

    // Criar objeto com os dados do usuário
    const usuario = {
        nome: nome,
        telefone: telefone,
        endereco: endereco,
        email: email,
        senha: senha
    };

    // Enviar os dados do usuário para o backend
    fetch('http://localhost:8080/usuario/cadastrar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(usuario) // Converte o objeto para JSON
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erro ao cadastrar usuário: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        alert('Usuário cadastrado com sucesso!');
        console.log('Dados retornados:', data);
        // Redirecionar ou realizar outras ações após o cadastro
    })
    .catch(error => {
        console.error('Erro na requisição:', error);
        alert('Ocorreu um erro ao cadastrar o usuário. Verifique os dados e tente novamente.');
    });
}

// Adicionar evento ao formulário de cadastro
document.getElementById('cadastroForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Impede o envio padrão do formulário
    cadastrarUsuario(); // Chama a função de cadastro
});

// Carregar o carrinho ao carregar a página 'pedido.html'
window.onload = function() {
    carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    atualizarCarrinho();
};