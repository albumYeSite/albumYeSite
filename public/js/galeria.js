// mostra na home os cards do formCard (localStorage) e os álbuns do banco
const colecao = document.getElementById('colecao');
const galeria = JSON.parse(localStorage.getItem('galeria')) || [];

function criarCard(album) {
    return `
    <div class="superior">
      <img src="${album.imagemAlbum}" class="capaAlbum" alt="${album.descricaoImagem}">
      <h2 class="tituloAlbum">${album.nomeAlbum}</h2>
      <a href="${album.linkArtista}" class="artistaAlbum">${album.nomeArtista}</a>
      <h4 class="categoriasAlbum">${album.generoAlbum}</h4>
      <a href="${album.linkAlbum}" class="albumSpotify" target="_blank">
        <span class="buttonInner"><img class="logo" src="media/spotifyLogo.png" alt="spotify"></span>
      </a>
    </div>
    <div class="cardDescricao">
      <button class="mostrarDesc">+</button>
      <p class="descAlbum">${album.descricaoAlbum}</p>
    </div>`;
}

// cards criados pelo formCard
galeria.forEach((album) => colecao.insertAdjacentHTML('beforeend', criarCard(album)));

// álbuns criados pelo formAlbum (vêm do banco)
Promise.all([
    fetch('/api/albuns').then((r) => r.json()),
    fetch('/api/artistas').then((r) => r.json())
]).then(([albuns, artistas]) => {
    albuns.forEach((a) => {
        const artista = artistas.find((x) => x.idartista == a.artista_idartista) || {};
        colecao.insertAdjacentHTML('beforeend', criarCard({
            nomeAlbum: a.nomeAlbum,
            linkAlbum: a.linkAlbum,
            imagemAlbum: a.linkImagemAlbum,
            descricaoImagem: 'capa do álbum ' + a.nomeAlbum,
            generoAlbum: a.generoAlbum,
            descricaoAlbum: a.descricaoAlbum,
            nomeArtista: artista.nomeArtista || '',
            linkArtista: artista.linkArtista || '#'
        }));
    });
}).catch((erro) => console.log('erro ao carregar álbuns:', erro));
