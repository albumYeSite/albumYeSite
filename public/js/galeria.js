const colecao = document.getElementById('colecao');

function criarCard(album, artista) {
    const card = document.createElement('div');
    card.className = 'container';
    card.innerHTML = `
    <div class="superior">
      <img class="capaAlbum">
      <div class="cardPrincipal">
        <h2 class="tituloAlbum"></h2>
        <a class="artistaAlbum" target="_blank"></a>
        <h4 class="categoriasAlbum"></h4>
        <a class="albumSpotify" target="_blank">
          <span class="buttonInner"><img class="logo" src="media/spotifyLogo.png" alt="spotify"></span>
        </a>
      </div>
    </div>
    <div class="cardDescricao">
      <button class="mostrarDesc">+</button>
      <p class="descAlbum"></p>
    </div>`;

    const capa = card.querySelector('.capaAlbum');
    capa.src = album.linkImagemAlbum;
    capa.alt = 'capa do album ' + album.nomeAlbum;
    card.querySelector('.tituloAlbum').textContent = album.nomeAlbum;
    const linkArtista = card.querySelector('.artistaAlbum');
    linkArtista.textContent = artista.nomeArtista || '';
    linkArtista.href = artista.linkArtista || '#';
    card.querySelector('.categoriasAlbum').textContent = album.generoAlbum;
    card.querySelector('.albumSpotify').href = album.linkAlbum;
    card.querySelector('.descAlbum').textContent = album.descricaoAlbum;
    return card;
}

Promise.all([
    fetch('/api/albuns').then((resposta) => resposta.json()),
    fetch('/api/artistas').then((resposta) => resposta.json())
]).then(([albuns, artistas]) => {
    if (albuns.length === 0) {
        colecao.textContent = 'nenhum album cadastrado ainda';
        return;
    }
    albuns.forEach((album) => {
        const artista = artistas.find((item) => item.idartista === album.artista_idartista) || {};
        colecao.appendChild(criarCard(album, artista));
    });
}).catch((erro) => console.log('erro ao carregar albuns:', erro));
