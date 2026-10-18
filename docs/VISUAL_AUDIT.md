# Auditoria visual e direção de design

Estado: **a interface atual NÃO está aprovada.** Este documento audita o que existe e propõe uma direção para decisão do proprietário. Nada aqui declara aprovação.

## 1. Evidências e limites (ler primeiro)

| Evidência | O que é | Limite |
| --- | --- | --- |
| `docs/assets/preview-*.png` | Imagens geradas em um *harness* (Tailwind real + Chromium) de 14/10 | **Inter no lugar da Archivo**; ícones são glifos do conjunto Lucide via `react-icons`, não o pacote real; logo provisória. Não mostram o site publicado |
| Texto das páginas publicadas (`hive-barber.vercel.app`, 17/10) | Leitura do conteúdo de `/`, `/agendar` e `manifest` | Confirma conteúdo e `noindex`; **não mostra aparência** |
| Código de `src/` | Estrutura, classes, tokens | Mostra decisões, não resultado visual |
| Moodboard e referências originais | **Não localizados** entre os arquivos recebidos | Nenhuma referência foi inventada. As únicas referências concretas são as **fotos enviadas pelo proprietário** (fachada, salão, perfil do Instagram): madeira em ripado, parede grafite, parede em laranja queimado, poltronas pretas, espelhos com luminárias, logo circular com letreiro manuscrito |
| Navegador real, aparelho real | **Não existe evidência** | Nenhuma inspeção visual foi realizada. Ver plano de evidência na seção 6 |

## 2. Diagnóstico objetivo

Cada item cita a evidência. Veredito: **Preservar**, **Ajustar** ou **Substituir**.

| # | Elemento | Observação | Veredito |
| --- | --- | --- | --- |
| 1 | Composição da abertura | Texto à esquerda, caixa de imagem à direita, dois botões abaixo: é a abertura padrão de qualquer SaaS ou salão. Nada nela diz "barbearia" além do logo | **Substituir** |
| 2 | Painel de madeira (`.ripado`) | Marrom chapado com emendas **horizontais**: lê como piso ou tampo, não como ripado (ripas paralelas, em geral verticais). A logo pequena no centro desperdiça o maior elemento da tela | **Substituir** (a ideia de usar a madeira fica) |
| 3 | Estados vazios de Serviços e Equipe | Duas caixas tracejadas com barras de *skeleton* ocupam cerca de um terço da home. Parecem tela quebrada ou modelo não preenchido | **Substituir** (ocultar a seção até haver dados, ou desenhar a "tabela de preços" como estado vazio com intenção) |
| 4 | Hierarquia | O título principal é forte; abaixo dele todas as seções têm o mesmo peso (mesmo H2, mesma linha fina). Não há segundo ponto focal | **Ajustar** |
| 5 | Botões em azul sólido | Azul usado em todo botão primário e ícone: é o "azul de SaaS". A cor perde valor de destaque | **Ajustar** (regra de uso, ver seção 4) |
| 6 | Logo | Letreiro manuscrito ilegível a 40 px no cabeçalho (o texto ao lado compensa); arquivo é recorte de captura de tela, 700 px | **Ajustar** (esperar o original) |
| 7 | Tipografia | Título condensado e pesado (`.display`) é a melhor decisão da interface; **não verificado com a Archivo real** (o harness usou Inter) | **Preservar**, validar com a fonte real |
| 8 | Ícones | Conjunto Lucide genérico (tesoura, usuários, pino): serve ao painel, não dá identidade | **Ajustar** |
| 9 | `/agendar` | Placas escuras sobre madeira: pesado, texto sobre emendas; a numeração é legítima (os passos **são** uma sequência). Estático, sem interação | **Ajustar** (será refeito na Fase 04) |
| 10 | Painel administrativo | Barra lateral padrão de painel; a barra inferior móvel **existe** (bom, barbeiro usa o celular entre atendimentos). Bloco "pré-visualização do carregamento" é ruído. Identidade igual à de qualquer sistema administrativo | **Ajustar** estrutura, **substituir** identidade da tela "Hoje" |
| 11 | Movimento | Uma única animação de entrada (revelação do ripado) e `prefers-reduced-motion` respeitado | **Preservar** o princípio |
| 12 | Textos | Tom claro, honesto, sem inventar dados; frases em caixa normal | **Preservar** |
| 13 | Sistema de tokens | Existe e está documentado, mas os nomes são presos à paleta (`carvao`, `azul`, `madeira`) e há 3 arquivos com hex solto; não é substituível por outra barbearia sem editar componentes | **Substituir** a nomenclatura (semântica), manter os valores |
| 14 | Acessibilidade | Contraste conferido por script (15 pares); foco visível; alvos de toque ≥ 44 px; `lang="pt-BR"` | **Preservar** |
| 15 | Fotografia | Não há nenhuma. Sem foto real de fachada, salão e profissionais a interface não tem do que se alimentar | **Pendência de insumo** |

