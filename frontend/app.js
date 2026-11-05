// ==========================================================
// CONFIGURAÇÃO DA API
// ==========================================================
// Quando publicar sua API C# no Render/Railway, troque a URL abaixo:
const API_BASE_URL = "http://localhost:5000/api/quiz";
const MODO_DEMO_LOCAL = true; // Deixe true para testar o Front sozinho sem a API estar ligada

const questions = [
    // 14 TDAH
    { id: 1, cat: 'TDAH', text: 'Com que frequência você comete erros por descuido quando precisa trabalhar em um projeto chato ou difícil?' },
    { id: 2, cat: 'TDAH', text: 'Com que frequência você tem dificuldade para manter a atenção quando está fazendo um trabalho repetitivo ou monótono?' },
    { id: 3, cat: 'TDAH', text: 'Com que frequência você tem dificuldade para se concentrar no que as pessoas dizem, mesmo quando elas estão falando diretamente com você?' },
    { id: 4, cat: 'TDAH', text: 'Com que frequência você deixa um projeto pela metade depois de já ter feito as partes mais desafiadoras ou interessantes?' },
    { id: 5, cat: 'TDAH', text: 'Com que frequência você tem dificuldade para colocar as coisas em ordem quando precisa fazer uma tarefa que exige organização?' },
    { id: 6, cat: 'TDAH', text: 'Quando você precisa fazer algo que exige muito esforço mental, com que frequência você evita ou adia o início?' },
    { id: 7, cat: 'TDAH', text: 'Com que frequência você perde ou esquece onde colocou objetos necessários do dia a dia (chaves, carteira, celular)?' },
    { id: 8, cat: 'TDAH', text: 'Com que frequência você se distrai facilmente com barulhos, conversas ou movimentações ao seu redor?' },
    { id: 9, cat: 'TDAH', text: 'Com que frequência você tem dificuldade para lembrar de compromissos, prazos ou obrigações?' },
    { id: 10, cat: 'TDAH', text: 'Com que frequência você fica se mexendo na cadeira ou balançando as mãos e os pés quando precisa ficar sentado por muito tempo?' },
    { id: 11, cat: 'TDAH', text: 'Com que frequência você se sente excessivamente ativo e compelido a fazer coisas, como se estivesse "ligado a um motor"?' },
    { id: 12, cat: 'TDAH', text: 'Com que frequência você tem dificuldade para relaxar e desligar a mente quando tem tempo livre para si mesmo?' },
    { id: 13, cat: 'TDAH', text: 'Com que frequência você termina as frases das pessoas antes delas ou interrompe conversas sem perceber?' },
    { id: 14, cat: 'TDAH', text: 'Com que frequência você sente irritação ou impaciência extrema ao esperar em filas ou aguardar processos lentos?' },
    // 6 QI
    { id: 15, cat: 'QI', text: 'Qual número completa logicamente a sequência: 2, 6, 12, 20, 30, ...?', options: [{t: '38', p: 0}, {t: '40', p: 0}, {t: '42', p: 10}, {t: '44', p: 0}] },
    { id: 16, cat: 'QI', text: 'Se todos os Bloops são Razzies e todos os Razzies são Lazzies, então todos os Bloops são definitivamente Lazzies?', options: [{t: 'Verdadeiro', p: 10}, {t: 'Falso', p: 0}, {t: 'Impossível determinar', p: 0}] },
    { id: 17, cat: 'QI', text: 'Água está para Gelo assim como Leite está para:', options: [{t: 'Vaca', p: 0}, {t: 'Queijo', p: 10}, {t: 'Café', p: 0}, {t: 'Líquido', p: 0}] },
    { id: 18, cat: 'QI', text: 'Uma corrida tem 5 corredores. Se você ultrapassar o corredor que está em 2º lugar, em qual posição você passa a estar?', options: [{t: '1º lugar', p: 0}, {t: '2º lugar', p: 10}, {t: '3º lugar', p: 0}] },
    { id: 19, cat: 'QI', text: 'Um bastão e uma bola custam juntos R$ 1,10. O bastão custa R$ 1,00 a mais que a bola. Quanto custa a bola?', options: [{t: 'R$ 0,10', p: 0}, {t: 'R$ 0,05', p: 10}, {t: 'R$ 0,15', p: 0}, {t: 'R$ 0,01', p: 0}] },
    { id: 20, cat: 'QI', text: 'Se 5 máquinas levam 5 minutos para fazer 5 peças, quanto tempo levariam 100 máquinas para fazer 100 peças?', options: [{t: '100 minutos', p: 0}, {t: '50 minutos', p: 0}, {t: '5 minutos', p: 10}, {t: '20 minutos', p: 0}] }
];

