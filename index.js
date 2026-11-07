const express = require('express');
const path = require('path');
const app = express();
// ! novo, mysql2
const mysql = require('mysql2');

// serve a pasta public
app.use(express.static(path.join(__dirname, 'public')));

// lê o corpo json das requisições post
app.use(express.json());

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1911',
    database: 'mydb', // nome do seu schema
    dateStrings: true
});

db.connect((erro)=>{
    if(erro){
        console.error(':(', erro);
    }
    else{
        console.log('conectado ao banco!');
    }
});

const banco = db.promise();

app.get('/api/lista', async (req, res) => {
    try {
        const [resultado] = await banco.query('SELECT * FROM album');
        res.json({ lista: resultado });
    } catch (erro) {
        console.error('erro ao recuperar albuns :(', erro);
        res.status(500).json({ erro: 'erro ao buscar dados' });
    }
});

app.post('/api/lista', (req, res) => {
    res.json({ status: 'sucesso', recebido: req.body });
});

const tabelas = {
    usuario: {
        rota: 'usuarios',
        chave: ['idUsuario'],
        auto: true,
        campos: {
            nomeUsuario: { tipo: 'texto', max: 45 },
            emailUsuario: { tipo: 'texto', max: 90 },
            telUsuario: { tipo: 'texto', max: 15 }
        }
    },
    artista: {
        rota: 'artistas',
        chave: ['idartista'],
        auto: true,
        campos: {
            nomeArtista: { tipo: 'texto', max: 45 },
            linkArtista: { tipo: 'link', max: 90 },
            linkImagemArtista: { tipo: 'link', max: 90 }
        }
    },
    album: {
        rota: 'albuns',
        chave: ['idAlbum'],
        auto: true,
        campos: {
            nomeAlbum: { tipo: 'texto', max: 45 },
            linkAlbum: { tipo: 'link', max: 90 },
            linkImagemAlbum: { tipo: 'link', max: 90 },
            generoAlbum: { tipo: 'texto', max: 45 },
            descricaoAlbum: { tipo: 'texto', max: 150 },
            artista_idartista: { tipo: 'ref' }
        }
    },
    avaliacao: {
        rota: 'avaliacoes',
        chave: ['idavaliacao'],
        auto: true,
        campos: {
            nota: { tipo: 'numero', min: 0, max: 10 },
            dataAvaliacao: { tipo: 'data' },
            comentario: { tipo: 'texto', max: 90 },
            usuario_idUsuario: { tipo: 'ref' },
            album_idAlbum: { tipo: 'ref' }
        }
    },
    lista: {
        rota: 'listas',
        chave: ['idlista'],
        auto: true,
        campos: {
            nomeLista: { tipo: 'texto', max: 45 },
            descricaoLista: { tipo: 'texto', max: 150 },
            usuario_idUsuario: { tipo: 'ref' }
        },
        cascata: [['lista_album', 'lista_idlista']]
    },
    lista_album: {
        rota: 'lista_album',
        chave: ['album_idAlbum', 'lista_idlista'],
        auto: false,
        campos: {
            album_idAlbum: { tipo: 'ref' },
            lista_idlista: { tipo: 'ref' }
        }
    }
};

function validar(tabela, corpo) {
    const valores = {};

    for (const campo of Object.keys(tabela.campos)) {
        const regra = tabela.campos[campo];
        const bruto = corpo[campo];

        if (bruto === undefined || bruto === null || String(bruto).trim() === '') {
            return { erro: campo + ' é obrigatório' };
        }

        if (regra.tipo === 'texto' || regra.tipo === 'link') {
            const texto = String(bruto).trim();
            if (texto.length > regra.max) {
                return { erro: campo + ' passa de ' + regra.max + ' caracteres' };
            }
            if (regra.tipo === 'link' && !/^https?:\/\//i.test(texto)) {
                return { erro: campo + ' deve começar com http:// ou https://' };
            }
            valores[campo] = texto;
        } else if (regra.tipo === 'data') {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(bruto) || isNaN(Date.parse(bruto))) {
                return { erro: campo + ' inválido' };
            }
            valores[campo] = bruto;
        } else if (regra.tipo === 'numero') {
            const numero = Number(bruto);
            if (!Number.isInteger(numero) || numero < regra.min || numero > regra.max) {
                return { erro: campo + ' deve ser um inteiro de ' + regra.min + ' a ' + regra.max };
            }
            valores[campo] = numero;
        } else {
            const numero = Number(bruto);
            if (!Number.isInteger(numero) || numero < 1) {
                return { erro: campo + ' inválido' };
            }
            valores[campo] = numero;
        }
    }

    return { valores };
}

