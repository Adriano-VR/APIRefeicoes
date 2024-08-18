const express = require("express");
const cors = require("cors");
const fs = require('fs');
const server = express();

server.use(cors());
server.use(express.json()); 

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Carregando o arquivo correto
let data = require("./data.json");

// Rota GET para buscar os itens
server.get('/', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const itemsPerPage = parseInt(req.query.itemsPerPage) || 20;
    const search = req.query.search || "";

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = page * itemsPerPage;

    const filteredData = data.filter(item => 
        item.name.toLowerCase().includes(search.toLowerCase())
    );

    if (filteredData.length === 0) {
        return res.status(404).json({ message: "No data found" });
    }

    const paginatedData = filteredData.slice(startIndex, endIndex);

    res.json({
        totalItems: filteredData.length,
        totalPages: Math.ceil(filteredData.length / itemsPerPage),
        currentPage: page,
        itemsPerPage: itemsPerPage,
        items: paginatedData
    });
});

// Rota POST para adicionar um novo item
server.post('/add', (req, res) => {
    try {
        const novaRefeicao = req.body;
        const currentDate = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

        // Validação
        if (!novaRefeicao.name || !novaRefeicao.descricao) {
            return res.status(400).json({ message: "Name and description are required" });
        }

        // Determina o último ID e atribui um novo
        const ultimoId = data.length > 0 ? data[data.length - 1].id : 0;
        novaRefeicao.id = ultimoId + 1;

        // Atribui a data atual ao novo item
        novaRefeicao.data = currentDate;

        // Adiciona o novo item ao array de dados
        data.push(novaRefeicao);

        // Salva os dados no arquivo
        salvarDados(data);

        // Retorna resposta de sucesso
        res.status(201).json({ message: "Item added successfully", newItem: novaRefeicao });
    } catch (error) {
        console.error("Erro ao salvar os dados: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Rota DELETE para apagar um item
server.delete('/delete/:id', (req, res) => {
    try {
        const { id } = req.params;

        // Remove o item com o ID especificado
        data = data.filter(item => item.id !== parseInt(id));

        // Salva os dados atualizados no arquivo
        salvarDados(data);

        // Retorna resposta de sucesso
        res.status(200).json({ message: "Item deleted successfully" });
    } catch (error) {
        console.error("Erro ao deletar os dados: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Rota PATCH para incrementar o número de usuários
server.patch('/increment/:id', (req, res) => {
    try {
        const { id } = req.params;

        // Atualiza o número de usuários para o item com o ID especificado
        data = data.map(item =>
            item.id === parseInt(id) ? { ...item, users: item.users + 1 } : item
        );

        // Salva os dados atualizados no arquivo
        salvarDados(data);

        // Retorna resposta de sucesso
        res.status(200).json({ message: "User count incremented successfully" });
    } catch (error) {
        console.error("Erro ao incrementar usuários: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Rota PATCH para decrementar o número de usuários
server.patch('/decrement/:id', (req, res) => {
    try {
        const { id } = req.params;

        // Atualiza o número de usuários para o item com o ID especificado
        data = data.map(item =>
            item.id === parseInt(id) ? { ...item, users: Math.max(item.users - 1, 0) } : item
        );

        // Salva os dados atualizados no arquivo
        salvarDados(data);

        // Retorna resposta de sucesso
        res.status(200).json({ message: "User count decremented successfully" });
    } catch (error) {
        console.error("Erro ao decrementar usuários: ", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

function salvarDados(dados) {
    fs.writeFileSync(__dirname + "/data.json", JSON.stringify(dados, null, 2));
}
