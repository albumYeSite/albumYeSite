iniciarCrud({
    rota: '/api/artistas',
    chave: ['idartista'],
    campos: ['nomeArtista', 'linkArtista', 'linkImagemArtista'],
    colunas: [
        ['nome', 'nomeArtista'],
        ['link', 'linkArtista'],
        ['imagem', 'linkImagemArtista']
    ]
});
