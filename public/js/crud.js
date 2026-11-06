function iniciarCrud(config) {
    const formulario = document.getElementById('formCrud');
    const corpoTabela = document.getElementById('corpoTabela');
    const botaoSalvar = document.getElementById('btSalvar');
    const botaoCancelar = document.getElementById('btCancelar');
    const aviso = document.getElementById('aviso');
    const selects = config.selects || {};
    const opcoes = {};
    let registros = [];
    let editando = null;

    function chaveDe(registro) {
        return config.chave.map((campo) => registro[campo]).join('/');
    }

    function carregarOpcoes() {
        return Promise.all(Object.keys(selects).map((campo) => {
            const { rota, valor, texto } = selects[campo];
            return fetch(rota)
                .then((resposta) => resposta.json())
                .then((itens) => {
                    const select = document.getElementById(campo);
                    select.innerHTML = '<option value="">selecione</option>';
                    opcoes[campo] = {};
                    itens.forEach((item) => {
                        const opcao = document.createElement('option');
                        opcao.value = item[valor];
                        opcao.textContent = item[texto];
                        select.appendChild(opcao);
                        opcoes[campo][item[valor]] = item[texto];
                    });
                });
        }));
    }

    function criarBotao(texto, acao) {
        const botao = document.createElement('button');
        botao.type = 'button';
        botao.className = 'btAcao';
        botao.textContent = texto;
        botao.addEventListener('click', acao);
        return botao;
    }

    function mostrarTabela() {
        corpoTabela.innerHTML = '';
        registros.forEach((registro) => {
            const linha = document.createElement('tr');
            config.colunas.forEach(([titulo, campo]) => {
                const celula = document.createElement('td');
                celula.textContent = opcoes[campo] ? opcoes[campo][registro[campo]] : registro[campo];
                linha.appendChild(celula);
            });
            const acoes = document.createElement('td');
            acoes.appendChild(criarBotao('editar', () => editar(registro)));
            acoes.appendChild(criarBotao('excluir', () => excluir(registro)));
            linha.appendChild(acoes);
            corpoTabela.appendChild(linha);
        });
    }

    function carregar() {
        return fetch(config.rota)
            .then((resposta) => resposta.json())
            .then((dados) => {
                registros = dados;
                mostrarTabela();
            });
    }

    function cancelar() {
        formulario.reset();
        editando = null;
        botaoSalvar.value = 'criar';
        botaoCancelar.hidden = true;
        aviso.textContent = '';
    }

    function editar(registro) {
        config.campos.forEach((campo) => {
            document.getElementById(campo).value = registro[campo];
        });
        editando = chaveDe(registro);
        botaoSalvar.value = 'salvar';
        botaoCancelar.hidden = false;
        aviso.textContent = '';
        formulario.scrollIntoView();
    }

    function excluir(registro) {
        if (!confirm('excluir este registro?')) return;

        fetch(config.rota + '/' + chaveDe(registro), { method: 'DELETE' })
            .then((resposta) => resposta.json().then((dados) => ({ ok: resposta.ok, dados })))
            .then(({ ok, dados }) => {
                if (!ok) {
                    aviso.textContent = dados.erro;
                    return;
                }
                if (editando === chaveDe(registro)) cancelar();
                aviso.textContent = '';
                carregar();
            })
            .catch(() => {
                aviso.textContent = 'erro de conexão';
            });
    }

    formulario.addEventListener('submit', (evento) => {
        evento.preventDefault();
        aviso.textContent = '';

        const corpo = {};
        config.campos.forEach((campo) => {
            corpo[campo] = document.getElementById(campo).value;
        });

        const url = editando ? config.rota + '/' + editando : config.rota;

        fetch(url, {
            method: editando ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(corpo)
        })
            .then((resposta) => resposta.json().then((dados) => ({ ok: resposta.ok, dados })))
            .then(({ ok, dados }) => {
                if (!ok) {
                    aviso.textContent = dados.erro;
                    return;
                }
                // novo registro: vai para a página configurada (edição continua na tela)
                if (!editando && config.redirecionarPara) {
                    window.location.href = config.redirecionarPara;
                    return;
                }
                cancelar();
                carregar();
            })
            .catch(() => {
                aviso.textContent = 'erro de conexão';
            });
    });

    botaoCancelar.addEventListener('click', cancelar);

    carregarOpcoes().then(carregar);
}