const tdahDefaultOptions = [
    { t: 'Nunca', p: 0 },
    { t: 'Raramente', p: 1 },
    { t: 'Às vezes', p: 2 },
    { t: 'Frequentemente', p: 3 },
    { t: 'Muito frequentemente', p: 4 }
];

let currentIdx = 0;
let scoreTDAH = 0;
let scoreQI = 85; // Base 85 + até 60 pontos = 145 máx
let sessionToken = null;
let pollingInterval = null;

function startQuiz() {
    document.getElementById('screen-start').classList.add('d-none');
    document.getElementById('screen-quiz').classList.remove('d-none');
    renderQuestion();
}

function renderQuestion() {
    const q = questions[currentIdx];
    const total = questions.length;
    
    document.getElementById('question-counter').innerText = `Pergunta ${currentIdx + 1} de ${total}`;
    document.getElementById('quiz-progress').style.width = `${((currentIdx + 1) / total) * 100}%`;
    document.getElementById('question-category').innerText = q.cat === 'TDAH' ? 'Padrão Comportamental' : 'Raciocínio Lógico & Reflexo';
    document.getElementById('question-text').innerText = q.text;

    const opts = q.cat === 'TDAH' ? tdahDefaultOptions : q.options;
    const container = document.getElementById('options-container');
    container.innerHTML = '';

    opts.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerText = opt.t;
        btn.onclick = () => selectOption(q.cat, opt.p);
        container.appendChild(btn);
    });
}

function selectOption(category, points) {
    if (category === 'TDAH') {
        scoreTDAH += points;
    } else {
        scoreQI += points;
    }

    currentIdx++;
    if (currentIdx < questions.length) {
        renderQuestion();
    } else {
        finishQuiz();
    }
}

function finishQuiz() {
    document.getElementById('screen-quiz').classList.add('d-none');
    document.getElementById('screen-loading').classList.remove('d-none');

    const bar = document.getElementById('loading-bar');
    const title = document.getElementById('loading-title');
    
    setTimeout(() => { bar.style.width = '45%'; title.innerText = 'Calculando índice de oscilação atencional...'; }, 800);
    setTimeout(() => { bar.style.width = '80%'; title.innerText = 'Avaliando reflexo cognitivo e QI lógico...'; }, 1800);
    setTimeout(() => { bar.style.width = '100%'; title.innerText = 'Gerando seu relatório personalizado...'; }, 2600);
    setTimeout(() => { criarSessaoEPaywall(); }, 3200);
}

async function criarSessaoEPaywall() {
    document.getElementById('screen-loading').classList.add('d-none');
    document.getElementById('screen-result').classList.remove('d-none');

    try {
        const response = await fetch(`${API_BASE_URL}/gerar-pix`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ scoreTdah: scoreTDAH, scoreQi: scoreQI })
        });

        if (!response.ok) throw new Error('API Offline');
        const data = await response.json();

        sessionToken = data.tokenSessao;
        document.getElementById('res-titulo').innerText = data.tituloPerfil;
        document.getElementById('res-resumo').innerText = data.resumoCurto;
        document.getElementById('pix-copia-cola').value = data.pixCopiaCola;

        if (data.qrCodeBase64) {
            const img = document.getElementById('pix-qr-img');
            img.src = `data:image/png;base64,${data.qrCodeBase64}`;
            img.classList.remove('d-none');
        }

        iniciarVerificacaoPagamento();

    } catch (err) {
        // Fallback automático caso você esteja testando só o HTML sem o C# rodando
        console.warn("Rodando em modo de demonstração local (API desconectada).");
        const demo = getLocalFallbackData(scoreTDAH);
        document.getElementById('res-titulo').innerText = demo.titulo;
        document.getElementById('res-resumo').innerText = demo.resumo;
        document.getElementById('pix-copia-cola').value = "00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-42661417400052040000530398654046.995802BR5915NEUROFOCUS6009SAOPAULO62070503***6304ABCD";
        if (MODO_DEMO_LOCAL) {
            document.getElementById('btn-simular').classList.remove('d-none');
        }
    }
}

