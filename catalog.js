/* =====================================================================
   biodeltafabiosilva — CATÁLOGO E REGRAS (dados, não código)
   ---------------------------------------------------------------------
   Para INCLUIR UM PRODUTO NOVO:
     1) adicione um item em PRODUTOS (code único, mesmo code na tabela
        bio_produtos do SOU Data Core — destino + padrões de compra);
     2) se ele deve ser recomendado pelo quiz, adicione uma regra em REGRAS
        (a primeira regra que casar vence; ordem importa);
     3) pronto — a página, o gate e o painel #/bio passam a conhecê-lo.
   Nada mais precisa mudar. Não edite app.js para incluir produto.
   ===================================================================== */
window.BIO = {
  perfil: {
    nome: "Delta Fábio Silva",
    handle: "@deltafabiosilva",
    cargo: "Delegado · Professor",
    tagline: ["Responda 5 perguntas e eu te digo", "o caminho mais curto até a farda."],
    // foto recortada (fundo transparente) — hero usa o busto; og.jpg usa a inteira
    foto: "assets/delta-busto.webp",
    fotoFallback: "assets/delta-silhueta.svg",
  },

  // API de ingestão (SOU Data Core · edge function bio-lead)
  api: "https://dqpxugdhlgafvddavzzp.supabase.co/functions/v1/bio-lead",
  origem: "bio_deltafabiosilva",

  // ------------------------------------------------------------------
  // MODO DA PÁGINA (17/09/2026 — captação das lives; desde 19/11 só PC-AM e PRF)
  //   "lives"    → o chat da Anne abre sozinho, a pergunta da farda entrega o
  //                link de captação na hora e o catálogo de produtos fica oculto.
  //   "catalogo" → comportamento original: quiz de 5 toques + gate + catálogo.
  // Depois do carrinho (01/10) é só trocar para "catalogo" — nada mais muda.
  // ------------------------------------------------------------------
  modo: "lives",

  // Redes — links chegam depois (Fábio); vazio = ícone não aparece
  redes: [
    { id: "instagram", label: "Instagram", url: "https://www.instagram.com/deltafabiosilva" },
    { id: "youtube",   label: "YouTube",   url: "" },
    { id: "tiktok",    label: "TikTok",    url: "" },
    { id: "spotify",   label: "Spotify",   url: "" },
  ],

  // Botões fixos de WhatsApp — números chegam depois (Fábio)
  whatsapp: [
    { titulo: "Quero ser aluno do Delta", sub: "FALE COM A ANNE · WHATSAPP", numero: "", msg: "Oi Anne! Vim pelo link da bio do Delta Fábio e quero saber mais sobre as mentorias." },
    { titulo: "Já sou aluno · suporte",   sub: "CURSOS E MENTORIAS",         numero: "", msg: "Oi! Sou aluno e preciso de suporte." },
  ],

  // ------------------------------------------------------------------
  // PRODUTOS — ordem = ordem do catálogo na página
  // tipo: "anne" (Elite → lead entra na régua da Anne) | "externo" (link oficial, sem Anne)
  // cta: texto do botão principal; url: destino (Hubla/oficial); utm: acrescentado na url
  // sigla: 2-4 caracteres da insígnia do card (usada até existir capa); capa: imagem (assets/) ou null → gradiente `tema`
  // ------------------------------------------------------------------
  produtos: [
    {
      code: "elite_prf",
      sigla: "PRF",
      nome: "Mentoria Elite PRF",
      eyebrow: "MENTORIA · NÍVEL SUPERIOR",
      resumo: "Acompanhamento de perto até a aprovação",
      desc: "Direcionamento semanal, correção de rota, simulados no estilo da banca e suporte direto do time do Delta até o dia da prova. Para quem quer tratar a farda como projeto, não como sorte.",
      preco: "12x de R$ 159,77",
      precoNota: "ou à vista com a Anne",
      cta: "Quero minha vaga na Elite PRF",
      url: "https://hub.la/r/elite_prf_anneia_cartao",
      tipo: "anne",
      tema: "marinho",
      capa: "assets/capa-elite_prf.webp",
      pitch: "{nome}, pelo que você me contou, você não precisa de mais conteúdo solto. Precisa de alguém do lado corrigindo a rota toda semana até a prova. A Elite PRF é exatamente isso.",
    },
    {
      code: "elite_prf_adm",
      sigla: "ADM",
      nome: "Mentoria Elite PRF Administrativo",
      eyebrow: "MENTORIA · NÍVEL MÉDIO",
      resumo: "A porta de entrada na PRF sem diploma",
      desc: "Preparação completa para o cargo administrativo da PRF: nível médio, mesma instituição, mesma farda. Cronograma, aulas, simulados e acompanhamento do time do Delta.",
      preco: "12x de R$ 119,76",
      precoNota: "",
      cta: "Quero minha vaga na Elite PRF ADM",
      url: "https://hub.la/r/elite_prf_adm_anneia_cartao",
      tipo: "anne",
      tema: "marinho",
      capa: "assets/capa-elite_prf_adm.webp",
      pitch: "{nome}, com ensino médio você já pode entrar na PRF pelo cargo administrativo. É a rota mais curta pra farda — e a Elite PRF ADM foi montada exatamente pra esse concurso.",
    },
    {
      code: "playpassei",
      sigla: "▶",
      nome: "Play Passei",
      eyebrow: "PLATAFORMA · ESTUDO POR MÚSICAS",
      resumo: "Memorize a matéria ouvindo",
      desc: "Músicas que ensinam o conteúdo dos concursos: no trânsito, na academia, no plantão. Mais de 600 faixas em 13 disciplinas, no seu celular, com modo offline.",
      preco: "12x de R$ 29,72",
      precoNota: "cupom PLAY10 · garantia de 15 dias",
      cta: "Conhecer o Play Passei",
      url: "https://playpassei.com.br/",
      tipo: "externo",
      tema: "violeta",
      capa: "assets/capa-playpassei.webp",
      pitch: "{nome}, com pouco tempo por dia o que salva é estudar nos intervalos que ninguém usa. O Play Passei transforma a matéria em música — você memoriza no trânsito, na academia, no plantão.",
    },
    {
      code: "souquestoes",
      sigla: "?",
      nome: "Sou Questões",
      eyebrow: "GRÁTIS · PRATIQUE COM IA",
      resumo: "Treine com questões corrigidas por IA",
      desc: "Plataforma de questões do Sou Concurseiro: filtre pelo seu concurso, resolva e receba correção comentada por IA. Comece grátis agora.",
      preco: "Grátis para começar",
      precoNota: "",
      cta: "Praticar de graça",
      url: "https://souquestoes.com.br/auth",
      tipo: "externo",
      tema: "grafite",
      capa: "assets/capa-souquestoes.webp",
      pitch: "{nome}, quem já fez prova sabe: o que decide é treino de questão. O Sou Questões te deixa praticar de graça, com correção por IA, no estilo da sua banca.",
    },
  ],

  // ------------------------------------------------------------------
  // QUIZ — 5 toques. Cada pergunta tem chave (vai em respostas.<chave>)
  // e opções {v: valor gravado, t: texto do botão}. "nome" é entrada livre.
  // ------------------------------------------------------------------
  quiz: {
    abertura: "Olá! 👋 Aqui é a Anne, assistente do Delta Fábio. Responda 5 perguntas rápidas e eu te indico o caminho mais curto até a sua farda.",
    inicio: "Bora começar 🚔",
    perguntas: [
      { chave: "nome", tipo: "texto", texto: "Fechado! Antes de tudo, como posso te chamar?", placeholder: "Escreva seu nome…" },
      { chave: "farda", texto: "Prazer, {nome}! Qual farda você quer vestir?", opcoes: [
        { v: "PRF", t: "PRF · Polícia Rodoviária Federal" },
        { v: "PF",  t: "PF · Polícia Federal" },
        { v: "PC",  t: "Polícia Civil" },
        { v: "PM",  t: "Polícia Militar" },
        { v: "INDECISO", t: "Ainda não decidi" },
      ]},
      { chave: "escolaridade", texto: "Boa escolha. Qual é a sua escolaridade hoje?", opcoes: [
        { v: "SUPERIOR", t: "Superior completo" },
        { v: "SUPERIOR", t: "Cursando o superior" },
        { v: "MEDIO",    t: "Ensino médio" },
      ]},
      { chave: "momento", texto: "E qual é o seu momento de estudo, {nome}?", opcoes: [
        { v: "ZERO",     t: "Começando do zero" },
        { v: "SEM_METODO", t: "Estudo, mas sem método" },
        { v: "REPROVOU", t: "Já fiz prova e não passei" },
        { v: "RETA_FINAL", t: "Reta final / revisão" },
      ]},
      { chave: "tempo", texto: "Última: quanto tempo por dia você consegue estudar?", opcoes: [
        { v: "MENOS_1H", t: "Menos de 1 hora" },
        { v: "1_3H",     t: "De 1 a 3 horas" },
        { v: "MAIS_3H",  t: "Mais de 3 horas" },
      ]},
    ],
    fechamento: "Perfeito, {nome}. Já sei exatamente o que indicar pra você. 🎯",
    gate: {
      titulo: "Sua recomendação está pronta",
      sub: "Deixa seu WhatsApp pra ver o que separei pra você.",
      botao: "Ver minha recomendação →",
    },
    despedida: "Qualquer dúvida é só me chamar aqui, {nome}. Rumo à farda! 🚔",
  },

  // ------------------------------------------------------------------
  // MODO "lives" — roteamento direto para as páginas de captação.
  // Cada opção aponta para um destino; destino tipo "whatsapp" abre o wa.me.
  // Trocar página de captação = trocar a url aqui. Nada em app.js.
  // ------------------------------------------------------------------
  lives: {
    // 19/11/2026 — só 2 concursos (PC-AM e PRF), link direto do grupo na Sendflow.
    tagline: ["Escolha o seu concurso e eu te coloco", "no grupo de estudos certo."],
    concierge: {
      titulo: "PC-AM ou PRF?",
      sub: "Fale com a Anne, minha assistente. Ela te coloca no grupo de estudos certo em um minuto.",
    },
    abertura: "Olá! 👋 Aqui é a Anne, assistente do Delta Fábio. Ele abriu os grupos de estudos da PC-AM e da PRF no WhatsApp — me diz qual é o seu concurso que eu te coloco no grupo certo.",
    perguntaNome: { texto: "Antes de tudo, como posso te chamar?", placeholder: "Escreva seu nome…" },
    perguntaFarda: "Prazer, {nome}! Qual é o seu concurso?",
    despedida: "Qualquer dúvida é só me chamar aqui, {nome}. Rumo à farda! 🚔",
    opcoes: [
      { v: "PC_AM", t: "PC-AM · Polícia Civil do Amazonas", destino: "grupo_pcam" },
      { v: "PRF",   t: "PRF · Polícia Rodoviária Federal",  destino: "grupo_prf" },
    ],
    destinos: {
      grupo_pcam: {
        tag: "SEU PRÓXIMO PASSO",
        titulo: "Grupo de Estudos PC-AM",
        desc: "Grupo de estudos do Delta no WhatsApp para a Polícia Civil do Amazonas: plano de estudo, material e as aulas ao vivo.",
        cta: "Entrar no Grupo de Estudos PC-AM",
        pitch: "{nome}, o grupo de estudos da PC-AM está aberto no WhatsApp — é lá que sai o plano de estudo e acontecem as aulas ao vivo do Delta. Entra:",
        url: "https://sndflw.com/i/vJIPvsikXTORq2HAVA8Z",
      },
      grupo_prf: {
        tag: "SEU PRÓXIMO PASSO",
        titulo: "Grupo de Estudos PRF",
        desc: "Grupo de estudos do Delta no WhatsApp para a PRF: plano de estudo, material e as aulas ao vivo.",
        cta: "Entrar no Grupo de Estudos PRF",
        pitch: "{nome}, PRF é o terreno do Delta. O grupo de estudos da PRF está aberto no WhatsApp — é lá que sai o plano de estudo e acontecem as aulas ao vivo. Entra:",
        url: "https://sndflw.com/i/mOYyuf302IWUHITiifsb",
      },
    },
  },

  // ------------------------------------------------------------------
  // REGRAS DE RECOMENDAÇÃO — primeira que casar vence.
  // when: {chave: [valores aceitos]} (todas as chaves precisam casar).
  // Última regra sem "when" = padrão.
  // ------------------------------------------------------------------
  regras: [
    { when: { farda: ["PRF", "INDECISO"], escolaridade: ["SUPERIOR"] }, produto: "elite_prf" },
    { when: { farda: ["PRF", "INDECISO"], escolaridade: ["MEDIO"] },    produto: "elite_prf_adm" },
    { when: { farda: ["PF", "PC", "PM"], momento: ["REPROVOU", "RETA_FINAL"] }, produto: "souquestoes" },
    { when: { farda: ["PF", "PC", "PM"] }, produto: "playpassei" },
    { produto: "elite_prf" },
  ],

  // Copy extra por resposta (opcional) — entra antes do pitch do produto
  nuances: {
    momento: {
      ZERO: "Começar do zero é vantagem: você ainda não pegou vício de estudo errado.",
      REPROVOU: "Reprovar uma vez não é sinal de fraqueza — é diagnóstico. Agora a gente corrige o que te derrubou.",
      RETA_FINAL: "Na reta final o jogo é revisão e questão, não conteúdo novo.",
    },
  },
};
