const express = require("express");
const cors = require("cors");

const server = express();

let id = 0;

server.use(cors());
server.use(express.json()); 

// Utilize process.env.PORT para a porta
const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const datajosn = require("./dados.json");
const data = datajosn.refeicoes;

// GET route (already implemented)
server.get('/', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const itemsPerPage = parseInt(req.query.itemsPerPage) || 10;
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

// POST route to add a new item
server.post('/add', (req, res) => {
    const novaRefeicao = req.body;
    const currentDate = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

    // Validation check
    if (!novaRefeicao.titulo || !novaRefeicao.descricao) {
        return res.status(400).json({ message: "Title and description are required" });
    }

    // Determine the last ID and assign a new one
    const ultimoId = data.length > 0 ? data[data.length - 1].id : 0;
    novaRefeicao.id = ultimoId + 1;

    // Assign the current date to the new item
    novaRefeicao.data = currentDate;

    // Add the new item to the data array
    data.push(novaRefeicao);

    // Return success response
    res.status(201).json({ message: "Item added successfully", newItem: novaRefeicao });
});

