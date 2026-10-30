iniciarCrud({
    rota: '/api/listas',
    chave: ['idlista'],
    campos: ['nomeLista', 'descricaoLista', 'usuario_idUsuario'],
    colunas: [
        ['nome', 'nomeLista'],
        ['usuário', 'usuario_idUsuario'],
        ['descrição', 'descricaoLista']
    ],
    selects: {
        usuario_idUsuario: {rota: '/api/usuarios', valor: 'idUsuario', texto: 'nomeUsuario' }
    }
});
