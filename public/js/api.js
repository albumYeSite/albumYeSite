// get: busca a lista no servidor
fetch('/api/lista')
    .then((resposta) => resposta.json())
    .then((dados) => console.log('get:', dados.lista))
    .catch((erro) => console.log('erro no get:', erro));

// post: envia um item novo para a lista
fetch('/api/lista', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ item: 'Novo item adicionado' })
})
    .then((resposta) => resposta.json())
    .then((dados) => console.log('post:', dados))
    .catch((erro) => console.log('erro no post:', erro));
