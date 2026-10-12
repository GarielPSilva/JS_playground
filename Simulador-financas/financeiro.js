const formulario = document.getElementById("formulario");
const listaTransacoes = document.getElementById("transacoes");
const colunas = document.getElementById("colunas");
const labelMesAtual = document.getElementById("mes-atual");

const totalEntradas = document.getElementById("total-entradas");
const totalSaidas = document.getElementById("total-saidas");
const totalGeral = document.getElementById("total-geral");
const formInvestimento = document.getElementById("form-investimento");
const inputInvestimento = document.getElementById("investimento");
const investimentoMes = document.getElementById("investimento-mes");

const transacoes = [];
const investimentos = {};
const MESES_VISIVEIS = 6;

let mesReferencia = new Date();
mesReferencia = new Date(mesReferencia.getFullYear(), mesReferencia.getMonth(), 1);

function chaveMes(data) {
    return `${data.getFullYear()}-${data.getMonth()}`;
}

function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

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
    renderizarResumo();
    renderizarGrafico();
    formulario.reset();
});

formInvestimento.addEventListener('submit', function(event) {
    event.preventDefault();
    const valor = parseFloat(inputInvestimento.value);
    if (valor <= 0 || isNaN(valor)) {
        alert('Informe um valor de investimento válido.');
        return;
    }
    investimentos[chaveMes(mesReferencia)] = valor;
    inputInvestimento.value = '';
    renderizarGrafico();
});

function renderizarTransacoes() {
    listaTransacoes.innerHTML = '';
    transacoes.forEach(function(transacao) {
        const item = document.createElement('li');
        item.textContent = `${transacao.descricao} - ${formatarMoeda(transacao.valor)} - ${transacao.tipo} - ${transacao.categoria}`;
        listaTransacoes.appendChild(item);
    });
}

function renderizarResumo() {
    const entradas = transacoes
        .filter(function(transacao) {
            return transacao.tipo === 'entrada';
        })
        .reduce(function(soma, transacao) {
            return soma + transacao.valor;
        }, 0);

    const saidas = transacoes
        .filter(function(transacao) {
            return transacao.tipo === 'saida';
        })
        .reduce(function(soma, transacao) {
            return soma + transacao.valor;
        }, 0);

    totalEntradas.textContent = formatarMoeda(entradas);
    totalSaidas.textContent = formatarMoeda(saidas);
    totalGeral.textContent = formatarMoeda(entradas - saidas);
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
    investimentoMes.textContent = mesReferencia.toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
    });

    const meses = mesesDaJanela();
    const dados = meses.map(function(mes) {
        const chave = chaveMes(mes);
        const temInvestimento = investimentos[chave] !== undefined;
        return {
            valor: temInvestimento ? investimentos[chave] : totalInvestidoNoMes(mes.getFullYear(), mes.getMonth()),
            investimento: temInvestimento,
        };
    });
    const maiorTotal = Math.max.apply(null, dados.map(function(item) {
        return item.valor;
    }).concat([1]));

    colunas.innerHTML = '';
    meses.forEach(function(mes, indice) {
        const dado = dados[indice];

        const coluna = document.createElement('div');
        coluna.className = 'coluna';
        if (dado.investimento) {
            coluna.classList.add('investimento');
        }
        if (indice === meses.length - 1) {
            coluna.classList.add('destaque');
        }

        const trilha = document.createElement('div');
        trilha.className = 'trilha';

        const barra = document.createElement('div');
        barra.className = 'barra';
        barra.style.height = `${(dado.valor / maiorTotal) * 100}%`;

        const valor = document.createElement('span');
        valor.className = 'valor-coluna';
        valor.textContent = formatarMoeda(dado.valor);

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

renderizarResumo();
renderizarGrafico();
