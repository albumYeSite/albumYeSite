// aplica o tema salvo e troca ao clicar no botão
const corpo = document.body;

if (localStorage.getItem('meuTema') === 'escuro') corpo.classList.add('bTheme');

document.getElementById('btnThemeId').addEventListener('click', () => {
    const escuro = corpo.classList.toggle('bTheme');
    localStorage.setItem('meuTema', escuro ? 'escuro' : 'claro');
});
