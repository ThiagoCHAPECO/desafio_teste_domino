export const criarPecas = () => Array.from({ length: 7 }, (_, a) =>
  Array.from({ length: 7 - a }, (_, b) => [a, a + b])).flat();

const chave = p => [...p].sort((a, b) => a - b).join('-');

export class Domino {
  #maos; #monte; #mesa = []; #vez = 0; #passes = 0; #vencedor = null; #terminou = false;
  constructor(baralho = criarPecas()) {
    if (!Array.isArray(baralho) || baralho.length !== 28 ||
      baralho.some(p => !Array.isArray(p) || p.length !== 2 ||
        p.some(n => !Number.isInteger(n) || n < 0 || n > 6)) ||
      new Set(baralho.map(chave)).size !== 28) throw new RangeError('Baralho invalido');
    const copia = baralho.map(p => [...p]);
    this.#maos = [copia.slice(0, 7), copia.slice(7, 14)];
    this.#monte = copia.slice(14);
  }

  #ativo(j) {
    if (this.#terminou) throw new Error('Partida encerrada');
    if (j !== this.#vez) throw new Error('Fora da vez');
  }
  #encaixa(p) {
    return this.#mesa.length === 0 || p.includes(this.#mesa[0][0]) || p.includes(this.#mesa.at(-1)[1]);
  }
  #temJogada(j) { return this.#maos[j].some(p => this.#encaixa(p)); }

  jogar(j, indice, lado = 'direita') {
    this.#ativo(j);
    if (!['esquerda', 'direita'].includes(lado) || !Number.isInteger(indice) ||
        indice < 0 || indice >= this.#maos[j].length) throw new RangeError('Jogada invalida');
    let p = [...this.#maos[j][indice]];
    if (this.#mesa.length) {
      const ponta = lado === 'esquerda' ? this.#mesa[0][0] : this.#mesa.at(-1)[1];
      if (!p.includes(ponta)) throw new Error('Peca nao encaixa');
      if ((lado === 'esquerda' ? p[1] : p[0]) !== ponta) p.reverse();
    }
    this.#maos[j].splice(indice, 1);
    if (lado === 'esquerda') this.#mesa.unshift(p);
    else this.#mesa.push(p);
    this.#passes = 0;
    if (this.#maos[j].length === 0) { this.#terminou = true; this.#vencedor = j; }
    else this.#vez = 1 - j;
  }

  comprar(j) {
    this.#ativo(j);
    if (this.#temJogada(j)) throw new Error('Existe jogada disponivel');
    if (!this.#monte.length) throw new Error('Monte vazio');
    this.#maos[j].push(this.#monte.shift());
    this.#passes = 0;
  }

  passar(j) {
    this.#ativo(j);
    if (this.#temJogada(j) || this.#monte.length) throw new Error('Nao pode passar');
    this.#passes++;
    if (this.#passes === 2) {
      const pontos = this.#maos.map(m => m.flat().reduce((s, n) => s + n, 0));
      this.#vencedor = pontos[0] === pontos[1] ? 'empate' : pontos[0] < pontos[1] ? 0 : 1;
      this.#terminou = true;
    } else this.#vez = 1 - j;
  }

  get estado() {
    return { maos: this.#maos.map(m => m.map(p => [...p])), monte: this.#monte.length,
      mesa: this.#mesa.map(p => [...p]), vez: this.#vez, vencedor: this.#vencedor, terminou: this.#terminou };
  }
}
