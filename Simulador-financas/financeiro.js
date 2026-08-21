const formulario = document.getElementById("formulario");
formulario.addEventListener('submit', function(event) {
    event.preventDefault();
    const descricao = document.getElementById("descricao").value;
    if (descricao === '') {
        alert('Para continuar, preencha o campo de descrição.');
        return;
    }
    const valor = parseFloat(document.getElementById("valor").value);
    if (valor <= 0 || isNaN(valor)) {
        alert('Para continuar, preencha o campo de valor com um número válido.');
        return;
    }
    const tipo = document.getElementById("tipo").value;
    const categoria = document.getElementById("categoria").value; })

    const transacao = {
        descricao: descricao,
        valor: valor,
        tipo: tipo,
        categoria: categoria
    }

    const trasacoes = []