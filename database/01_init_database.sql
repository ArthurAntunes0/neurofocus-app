-- ==========================================================
-- SCRIPT DE BANCO DE DADOS - NEUROFOCUS (POSTGRESQL)
-- ==========================================================

DROP TABLE IF EXISTS Alternativas;
DROP TABLE IF EXISTS Perguntas;
DROP TABLE IF EXISTS GabaritoResultados;
DROP TABLE IF EXISTS SessoesTeste;

CREATE TABLE Perguntas (
    Id SERIAL PRIMARY KEY,
    Ordem INT NOT NULL,
    Categoria VARCHAR(20) NOT NULL,
    Enunciado TEXT NOT NULL
);

CREATE TABLE Alternativas (
    Id SERIAL PRIMARY KEY,
    PerguntaId INT REFERENCES Perguntas(Id) ON DELETE CASCADE,
    Texto VARCHAR(255) NOT NULL,
    Pontos INT NOT NULL
);

CREATE TABLE GabaritoResultados (
    Id SERIAL PRIMARY KEY,
    PontuacaoMinTDAH INT NOT NULL,
    PontuacaoMaxTDAH INT NOT NULL,
    TituloPerfil VARCHAR(100) NOT NULL,
    ResumoCurto VARCHAR(255) NOT NULL,
    LaudoCompleto TEXT NOT NULL
);

CREATE TABLE SessoesTeste (
    TokenSessao UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ScoreTDAH INT NOT NULL,
    ScoreQI INT NOT NULL,
    MercadoPagoPaymentId BIGINT NULL,
    StatusPagamento VARCHAR(30) DEFAULT 'PENDENTE',
    QrCodeBase64 TEXT NULL,
    PixCopiaCola TEXT NULL,
    DataCriacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    DataPagamento TIMESTAMP NULL
);

-- SEED: 14 PERGUNTAS DE TDAH
INSERT INTO Perguntas (Ordem, Categoria, Enunciado) VALUES
(1, 'TDAH', 'Com que frequência você comete erros por descuido quando precisa trabalhar em um projeto chato ou difícil?'),
(2, 'TDAH', 'Com que frequência você tem dificuldade para manter a atenção quando está fazendo um trabalho repetitivo ou monótono?'),
(3, 'TDAH', 'Com que frequência você tem dificuldade para se concentrar no que as pessoas dizem, mesmo quando elas estão falando diretamente com você?'),
(4, 'TDAH', 'Com que frequência você deixa um projeto pela metade depois de já ter feito as partes mais desafiadoras ou interessantes?'),
(5, 'TDAH', 'Com que frequência você tem dificuldade para colocar as coisas em ordem quando precisa fazer uma tarefa que exige organização?'),
(6, 'TDAH', 'Quando você precisa fazer algo que exige muito esforço mental, com que frequência você evita ou adia o início?'),
(7, 'TDAH', 'Com que frequência você perde ou esquece onde colocou objetos necessários do dia a dia (chaves, carteira, celular)?'),
(8, 'TDAH', 'Com que frequência você se distrai facilmente com barulhos, conversas ou movimentações ao seu redor?'),
(9, 'TDAH', 'Com que frequência você tem dificuldade para lembrar de compromissos, prazos ou obrigações?'),
(10, 'TDAH', 'Com que frequência você fica se mexendo na cadeira ou balançando as mãos e os pés quando precisa ficar sentado por muito tempo?'),
(11, 'TDAH', 'Com que frequência você se sente excessivamente ativo e compelido a fazer coisas, como se estivesse "ligado a um motor"?'),
(12, 'TDAH', 'Com que frequência você tem dificuldade para relaxar e desligar a mente quando tem tempo livre para si mesmo?'),
(13, 'TDAH', 'Com que frequência você termina as frases das pessoas antes delas ou interrompe conversas sem perceber?'),
(14, 'TDAH', 'Com que frequência você sente irritação ou impaciência extrema ao esperar em filas ou aguardar processos lentos?');

INSERT INTO Alternativas (PerguntaId, Texto, Pontos)
SELECT Id, 'Nunca', 0 FROM Perguntas WHERE Categoria = 'TDAH'
UNION ALL
SELECT Id, 'Raramente', 1 FROM Perguntas WHERE Categoria = 'TDAH'
UNION ALL
SELECT Id, 'Às vezes', 2 FROM Perguntas WHERE Categoria = 'TDAH'
UNION ALL
SELECT Id, 'Frequentemente', 3 FROM Perguntas WHERE Categoria = 'TDAH'
UNION ALL
SELECT Id, 'Muito frequentemente', 4 FROM Perguntas WHERE Categoria = 'TDAH';

