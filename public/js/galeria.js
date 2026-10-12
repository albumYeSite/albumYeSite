// cria cards pelo formulário e guarda no localStorage
const formulario = document.getElementById('formCard');
const colecao = document.getElementById('colecao');
const galeria = JSON.parse(localStorage.getItem('galeria')) || [];

// ids dos campos, na mesma ordem do construtor de ObraDeArte
const campos = ['nomeAlbum', 'linkAlbum', 'nomeArtista', 'linkArtista', 'generoAlbum', 'descricaoAlbum', 'imagemAlbum', 'descricaoImagem'];

// monta o html de um card
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

// mostra os cards já salvos
galeria.forEach((album) => colecao.insertAdjacentHTML('beforeend', criarCard(album)));

// envia o álbum novo para o servidor e volta ao index
formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();

    const novaObra = new ObraDeArte(...campos.map((id) => document.getElementById(id).value));

    fetch('/api/lista', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novaObra)
    })
        .then(() => {
            window.location.href = 'index.html';
        });
});