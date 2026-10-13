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

const STORAGE_TRANSACOES = 'financeiro.transacoes';
const STORAGE_INVESTIMENTOS = 'financeiro.investimentos';
const MESES_VISIVEIS = 6;

const transacoes = [];
const investimentos = {};

let mesReferencia = new Date();
mesReferencia = new Date(mesReferencia.getFullYear(), mesReferencia.getMonth(), 1);

function chaveMes(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    return `${ano}-${mes}`;
}

function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function carregarDados() {
    try {
        const salvas = JSON.parse(localStorage.getItem(STORAGE_TRANSACOES));
        if (Array.isArray(salvas)) {
            transacoes.push.apply(transacoes, salvas);
        }
    } catch (erro) {
        console.warn('Não foi possível carregar as transações salvas.', erro);
    }

    try {
        const salvo = JSON.parse(localStorage.getItem(STORAGE_INVESTIMENTOS));
        if (salvo && typeof salvo === 'object') {
            Object.assign(investimentos, salvo);
        }
    } catch (erro) {
        console.warn('Não foi possível carregar os investimentos salvos.', erro);
    }
}

function salvarDados() {
    localStorage.setItem(STORAGE_TRANSACOES, JSON.stringify(transacoes));
    localStorage.setItem(STORAGE_INVESTIMENTOS, JSON.stringify(investimentos));
}

function renderizarTudo() {
    renderizarTransacoes();
    renderizarResumo();
    renderizarGrafico();
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
        mes: chaveMes(mesReferencia),
    };

    transacoes.push(transacao);
    salvarDados();
    renderizarTudo();
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
    salvarDados();
    renderizarGrafico();
});

function renderizarTransacoes() {
    const chave = chaveMes(mesReferencia);
    const doMes = transacoes.filter(function(transacao) {
        return transacao.mes === chave;
    });

    listaTransacoes.innerHTML = '';

    if (doMes.length === 0) {
        const item = document.createElement('li');
        item.className = 'vazio';
        item.textContent = 'Nenhuma transação neste mês.';
        listaTransacoes.appendChild(item);
        return;
    }

    doMes.forEach(function(transacao) {
        const item = document.createElement('li');
        item.textContent = `${transacao.descricao} - ${formatarMoeda(transacao.valor)} - ${transacao.tipo} - ${transacao.categoria}`;
        listaTransacoes.appendChild(item);
    });
}

function renderizarResumo() {
    const chave = chaveMes(mesReferencia);
    const doMes = transacoes.filter(function(transacao) {
        return transacao.mes === chave;
    });

    const entradas = doMes
        .filter(function(transacao) {
            return transacao.tipo === 'entrada';
        })
        .reduce(function(soma, transacao) {
            return soma + transacao.valor;
        }, 0);

    const saidas = doMes
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

function renderizarGrafico() {
    const mesFormatado = mesReferencia.toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
    });
    labelMesAtual.textContent = mesFormatado;
    investimentoMes.textContent = mesFormatado;

    const meses = mesesDaJanela();
    const dados = meses.map(function(mes) {
        const chave = chaveMes(mes);
        const temInvestimento = investimentos[chave] !== undefined;
        return {
            valor: temInvestimento ? investimentos[chave] : 0,
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
    renderizarTudo();
});

document.getElementById('mes-posterior').addEventListener('click', function() {
    mesReferencia = new Date(mesReferencia.getFullYear(), mesReferencia.getMonth() + 1, 1);
    renderizarTudo();
});

carregarDados();
renderizarTudo();