-- SEED: 6 PERGUNTAS DE QI E LÓGICA
INSERT INTO Perguntas (Ordem, Categoria, Enunciado) VALUES
(15, 'QI', 'Qual número completa logicamente a sequência: 2, 6, 12, 20, 30, ...?'),
(16, 'QI', 'Se todos os Bloops são Razzies e todos os Razzies são Lazzies, então todos os Bloops são definitivamente Lazzies?'),
(17, 'QI', 'Água está para Gelo assim como Leite está para:'),
(18, 'QI', 'Uma corrida tem 5 corredores. Se você ultrapassar o corredor que está em 2º lugar, em qual posição você passa a estar?'),
(19, 'QI', 'Um bastão e uma bola custam juntos R$ 1,10. O bastão custa R$ 1,00 a mais que a bola. Quanto custa a bola?'),
(20, 'QI', 'Se 5 máquinas levam 5 minutos para fazer 5 peças, quanto tempo levariam 100 máquinas para fazer 100 peças?');

INSERT INTO Alternativas (PerguntaId, Texto, Pontos) VALUES
(15, '38', 0), (15, '40', 0), (15, '42', 10), (15, '44', 0),
(16, 'Verdadeiro', 10), (16, 'Falso', 0), (16, 'Impossível determinar', 0),
(17, 'Vaca', 0), (17, 'Queijo', 10), (17, 'Café', 0), (17, 'Líquido', 0),
(18, '1º lugar', 0), (18, '2º lugar', 10), (18, '3º lugar', 0),
(19, 'R$ 0,10', 0), (19, 'R$ 0,05', 10), (19, 'R$ 0,15', 0), (19, 'R$ 0,01', 0),
(20, '100 minutos', 0), (20, '50 minutos', 0), (20, '5 minutos', 10), (20, '20 minutos', 0);

-- SEED: GABARITO RECALIBRADO
INSERT INTO GabaritoResultados (PontuacaoMinTDAH, PontuacaoMaxTDAH, TituloPerfil, ResumoCurto, LaudoCompleto) VALUES
(0, 18, 'Foco Linear e Estabilidade Cognitiva', 
'Detectamos um padrão de atenção estável com boa filtragem de estímulos externos.', 
'Análise Detalhada: Sua pontuação (entre 0 e 18 pontos na escala comportamental) indica baixo indício de desatenção crônica ou hiperatividade. Seu cérebro processa tarefas sequenciais com eficiência acima da média. Quando ocorrem falhas de foco, elas costumam estar ligadas ao cansaço físico pontual ou privação de sono, e não a uma condição neurobiológica de dispersão. Recomendação prática: Mantenha ciclos de trabalho em blocos de 50 minutos para aproveitar sua alta capacidade de retenção.'),

(19, 37, 'Oscilação Atencional e Sobrecarga de Estímulos', 
'Identificamos sinais moderados de dispersão, impulsividade cognitiva e fadiga em tarefas longas.', 
'Análise Detalhada: Sua mente apresenta um funcionamento dinâmico que oscila entre momentos de alta produtividade (hiperfoco pontual) e bloqueios de procrastinação. Você possui indícios moderados compatíveis com sobrecarga atencional: facilidade para iniciar múltiplos projetos, mas resistência mental quando a tarefa se torna repetitiva. Seu raciocínio lógico rápido muitas vezes faz você responder por impulso (como nos testes de reflexo cognitivo) e perder a paciência com processos lentos. Recomendação prática: Externalize sua memória de trabalho usando listas visuais curtas (máximo 3 prioridades por dia) e reduza estímulos de dopamina rápida pela manhã.'),

(38, 56, 'Mente Hiperativa e Padrão Neurodivergente (Alto Indício)', 
'Alerta de padrão: Alta correlação com traços de hiperatividade mental, hiperfoco seletivo e déficit executivo.', 
'Análise Detalhada: Seu resultado (acima de 38 pontos) aponta uma forte presença de comportamentos associados ao espectro de desatenção e inquietude motora/cognitiva. Seu cérebro opera movido a novidade, desafio e urgência, não a importância. Isso explica por que você consegue resolver problemas complexos sob pressão (apoiado pelo seu QI lógico), mas trava ou adia tarefas simples do cotidiano. Há forte tendência ao "pensamento ramificado" (um pensamento puxa outros cinco simultaneamente) e fadiga por excesso de autocrítica. Recomendação prática: Este perfil se beneficia enormemente de técnicas de ancoragem externa e, caso sinta prejuízo na rotina, uma avaliação clínica presencial utilizando este mapeamento como base.');
