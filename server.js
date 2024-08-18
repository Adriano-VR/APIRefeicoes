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

// Rota GET para buscar os itens (já implementada)
server.get('/', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const itemsPerPage = parseInt(req.query.itemsPerPage) || 10;
    const search = req.query.search || "";

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = page * itemsPerPage;

 
    
    // const filteredData = data.filter(item => 
    //     item.name.toLowerCase().includes(search.toLowerCase())
    // );

    // if (filteredData.length === 0) {
    //     return res.status(404).json({ message: "No data found" });
    // }

    // const paginatedData = filteredData.slice(startIndex, endIndex);

    res.json({
        // totalItems: filteredData.length,
        // totalPages: Math.ceil(filteredData.length / itemsPerPage),
        // currentPage: page,
        // itemsPerPage: itemsPerPage,
        data: data
    });
});

// Rota POST para adicionar um novo item
server.post('/add', (req, res) => {
    try {
        const novaRefeicao = req.body;
        const currentDate = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

        // Validação
        if (!novaRefeicao.titulo || !novaRefeicao.descricao) {
            return res.status(400).json({ message: "Title and description are required" });
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

function salvarDados(dados) {
    fs.writeFileSync(__dirname + "/data.json", JSON.stringify(dados, null, 2));
}
