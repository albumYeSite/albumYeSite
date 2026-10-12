// botão + e - da descrição, vale também para cards criados depois
document.addEventListener('click', (evento) => {
    const botao = evento.target.closest('.mostrarDesc');
    if (!botao) return;

    const texto = botao.parentElement.querySelector('.descAlbum');
    botao.innerText = texto.classList.toggle('visivel') ? '-' : '+';
});
