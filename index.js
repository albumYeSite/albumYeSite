const express = require('express');
const path = require('path');
const app = express();

// serve a pasta public
app.use(express.static(path.join(__dirname, 'public')));

// lê o corpo json das requisições post
app.use(express.json());

// lista guardada na memória do servidor
let lista = ['Item 1', 'Item 2', 'Item 3'];

// post: adiciona um item na lista
app.post('/api/lista', (req, res) => {
    lista.push(req.body);
    res.json({ status: 'sucesso', lista });

    //arquivo professora dentro do post
    const novaObra = req.body;
    lista.push(novaObra);
    res.json({ status: 'sucesso', lista});
});

// get: devolve a lista (prof pediu tb)
app.get('/api/lista', (req, res) => {
    res.json(lista);
});

app.listen(3000, () => console.log('Olá!!!'));
