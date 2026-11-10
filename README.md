# Dominó - dois jogadores

**Colaborador:** Thiago Gimenes.

**Identificação acadêmica:** preencher RA e turma antes de publicar. Se houver dupla, incluir o nome e o RA do segundo integrante e contribuições reais de ambos.

## Especificação do desafio

Base: [desafios da disciplina](https://github.com/JoaoChoma/teste_software_2026/blob/main/desafios.md). Implementação e testes em JavaScript, conforme solicitado. Este projeto é independente e deve ser publicado em um repositório chamado **desafio_teste_domino**.

Dominó duplo-seis com 28 peças únicas, de [0,0] a [6,6]. Dois jogadores recebem sete peças cada, e as 14 restantes ficam no monte. O jogador 0 inicia com qualquer peça: essa convenção foi escolhida porque o enunciado não define a regra de abertura.

As peças encaixam em uma das pontas da mesa e são invertidas automaticamente quando necessário. Uma jogada válida retira a peça da mão e passa o turno ao adversário. Se houver encaixe, não é permitido comprar nem passar. Sem encaixe, o jogador deve comprar uma peça por chamada, mantendo sua vez, até ter uma jogada ou esgotar o monte.

Só é permitido passar quando não existe encaixe e o monte está vazio. Dois passes consecutivos encerram por bloqueio: vence a menor soma de pontos na mão; somas iguais resultam em empate. Esvaziar a mão vence imediatamente. Não há pontuação acumulada entre partidas.

O construtor permite informar uma permutação válida das 28 peças, mantendo os testes determinísticos. A distribuição padrão segue uma ordem fixa. Consultas são cópias. Os testes de partidas completas acompanham a conservação das 28 peças e o encaixe de todas as peças da mesa.

## Executar

Requisito: Node.js 22 ou superior, com npm. O projeto não possui dependências externas; não é necessário executar `npm install`.

```bash
npm test
npm run coverage
```

O primeiro comando executa todos os testes com `node:test` e `node:assert/strict`. O segundo acrescenta o relatório de cobertura nativo do Node. O processo termina com código diferente de zero se algum teste falhar.

## Exemplo de uso

```javascript
import { Domino } from './src/domino.js';
const jogo = new Domino();
jogo.jogar(0, 0); // [0,0] na distribuição padrão
console.log(jogo.estado.vez); // 1
console.log(jogo.estado.maos.map(m => m.length)); // [6,7]
```

Os exemplos são executados como módulos ES, em um arquivo `.js` dentro deste projeto. A lógica fica em [src/domino.js](src/domino.js) e os testes em [test/domino.test.js](test/domino.test.js).

## Casos de teste e funcionamento

Cada teste prepara uma partida independente, executa uma ação pública do motor e compara o resultado ou o estado esperado. Operações inválidas são verificadas com `assert.throws`; quando relevante, o estado anterior e posterior também é comparado. Os testes não substituem a implementação por mocks.

| Caso | Comportamento verificado |
|---|---|
| CT01 | conjunto duplo seis tem 28 pecas diferentes |
| CT02 | distribui sete pecas por jogador e quatorze no monte |
| CT03 | baralho invalido ou repetido e rejeitado |
| CT04 | primeira jogada reduz mao, cria mesa e troca turno |
| CT05 | inverte peca ao encaixar na ponta esquerda |
| CT06 | rejeita peca sem encaixe sem alterar o estado |
| CT07 | rejeita turno, indice e lado invalidos |
| CT08 | nao compra nem passa quando existe jogada |
| CT09 | compra obrigatoria sem encaixe mantem turno e conserva pecas |
| CT10 | partidas deterministicas conservam as 28 pecas e encerram |
| CT11 | esvaziar a mao vence a partida |
| CT12 | bloqueio compara soma dos pontos nas maos restantes |
| CT13 | copia baralho e retorna consultas defensivas |

## Evidências da execução

Execução em 10/11/2026, Node.js 22.19.0: **13 testes aprovados, zero falhas, zero ignorados**. Saída completa em [evidencias/testes.log](evidencias/testes.log).

Cobertura do arquivo de produção: **100.00% de linhas, 96.88% de ramificações e 100.00% de funções**. Os percentuais são do arquivo `src/domino.js`; não foi usada a média que inclui o código dos testes. Cobertura indica código exercitado e não prova ausência de defeitos ou atendimento de variantes não especificadas.

## Organização e entrega

`src/` contém o motor do jogo; `test/` contém os casos automatizados; `evidencias/` registra o resultado real. O projeto não exige navegador, banco ou interface gráfica. Há uma configuração de GitHub Actions para repetir os testes a cada push ou pull request.

O professor exige um repositório por desafio e aceita no máximo cinco para avaliação. Este pacote permite revisar o projeto individualmente antes de escolher quais cinco serão enviados. Não há histórico de contribuição artificial: commits devem registrar as contribuições reais dos integrantes.