**Conclusão:** a base de engenharia visual (tokens, acessibilidade, honestidade do conteúdo, título condensado) é aproveitável. A **composição, o tratamento da madeira, os estados vazios e a identidade do painel** precisam de redesenho. Não é um ajuste de CSS.

## 3. Direção proposta: A "Ripado" (recomendada) e B "Comanda" (alternativa a testar)

Fundamentos: o briefing (preto predominante, grafite, madeira, azul de destaque, tipografia expressiva, movimento com intenção, mobile e desktop) e os elementos reais do ambiente da barbearia (ripado de madeira, espelhos com luminárias, poltronas pretas, tabela de serviços, comanda).

### Direção A — Ripado

**Ideia:** o ritmo do ripado da fachada vira o **sistema de layout**, não só uma textura. Uma única coisa é memorável; o resto é quieto.

- **Abertura:** foto real do ambiente (assim que existir) em máscara de ripas verticais, título condensado à esquerda embaixo, um só botão de ação. Sem foto, as ripas e o logo grande como selo. **Momento orquestrado único:** as ripas "abrem" uma vez, no carregamento, revelando a imagem.
- **Serviços como tabela de preços:** linhas com nome, duração, pontilhado e preço em números tabulares (vocabulário real de barbearia); tocar numa linha começa o agendamento já com o serviço escolhido. Os preços só aparecem se cadastrados.
- **Equipe:** retratos em recortes de ripa; nome e serviços que realiza.
- **Agendamento (Fase 04):** uma coluna; barra de progresso em cinco ripas que se preenchem; horários em grade agrupada por manhã e tarde; barra inferior fixa com preço, duração e a única ação primária; **confirmação como comanda** (bilhete com borda picotada) com profissional, serviço, data, hora e endereço; "Adicionar ao calendário" por arquivo `.ics` (sem serviço externo).
- **Painel ("balcão"):** ferramenta de trabalho, **sem ripado**, mesmo tipo e mesmos tokens; "Hoje" como linha do tempo vertical com o próximo cliente em destaque e ações ao alcance do polegar; agenda em desktop com colunas por profissional.

### Direção B — Comanda (para comparar)

Abertura tipográfica pura (sem foto): o título gigante e a tabela de serviços como uma comanda impressa, fundo grafite liso, madeira só em detalhes. Mais leve de carregar e independente de foto; menos "calor" de ambiente. Entra no *spike* para o proprietário **ver as duas** em aparelho e escolher.

### Plano de tokens (A, ponto de partida)

| Papel | Valor atual (preservado como ponto de partida) |
| --- | --- |
| Base | Carvão `#0d0e10` |
| Superfície | Grafite `#181b1f`, alta `#23272d`, linha `#2e343b` |
| Material | Madeira `#6d4326`, escura `#3f2714`, mel `#c28a55` (números e detalhes, uso parcimonioso) |
| Texto | Osso `#edeef0`, suave `#8c95a1` |
| Ação | Azul `#2f5bff` (claro `#7c97ff` para texto sobre escuro) |
| Estados | sucesso `#46c487`, alerta `#e3ab3f`, erro `#f06262` |

Esses valores já passaram na conferência de contraste (`scripts/contrast.mjs`). A **troca do azul** por um tom menos "padrão de SaaS" (mais cobalto/elétrico, por exemplo) é uma pergunta para o *spike*, não uma decisão; qualquer mudança é revalidada por contraste.

**Regra de uso do azul:** só no que é **ação** ou **disponível agora** (botão primário, horário livre, estado ativo). Um primário por tela. Nada de azul decorativo.

