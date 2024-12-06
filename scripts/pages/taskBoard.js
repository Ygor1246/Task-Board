// Importação de constantes e funções de outros arquivos
import { API_BASE_URL } from "../../config/apiConfig.js"; // URL base da API
import { getFromLocalStorage } from "../utils/storage.js"; // Função para pegar dados do armazenamento local

// Seleção de elementos HTML
const boardsList = document.getElementById("boardsList"); // Lista de boards na página
const userNameSpan = document.getElementById("userName"); // Elemento para mostrar o nome do usuário
const logoutButton = document.getElementById("logoutButton"); // Botão de logout
const boardTitle = document.getElementById("boardTitle"); // Título do board selecionado
const boardLayout = document.getElementById("board"); // Área onde o board é exibido
const createBoardButton = document.getElementById("createBoardButton"); // Botão para criar um novo board

// Função para carregar todos os boards do servidor
async function loadBoards() {
    try {
        // Fazendo uma requisição GET para a API
        const response = await fetch(`${API_BASE_URL}/Boards`);
        
        // Verifica se a resposta foi bem-sucedida
        if (!response.ok) {
            throw new Error("Erro ao carregar boards");
        }
        
        // Converte a resposta da API para JSON
        const boards = await response.json();
        
        // Preenche o dropdown com os boards carregados
        populateBoardsDropdown(boards);
    } catch (error) {
        // Exibe erros no console
        console.error("Erro ao carregar boards:", error);
    }
}

// Função para popular o dropdown de boards
function populateBoardsDropdown(boards) {
    boardsList.innerHTML = ""; // Limpa a lista antes de adicionar novos itens
    
    // Itera sobre cada board e cria um item na lista
    boards.forEach((board) => {
        const listItem = document.createElement("li"); // Cria um item <li>
        
        // Define o HTML do item da lista
        listItem.innerHTML = `<a class="dropdown-item" id="dropdown-item" value="${board.Id}">${board.Name}</a>`;
        
        // Adiciona um evento de clique ao item
        listItem.addEventListener("click", (event) => {
            // Atualiza o título do board na interface
            boardTitle.innerHTML = event.target.innerHTML;
            
            // Carrega os detalhes do board selecionado
            loadBoard(board.Id);
        });
        
        // Adiciona o item à lista
        boardsList.appendChild(listItem);
    });
}

// Função para carregar colunas de um board específico pelo ID
async function loadBoard(id) {
    try {
        // Fazendo uma requisição GET para buscar colunas pelo ID do board
        const response = await fetch(`${API_BASE_URL}/ColumnByBoardId?BoardId=${id}`);
        
        // Verifica se a resposta foi bem-sucedida
        if (!response.ok) {
            throw new Error("Erro ao carregar colunas");
        }
        
        // Converte a resposta da API para JSON
        const columns = await response.json();
        
        // Preenche as colunas na interface
        populateColumns(columns);
    } catch (error) {
        // Exibe erros no console
        console.error("Erro ao carregar colunas:", error);
    }
}

// Função para exibir o modal de criação de um novo board
function showCreateBoardModal() {
    const modalContainer = document.createElement("div"); // Cria um container para o modal
    modalContainer.className = "modal-container"; // Define a classe CSS do modal
    
    // Define o conteúdo HTML do modal
    modalContainer.innerHTML = `
        <div class="modal-content">
            <h5>Criar Novo Board</h5>
            <input id="newBoardName" type="text" class="form-control mb-2" placeholder="Nome do Board" />
            <div class="d-flex justify-content-end">
                <button id="saveBoardButton" class="btn btn-success me-2">Salvar</button>
                <button id="cancelBoardButton" class="btn btn-secondary">Cancelar</button>
            </div>
        </div>
    `;
    
    // Adiciona o modal ao corpo do HTML
    document.body.appendChild(modalContainer);

    // Evento para salvar o board quando o botão "Salvar" for clicado
    document.getElementById("saveBoardButton").addEventListener("click", () => {
        const boardName = document.getElementById("newBoardName").value.trim(); // Pega o valor do input
        
        if (boardName) {
            saveBoard(boardName); // Chama a função para salvar o board
            document.body.removeChild(modalContainer); // Remove o modal da tela
        } else {
            alert("O nome do Board não pode estar vazio!"); // Exibe um alerta se o nome estiver vazio
        }
    });

    // Evento para cancelar a criação do board
    document.getElementById("cancelBoardButton").addEventListener("click", () => {
        document.body.removeChild(modalContainer); // Remove o modal da tela
    });
}

// Função para salvar um novo board no servidor
function saveBoard(boardName) {
    // Dados do novo board a serem enviados para a API
    const payload = { Name: boardName, IsActive: true };
    
    // Fazendo uma requisição POST para salvar o board
    fetch(`${API_BASE_URL}/Boards`, {
        method: "POST", // Método POST para enviar dados
        headers: { "Content-Type": "application/json" }, // Define o tipo de dado enviado
        body: JSON.stringify(payload), // Converte o payload para JSON
    })
    .then((response) => {
        if (!response.ok) throw new Error("Erro ao criar o board"); // Verifica erros
        return response.json(); // Converte a resposta da API para JSON
    })
    .then((newBoard) => {
        alert(`Board "${newBoard.Name}" criado com sucesso!`); // Exibe mensagem de sucesso
        loadBoards(); // Atualiza a lista de boards
    })
    .catch((error) => {
        console.error("Erro ao criar board:", error); // Exibe erro no console
        alert("Erro ao criar o board. Tente novamente."); // Alerta o usuário sobre o erro
    });
}

// Função para inicializar a aplicação
function init() {
    loadUserName(); // Carrega o nome do usuário na interface
    loadBoards(); // Carrega a lista de boards
    createBoardButton.addEventListener("click", showCreateBoardModal); // Adiciona evento ao botão de criar board
}

// Função para carregar o nome do usuário
function loadUserName() {
    const userName = getFromLocalStorage("user"); // Pega o nome do usuário do localStorage
    userNameSpan.textContent = userName?.name ? `Olá, ${userName.name.split(" ")[0]}` : "Usuário não identificado"; // Mostra o nome na interface
}

// Evento para fazer logout
logoutButton.addEventListener("click", () => {
    localStorage.removeItem("user"); // Remove os dados do usuário do localStorage
    window.location.href = "index.html"; // Redireciona para a página inicial
});

// Chama a função de inicialização
init();
