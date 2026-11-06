// cadastra o card e volta para a home
const formulario = document.getElementById('formCard');
const campos = ['nomeAlbum', 'linkAlbum', 'nomeArtista', 'linkArtista', 'generoAlbum', 'descricaoAlbum', 'imagemAlbum', 'descricaoImagem'];

formulario.addEventListener('submit', (evento) => {
    evento.preventDefault();

    const novaObra = new ObraDeArte(...campos.map((id) => document.getElementById(id).value));

    const galeriaAtual = JSON.parse(localStorage.getItem('galeria')) || [];
    galeriaAtual.push(novaObra);
    localStorage.setItem('galeria', JSON.stringify(galeriaAtual));

    fetch('/api/lista', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novaObra)
    }).finally(() => {
        window.location.href = 'home.html';
    });
});