function iniciarVerificacaoPagamento() {
    pollingInterval = setInterval(async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/status/${sessionToken}`);
            const data = await res.json();
            if (data.statusPagamento === 'APROVADO') {
                clearInterval(pollingInterval);
                liberarTelaComDados(data.scoreTdah, data.scoreQi, data.laudoCompleto);
            }
        } catch (e) {
            console.error("Erro ao consultar status:", e);
        }
    }, 3000);
}

function liberarTelaComDados(tdah, qi, laudo) {
    document.getElementById('paywall-box').classList.add('d-none');
    const report = document.getElementById('locked-report');
    report.classList.remove('blurred-content');
    report.classList.add('unlocked-content');

    document.getElementById('res-score-tdah').innerText = `${tdah} / 56`;
    document.getElementById('res-score-qi').innerText = `${qi} pts`;
    document.getElementById('res-laudo-completo').innerText = laudo;
}

function unlockReportDemo() {
    const demo = getLocalFallbackData(scoreTDAH);
    liberarTelaComDados(scoreTDAH, scoreQI, demo.laudo);
}

function getLocalFallbackData(tdah) {
    if (tdah <= 18) {
        return {
            titulo: 'Foco Linear e Estabilidade Cognitiva',
            resumo: 'Detectamos um padrão de atenção estável com boa filtragem de estímulos externos.',
            laudo: 'Análise Detalhada: Sua pontuação (entre 0 e 18 pontos na escala comportamental) indica baixo indício de desatenção crônica ou hiperatividade. Seu cérebro processa tarefas sequenciais com eficiência acima da média. Quando ocorrem falhas de foco, elas costumam estar ligadas ao cansaço físico pontual ou privação de sono, e não a uma condição neurobiológica de dispersão. Recomendação prática: Mantenha ciclos de trabalho em blocos de 50 minutos para aproveitar sua alta capacidade de retenção.'
        };
    } else if (tdah <= 37) {
        return {
            titulo: 'Oscilação Atencional e Sobrecarga de Estímulos',
            resumo: 'Identificamos sinais moderados de dispersão, impulsividade cognitiva e fadiga em tarefas longas.',
            laudo: 'Análise Detalhada: Sua mente apresenta um funcionamento dinâmico que oscila entre momentos de alta produtividade (hiperfoco pontual) e bloqueios de procrastinação. Você possui indícios moderados compatíveis com sobrecarga atencional: facilidade para iniciar múltiplos projetos, mas resistência mental quando a tarefa se torna repetitiva. Seu raciocínio lógico rápido muitas vezes faz você responder por impulso e perder a paciência com processos lentos. Recomendação prática: Externalize sua memória de trabalho usando listas visuais curtas (máximo 3 prioridades por dia) e reduza estímulos de dopamina rápida pela manhã.'
        };
    } else {
        return {
            titulo: 'Mente Hiperativa e Padrão Neurodivergente (Alto Indício)',
            resumo: 'Alerta de padrão: Alta correlação com traços de hiperatividade mental, hiperfoco seletivo e déficit executivo.',
            laudo: 'Análise Detalhada: Seu resultado (acima de 38 pontos) aponta uma forte presença de comportamentos associados ao espectro de desatenção e inquietude motora/cognitiva. Seu cérebro opera movido a novidade, desafio e urgência, não a importância. Isso explica por que você consegue resolver problemas complexos sob pressão (apoiado pelo seu QI lógico), mas trava ou adia tarefas simples do cotidiano. Há forte tendência ao "pensamento ramificado" e fadiga por excesso de autocrítica. Recomendação prática: Este perfil se beneficia enormemente de técnicas de ancoragem externa e, caso sinta prejuízo na rotina, uma avaliação clínica presencial utilizando este mapeamento como base.'
        };
    }
}

function copyPix() {
    const input = document.getElementById('pix-copia-cola');
    input.select();
    navigator.clipboard.writeText(input.value);
    const fb = document.getElementById('copy-feedback');
    fb.classList.remove('d-none');
    setTimeout(() => fb.classList.add('d-none'), 2500);
}
