iniciarCrud({
    rota: '/api/avaliacoes',
    chave: ['idavaliacao'],
    campos: ['nota', 'dataAvaliacao', 'comentario', 'usuario_idUsuario', 'album_idAlbum'],
    colunas: [
        ['usuário', 'usuario_idUsuario'],
        ['album', 'album_idAlbum'],
        ['nota', 'nota'],
        ['data', 'dataAvaliacao'],
        ['comentário', 'comentario']
    ],
    selects: {
        usuario_idUsuario: { rota: '/api/usuarios', valor: 'idUsuario', texto: 'nomeUsuario' },
        album_idAlbum: { rota: '/api/albuns', valor: 'idAlbum', texto: 'nomeAlbum' }
    }
});