### Tipografia

- **Base:** Archivo variável (eixo de largura) já configurada: título condensado e pesado, corpo em largura normal.
- **Candidata para o *spike*:** um par com display condensado industrial e corpo humanista, da lista de fontes livres do `next/font`. **Não definido nem verificado** (depende do build com cada fonte e de ver em aparelho). Critérios: suporta pt-BR, números tabulares legíveis, licença livre, peso baixo.
- Caixa normal (sem tudo em maiúsculas), linhas de até 62 caracteres, números de agenda e preço tabulares.
- Escala: título principal fluido (`clamp`), H2, H3, corpo, legenda: 5 degraus fixos.

### Imagens, ícones, movimento, responsivo

- **Imagens:** só fotos **reais** da barbearia (fachada, salão, profissionais, trabalhos), enviadas pelo proprietário ao Storage com limite de tipo e tamanho; tratamento único (recorte em ripa, contraste e tom consistentes); nada de banco de imagens. Sem foto, a interface mostra textura e logo, nunca imagem falsa.
- **Ícones:** Lucide para utilidades (painel e controles); um conjunto pequeno de glifos próprios (tesoura, navalha, poste, cadeira, espelho) para os pontos de marca, só depois da direção aprovada.
- **Movimento:** um momento orquestrado (ripas), respostas a toque (pressionar, selecionar horário, trocar de passo) em 120–200 ms, tudo desligado com `prefers-reduced-motion`. Sem entradas em cascata nem efeitos ao passar o mouse em todo cartão.
- **Responsivo:** mobile primeiro (360 a 430 px de largura base) e desktop a 1280 px; alvos ≥ 44 px; barras fixas respeitam a área segura do iPhone; painel com barra inferior no celular.

### Autocrítica da direção A

Verificado contra os padrões comuns de interface gerada: (1) preto com um acento forte é o que o briefing pede, então foi mantido, mas o acento tem **regra de uso** e a madeira é material, não enfeite; (2) nada de cartões idênticos arredondados, sombras iguais, degradês decorativos, rótulos em caixa alta ou setas em links; (3) a numeração só existe onde há **sequência de verdade** (os cinco passos); (4) uma única animação de página. O risco que resta é a abertura depender de **foto real**: sem ela a Direção A perde força, e por isso a B entra no teste.

## 4. White-label no design

Núcleo visual fixo: layout, componentes, movimento, hierarquia. Pontos de personalização: paleta de 6 cores validada por contraste, par tipográfico de lista curada, textura (ripado, liso, nenhuma), raio (reto ou suave), logo, capa e fotos. Detalhes técnicos em `WHITE_LABEL.md`, seção 3.1. A identidade da Bolonha é a **primeira aplicação**; o pacote padrão do produto é neutro.

## 5. O que preservar, ajustar e substituir (resumo)

- **Preservar:** título condensado, honestidade dos textos, acessibilidade, princípio de movimento único, ideia da madeira.
- **Ajustar:** hierarquia das seções, uso do azul, ícones, `/agendar`, estrutura do painel.
- **Substituir:** abertura, tratamento da madeira, estados vazios, identidade da tela "Hoje", nomenclatura dos tokens.

## 6. Validação antes de considerar o visual concluído

Nenhuma tela está aprovada por abrir ou por passar nos testes. Plano:

1. **Capturas automáticas no CI** (Chromium e WebKit, 390×844 e 1280×800) de `/`, `/agendar` e `/admin`, publicadas numa branch de evidências. Serve para a equipe e para o Claude **verem de fato** a tela com a fonte e os ícones reais. **Não substitui aparelho real** (Safari do iPhone e Chrome do Android têm diferenças).
2. **Aparelhos reais:** o proprietário abre o endereço de teste em um iPhone e em um Android e envia capturas de tela (ou gravação). Sem isso, o texto "inspecionado em aparelho" não entra em relatório algum.
3. **Insumos que faltam:** moodboard e referências que o proprietário aprova (3 a 5 sites ou imagens), fotos reais, logo em alta resolução (PNG/SVG).
4. **Portão:** o proprietário escolhe a direção (A, B ou ajuste) por escrito antes de qualquer tela nova.
