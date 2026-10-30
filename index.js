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

const tabelas = {
    usuario: {
        rota: 'usuarios',
        chave: ['idUsuario'],
        auto: true,
        campos: {
            nomeUsuario: { tipo: 'texto', max: 45 },
            emailUsuario: { tipo: 'texto', max: 90 },
            telUsuario: { tipo: 'texto', max: 15 }
        },
        usadoPor: [['avaliacao', 'usuario_idUsuario'], ['lista', 'usuario_idUsuario']]
    },
    artista: {
        rota: 'artistas',
        chave: ['idartista'],
        auto: true,
        campos: {
            nomeArtista: { tipo: 'texto', max: 45 },
            linkArtista: { tipo: 'texto', max: 90 },
            linkImagemArtista: { tipo: 'texto', max: 90 }
        },
        usadoPor: [['album', 'artista_idartista']]
    },
    album: {
        rota: 'albuns',
        chave: ['idAlbum'],
        auto: true,
        campos: {
            nomeAlbum: { tipo: 'texto', max: 45 },
            linkAlbum: { tipo: 'texto', max: 90 },
            linkImagemAlbum: { tipo: 'texto', max: 90 },
            generoAlbum: { tipo: 'texto', max: 45 },
            descricaoAlbum: { tipo: 'texto', max: 150 },
            artista_idartista: { tipo: 'ref', ref: 'artista' }
        },
        usadoPor: [['avaliacao', 'album_idAlbum'], ['lista_album', 'album_idAlbum']]
    },
    avaliacao: {
        rota: 'avaliacoes',
        chave: ['idavaliacao'],
        auto: true,
        campos: {
            nota: { tipo: 'numero', min: 0, max: 10 },
            dataAvaliacao: { tipo: 'data' },
            comentario: { tipo: 'texto', max: 90 },
            usuario_idUsuario: { tipo: 'ref', ref: 'usuario' },
            album_idAlbum: { tipo: 'ref', ref: 'album' }
        }
    },
    lista: {
        rota: 'listas',
        chave: ['idlista'],
        auto: true,
        campos: {
            nomeLista: { tipo: 'texto', max: 45 },
            descricaoLista: { tipo: 'texto', max: 150 },
            usuario_idUsuario: { tipo: 'ref', ref: 'usuario' }
        },
        cascata: [['lista_album', 'lista_idlista']]
    },
    lista_album: {
        rota: 'lista_album',
        chave: ['album_idAlbum', 'lista_idlista'],
        auto: false,
        campos: {
            album_idAlbum: { tipo: 'ref', ref: 'album' },
            lista_idlista: { tipo: 'ref', ref: 'lista' }
        }
    }
};

const dados = {};
const proximoId = {};

Object.keys(tabelas).forEach((nome) => {
    dados[nome] = [];
    proximoId[nome] = 1;
});

function validar(tabela, corpo) {
    const valores = {};

    for (const campo of Object.keys(tabela.campos)) {
        const regra = tabela.campos[campo];
        const bruto = corpo[campo];

        if (bruto === undefined || bruto === null || String(bruto).trim() === '') {
            return { erro: campo + ' é obrigatório' };
        }

        if (regra.tipo === 'texto') {
            const texto = String(bruto).trim();
            if (texto.length > regra.max) {
                return { erro: campo + ' passa de ' + regra.max + ' caracteres' };
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
            const chaveRef = tabelas[regra.ref].chave[0];
            if (!dados[regra.ref].some((registro) => registro[chaveRef] === numero)) {
                return { erro: campo + ' não existe' };
            }
            valores[campo] = numero;
        }
    }

    return { valores };
}

function criarCrud(nome) {
    const tabela = tabelas[nome];
    const caminho = '/api/' + tabela.rota;
    const caminhoChave = caminho + tabela.chave.map((campo) => '/:' + campo).join('');

    function achar(req) {
        return dados[nome].find((registro) => tabela.chave.every((campo) => String(registro[campo]) === req.params[campo]));
    }

    function repetido(valores, ignorar) {
        return dados[nome].some((registro) => registro !== ignorar && tabela.chave.every((campo) => registro[campo] === valores[campo]));
    }

    app.get(caminho, (req, res) => {
        res.json(dados[nome]);
    });

    app.post(caminho, (req, res) => {
        const resultado = validar(tabela, req.body || {});
        if (resultado.erro) return res.status(400).json(resultado);
        if (!tabela.auto && repetido(resultado.valores, null)) {
            return res.status(409).json({ erro: 'registro já existe' });
        }

        const registro = tabela.auto ? { [tabela.chave[0]]: proximoId[nome]++, ...resultado.valores } : resultado.valores;
        dados[nome].push(registro);
        res.status(201).json(registro);
    });

    app.put(caminhoChave, (req, res) => {
        const registro = achar(req);
        if (!registro) return res.status(404).json({ erro: 'não encontrado' });

        const resultado = validar(tabela, req.body || {});
        if (resultado.erro) return res.status(400).json(resultado);
        if (!tabela.auto && repetido(resultado.valores, registro)) {
            return res.status(409).json({ erro: 'registro já existe' });
        }

        Object.assign(registro, resultado.valores);
        res.json(registro);
    });

    app.delete(caminhoChave, (req, res) => {
        const registro = achar(req);
        if (!registro) return res.status(404).json({ erro: 'não encontrado' });

        const id = registro[tabela.chave[0]];
        const emUso = (tabela.usadoPor || []).find(([outra, coluna]) => dados[outra].some((r) => r[coluna] === id));
        if (emUso) return res.status(409).json({ erro: 'registro em uso em ' + emUso[0] });

        (tabela.cascata || []).forEach(([outra, coluna]) => {
            dados[outra] = dados[outra].filter((r) => r[coluna] !== id);
        });

        dados[nome].splice(dados[nome].indexOf(registro), 1);
        res.json({ status: 'sucesso' });
    });
}

Object.keys(tabelas).forEach(criarCrud);

app.listen(3000, () => console.log('Olá!!!'));
