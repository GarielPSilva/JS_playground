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

const abas = document.querySelectorAll('.aba');
const paineis = document.querySelectorAll('.painel');

const modalInvestimento = document.getElementById('modal-investimento');
const modalMes = document.getElementById('modal-mes');
const modalValor = document.getElementById('modal-valor');
const modalSalvar = document.getElementById('modal-salvar');
const modalCancelar = document.getElementById('modal-cancelar');
const modalRemover = document.getElementById('modal-remover');

const metaObjetivo = document.getElementById('meta-objetivo');
const metaAporte = document.getElementById('meta-aporte');
const metaTaxa = document.getElementById('meta-taxa');
const metaIncluirInvestido = document.getElementById('meta-incluir-investido');
const metaTotalInvestido = document.getElementById('meta-total-investido');
const metaPrazo = document.getElementById('meta-prazo');
const metaDetalhe = document.getElementById('meta-detalhe');
const metaResumoInvestido = document.getElementById('meta-resumo-investido');
const metaResumoFalta = document.getElementById('meta-resumo-falta');
const metaResumoRendimento = document.getElementById('meta-resumo-rendimento');
const metaResumoRendimentoLinha = document.getElementById('meta-resumo-rendimento-linha');

const STORAGE_TRANSACOES = 'financeiro.transacoes';
const STORAGE_INVESTIMENTOS = 'financeiro.investimentos';
const STORAGE_META = 'financeiro.meta';
const MESES_VISIVEIS = 6;

const transacoes = [];
const investimentos = {};
const configMeta = {
    objetivo: 0,
    aporte: 0,
    taxa: 0,
    incluirInvestido: true,
};

let mesEmEdicao = null;
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

function formatarPorcentagem(valor) {
    return valor.toLocaleString('pt-BR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    });
}

function totalInvestido() {
    return Object.keys(investimentos).reduce(function(total, chave) {
        const valor = Number(investimentos[chave]);
        return total + (isNaN(valor) ? 0 : valor);
    }, 0);
}

function investimentoMedioMensal() {
    const chaves = Object.keys(investimentos);
    if (chaves.length === 0) {
        return 0;
    }
    return totalInvestido() / chaves.length;
}

function formatarPrazo(meses) {
    if (meses <= 0) {
        return 'Meta atingida!';
    }
    const anos = Math.floor(meses / 12);
    const mesesRestantes = meses % 12;
    const partes = [];

    if (anos > 0) {
        partes.push(anos === 1 ? '1 ano' : `${anos} anos`);
    }
    if (mesesRestantes > 0) {
        partes.push(mesesRestantes === 1 ? '1 mês' : `${mesesRestantes} meses`);
    }

    return partes.join(' e ');
}

function calcularMeses(objetivo, aporte, taxa, valorInicial) {
    const falta = objetivo - valorInicial;
    if (falta <= 0) {
        return 0;
    }
    if (taxa <= 0) {
        return Math.ceil(falta / aporte);
    }

    const fator = (objetivo * taxa + aporte) / (valorInicial * taxa + aporte);
    return Math.max(0, Math.ceil(Math.log(fator) / Math.log(1 + taxa)));
}

function renderizarMeta() {
    const total = totalInvestido();
    const objetivo = parseFloat(metaObjetivo.value) || 0;
    const aporte = parseFloat(metaAporte.value) || 0;
    const taxa = Math.max(parseFloat(metaTaxa.value) || 0, 0) / 100;
    const valorInicial = metaIncluirInvestido.checked ? total : 0;

    const sugestao = investimentos[chaveMes(mesReferencia)] !== undefined
        ? investimentos[chaveMes(mesReferencia)]
        : investimentoMedioMensal();

    metaTotalInvestido.textContent = formatarMoeda(total);
    metaResumoInvestido.textContent = formatarMoeda(total);
    metaAporte.placeholder = sugestao > 0 ? sugestao.toFixed(2) : '0,00';

    const falta = Math.max(objetivo - valorInicial, 0);
    metaResumoFalta.textContent = formatarMoeda(falta);
    metaResumoRendimentoLinha.hidden = true;

    if (objetivo <= 0 || aporte <= 0) {
        metaPrazo.textContent = '\u2014';
        metaDetalhe.textContent = 'Informe uma meta e um investimento mensal para ver o prazo.';
        return;
    }

    if (falta <= 0) {
        metaPrazo.textContent = 'Meta atingida!';
        metaDetalhe.textContent = 'Você já investiu o suficiente para alcançar esse objetivo.';
        return;
    }

    const meses = calcularMeses(objetivo, aporte, taxa, valorInicial);
    const tempo = formatarPrazo(meses);
    metaPrazo.textContent = tempo;

    let mensagem = `Aproximadamente ${meses} ${meses === 1 ? 'mês' : 'meses'} investindo ${formatarMoeda(aporte)} por mês.`;
    if (taxa > 0) {
        const montanteFinal = valorInicial * Math.pow(1 + taxa, meses)
            + aporte * ((Math.pow(1 + taxa, meses) - 1) / taxa);
        const totalAportado = valorInicial + aporte * meses;
        const rendimento = Math.max(montanteFinal - totalAportado, 0);

        mensagem += ` Considerando ${formatarPorcentagem(taxa * 100)}% de rendimento ao mês.`;
        metaResumoRendimento.textContent = formatarMoeda(rendimento);
        metaResumoRendimentoLinha.hidden = false;
    }

    metaDetalhe.textContent = mensagem;
}

function inicializarMeta() {
    metaObjetivo.value = configMeta.objetivo > 0 ? configMeta.objetivo : '';
    metaAporte.value = configMeta.aporte > 0 ? configMeta.aporte : '';
    metaTaxa.value = configMeta.taxa > 0 ? configMeta.taxa : '';
    metaIncluirInvestido.checked = configMeta.incluirInvestido;

    if (metaAporte.value === '') {
        const sugestao = investimentos[chaveMes(mesReferencia)] !== undefined
            ? investimentos[chaveMes(mesReferencia)]
            : investimentoMedioMensal();
        if (sugestao > 0) {
            metaAporte.value = sugestao.toFixed(2);
            configMeta.aporte = sugestao;
        }
    }
}

function atualizarConfigMeta() {
    configMeta.objetivo = parseFloat(metaObjetivo.value) || 0;
    configMeta.aporte = parseFloat(metaAporte.value) || 0;
    configMeta.taxa = parseFloat(metaTaxa.value) || 0;
    configMeta.incluirInvestido = metaIncluirInvestido.checked;
}

function abrirEdicaoInvestimento(mes) {
    mesEmEdicao = chaveMes(mes);
    const valorAtual = investimentos[mesEmEdicao];
    const mesFormatado = mes.toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
    });

    modalMes.textContent = mesFormatado;
    modalValor.value = valorAtual !== undefined ? valorAtual : '';
    modalRemover.hidden = valorAtual === undefined;
    modalInvestimento.hidden = false;
    modalValor.focus();
    modalValor.select();
}

