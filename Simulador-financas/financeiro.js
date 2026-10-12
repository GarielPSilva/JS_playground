const formulario = document.getElementById("formulario");
const listaTransacoes = document.getElementById("transacoes");
const colunas = document.getElementById("colunas");
const labelMesAtual = document.getElementById("mes-atual");

const transacoes = [];
const MESES_VISIVEIS = 6;

let mesReferencia = new Date();
mesReferencia = new Date(mesReferencia.getFullYear(), mesReferencia.getMonth(), 1);

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
    const categoria = document.getElementById("categoria").value;

    const transacao = {
        descricao: descricao,
        valor: valor,
        tipo: tipo,
        categoria: categoria,
        data: new Date(),
    };

    transacoes.push(transacao);
    renderizarTransacoes();
    renderizarGrafico();
    formulario.reset();
});

function renderizarTransacoes() {
    listaTransacoes.innerHTML = '';
    transacoes.forEach(function(transacao) {
        const item = document.createElement('li');
        item.textContent = `${transacao.descricao} - R$ ${transacao.valor.toFixed(2)} - ${transacao.tipo} - ${transacao.categoria}`;
        listaTransacoes.appendChild(item);
    });
}

function mesesDaJanela() {
    const meses = [];
    for (let i = MESES_VISIVEIS - 1; i >= 0; i--) {
        meses.push(new Date(mesReferencia.getFullYear(), mesReferencia.getMonth() - i, 1));
    }
    return meses;
}

function totalInvestidoNoMes(ano, mes) {
    return transacoes
        .filter(function(transacao) {
            return transacao.tipo === 'entrada'
                && transacao.data.getFullYear() === ano
                && transacao.data.getMonth() === mes;
        })
        .reduce(function(soma, transacao) {
            return soma + transacao.valor;
        }, 0);
}

function renderizarGrafico() {
    labelMesAtual.textContent = mesReferencia.toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
    });

    const meses = mesesDaJanela();
    const totais = meses.map(function(mes) {
        return totalInvestidoNoMes(mes.getFullYear(), mes.getMonth());
    });
    const maiorTotal = Math.max.apply(null, totais.concat([1]));

    colunas.innerHTML = '';
    meses.forEach(function(mes, indice) {
        const total = totais[indice];

        const coluna = document.createElement('div');
        coluna.className = 'coluna';
        if (indice === meses.length - 1) {
            coluna.classList.add('destaque');
        }

        const trilha = document.createElement('div');
        trilha.className = 'trilha';

        const barra = document.createElement('div');
        barra.className = 'barra';
        barra.style.height = `${(total / maiorTotal) * 100}%`;

        const valor = document.createElement('span');
        valor.className = 'valor-coluna';
        valor.textContent = `R$ ${total.toFixed(2)}`;

        barra.appendChild(valor);
        trilha.appendChild(barra);
        coluna.appendChild(trilha);

        const rotulo = document.createElement('span');
        rotulo.className = 'rotulo-coluna';
        rotulo.textContent = mes.toLocaleDateString('pt-BR', { month: 'short' });
        coluna.appendChild(rotulo);

        colunas.appendChild(coluna);
    });
}

document.getElementById('mes-anterior').addEventListener('click', function() {
    mesReferencia = new Date(mesReferencia.getFullYear(), mesReferencia.getMonth() - 1, 1);
    renderizarGrafico();
});

document.getElementById('mes-posterior').addEventListener('click', function() {
    mesReferencia = new Date(mesReferencia.getFullYear(), mesReferencia.getMonth() + 1, 1);
    renderizarGrafico();
});

renderizarGrafico();