function erroDoBanco(res, erro) {
    if (erro.errno === 1452) {
        return res.status(400).json({ erro: 'registro relacionado não existe' });
    }
    if (erro.errno === 1451) {
        const filha = /\(`[^`]+`\.`([^`]+)`/.exec(erro.sqlMessage || '');
        return res.status(409).json({ erro: 'registro em uso' + (filha ? ' em ' + filha[1] : '') });
    }
    if (erro.errno === 1062) {
        return res.status(409).json({ erro: 'registro já existe' });
    }
    console.error('erro no banco :(', erro);
    res.status(500).json({ erro: 'erro no banco' });
}

function criarCrud(nome) {
    const tabela = tabelas[nome];
    const caminho = '/api/' + tabela.rota;
    const caminhoChave = caminho + tabela.chave.map((campo) => '/:' + campo).join('');

    function condicao(params) {
        return {
            sql: tabela.chave.map(() => '?? = ?').join(' AND '),
            valores: tabela.chave.flatMap((campo) => [campo, params[campo]])
        };
    }

    app.get(caminho, async (req, res) => {
        try {
            const [registros] = await banco.query('SELECT * FROM ?? ORDER BY ??', [nome, tabela.chave[0]]);
            res.json(registros);
        } catch (erro) {
            erroDoBanco(res, erro);
        }
    });

    app.post(caminho, async (req, res) => {
        const resultado = validar(tabela, req.body || {});
        if (resultado.erro) return res.status(400).json(resultado);

        try {
            const [info] = await banco.query('INSERT INTO ?? (??) VALUES (?)', [
                nome,
                Object.keys(resultado.valores),
                Object.values(resultado.valores)
            ]);
            const registro = tabela.auto ? { [tabela.chave[0]]: info.insertId, ...resultado.valores } : resultado.valores;
            res.status(201).json(registro);
        } catch (erro) {
            erroDoBanco(res, erro);
        }
    });

    app.put(caminhoChave, async (req, res) => {
        const resultado = validar(tabela, req.body || {});
        if (resultado.erro) return res.status(400).json(resultado);

        const onde = condicao(req.params);

        try {
            const [info] = await banco.query('UPDATE ?? SET ? WHERE ' + onde.sql, [nome, resultado.valores, ...onde.valores]);
            if (info.affectedRows === 0) return res.status(404).json({ erro: 'não encontrado' });
            res.json(resultado.valores);
        } catch (erro) {
            erroDoBanco(res, erro);
        }
    });

    app.delete(caminhoChave, async (req, res) => {
        const onde = condicao(req.params);

        try {
            for (const [outra, coluna] of tabela.cascata || []) {
                await banco.query('DELETE FROM ?? WHERE ?? = ?', [outra, coluna, req.params[tabela.chave[0]]]);
            }
            const [info] = await banco.query('DELETE FROM ?? WHERE ' + onde.sql, [nome, ...onde.valores]);
            if (info.affectedRows === 0) return res.status(404).json({ erro: 'não encontrado' });
            res.json({ status: 'sucesso' });
        } catch (erro) {
            erroDoBanco(res, erro);
        }
    });
}

Object.keys(tabelas).forEach(criarCrud);

app.listen(3000, () => console.log('Olá!!!'));
