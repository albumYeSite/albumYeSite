iniciarCrud({
    rota: '/api/albuns',
    redirecionarPara: 'home.html',
    chave: ['idAlbum'],
    campos: ['nomeAlbum', 'linkAlbum', 'linkImagemAlbum', 'generoAlbum', 'descricaoAlbum', 'artista_idartista'],
    colunas: [
        ['nome', 'nomeAlbum'],
        ['artista', 'artista_idartista'],
        ['gênero', 'generoAlbum'],
        ['descrição', 'descricaoAlbum']
    ],
    selects: {
        artista_idartista: { rota: '/api/artistas', valor: 'idartista', texto: 'nomeArtista' }
    }
});