function fecharModal() {
    modalInvestimento.hidden = true;
    mesEmEdicao = null;
}

function salvarEdicaoInvestimento() {
    if (!mesEmEdicao) {
        return;
    }
    const valor = parseFloat(modalValor.value);
    if (isNaN(valor) || valor <= 0) {
        alert('Informe um valor de investimento válido.');
        return;
    }

    investimentos[mesEmEdicao] = valor;
    salvarDados();
    fecharModal();
    renderizarTudo();
}

function removerInvestimento() {
    if (!mesEmEdicao) {
        return;
    }

    delete investimentos[mesEmEdicao];
    salvarDados();
    fecharModal();
    renderizarTudo();
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

    try {
        const salvo = JSON.parse(localStorage.getItem(STORAGE_META));
        if (salvo && typeof salvo === 'object') {
            configMeta.objetivo = Number(salvo.objetivo) || 0;
            configMeta.aporte = Number(salvo.aporte) || 0;
            configMeta.taxa = Number(salvo.taxa) || 0;
            configMeta.incluirInvestido = salvo.incluirInvestido !== false;
        }
    } catch (erro) {
        console.warn('Não foi possível carregar a meta salva.', erro);
    }
}

function salvarDados() {
    localStorage.setItem(STORAGE_TRANSACOES, JSON.stringify(transacoes));
    localStorage.setItem(STORAGE_INVESTIMENTOS, JSON.stringify(investimentos));
    localStorage.setItem(STORAGE_META, JSON.stringify(configMeta));
}

function renderizarTudo() {
    renderizarTransacoes();
    renderizarResumo();
    renderizarGrafico();
    renderizarMeta();
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
    renderizarTudo();
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

    const investimentoAtual = investimentos[chaveMes(mesReferencia)];
    inputInvestimento.placeholder = investimentoAtual !== undefined
        ? formatarMoeda(investimentoAtual)
        : '0,00';

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

        const botaoEditar = document.createElement('button');
        botaoEditar.type = 'button';
        botaoEditar.className = 'editar-coluna';
        botaoEditar.textContent = dado.investimento ? 'Editar' : 'Definir';
        botaoEditar.setAttribute(
            'aria-label',
            `${dado.investimento ? 'Editar' : 'Definir'} investimento de ${mes.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`
        );
        botaoEditar.addEventListener('click', function() {
            abrirEdicaoInvestimento(mes);
        });
        coluna.appendChild(botaoEditar);

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

abas.forEach(function(aba) {
    aba.addEventListener('click', function() {
        const destino = aba.dataset.aba;

        abas.forEach(function(outraAba) {
            const ativa = outraAba === aba;
            outraAba.classList.toggle('ativa', ativa);
            outraAba.setAttribute('aria-selected', String(ativa));
        });

        paineis.forEach(function(painel) {
            painel.classList.toggle('ativo', painel.id === destino);
        });

        if (destino === 'meta') {
            renderizarMeta();
        }
    });
});

[metaObjetivo, metaAporte, metaTaxa].forEach(function(campo) {
    campo.addEventListener('input', function() {
        atualizarConfigMeta();
        salvarDados();
        renderizarMeta();
    });
});

metaIncluirInvestido.addEventListener('change', function() {
    atualizarConfigMeta();
    salvarDados();
    renderizarMeta();
});

modalSalvar.addEventListener('click', salvarEdicaoInvestimento);
modalRemover.addEventListener('click', removerInvestimento);
modalCancelar.addEventListener('click', fecharModal);

modalValor.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        salvarEdicaoInvestimento();
    }
});

modalInvestimento.addEventListener('click', function(event) {
    if (event.target === modalInvestimento) {
        fecharModal();
    }
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && !modalInvestimento.hidden) {
        fecharModal();
    }
});

carregarDados();
inicializarMeta();
renderizarTudo();
