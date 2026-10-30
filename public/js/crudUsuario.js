iniciarCrud({
    rota: '/api/usuarios',
    chave: ['idUsuario'],
    campos: ['nomeUsuario', 'emailUsuario', 'telUsuario'],
    colunas: [
        ['nome', 'nomeUsuario'],
        ['email', 'emailUsuario'],
        ['telefone', 'telUsuario']
    ]
});
