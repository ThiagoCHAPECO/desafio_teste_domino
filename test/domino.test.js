import test from 'node:test';
import assert from 'node:assert/strict';
import { Domino, criarPecas } from '../src/domino.js';

function jogarAutomatico(jogo) {
  const s=jogo.estado, j=s.vez;
  const indice=s.maos[j].findIndex(p => !s.mesa.length || p.includes(s.mesa[0][0]) || p.includes(s.mesa.at(-1)[1]));
  if(indice>=0) {
    const p=s.maos[j][indice];
    const lado=!s.mesa.length || p.includes(s.mesa.at(-1)[1]) ? 'direita' : 'esquerda';
    jogo.jogar(j,indice,lado);
    return 'jogar';
  }
  if(s.monte) { jogo.comprar(j); return 'comprar'; }
  jogo.passar(j); return 'passar';
}
function baralhoSemente(semente) {
  const d=criarPecas(); let x=semente;
  for(let i=d.length-1;i>0;i--) {
    x=(Math.imul(x,1664525)+1013904223)>>>0;
    const j=x%(i+1); [d[i],d[j]]=[d[j],d[i]];
  }
  return d;
}

test('CT01 - conjunto duplo seis tem 28 pecas diferentes', () => {
  const d=criarPecas();
  assert.equal(d.length,28); assert.equal(new Set(d.map(p=>p.join('-'))).size,28);
  assert.deepEqual(d[0],[0,0]); assert.deepEqual(d.at(-1),[6,6]);
});
test('CT02 - distribui sete pecas por jogador e quatorze no monte', () => {
  const s=new Domino().estado;
  assert.deepEqual(s.maos.map(m=>m.length),[7,7]); assert.equal(s.monte,14); assert.equal(s.vez,0);
});
test('CT03 - baralho invalido ou repetido e rejeitado', () => {
  assert.throws(()=>new Domino([]),RangeError);
  const d=criarPecas(); d[1]=d[0]; assert.throws(()=>new Domino(d),RangeError);
  const e=criarPecas();e[0]=[7,0];assert.throws(()=>new Domino(e),RangeError);
});
test('CT04 - primeira jogada reduz mao, cria mesa e troca turno', () => {
  const j=new Domino();j.jogar(0,0);
  assert.deepEqual(j.estado.mesa,[[0,0]]);assert.equal(j.estado.maos[0].length,6);assert.equal(j.estado.vez,1);
});
test('CT05 - inverte peca ao encaixar na ponta esquerda', () => {
  const d=criarPecas(), escolhidas=[[0,1],[0,2]];
  const resto=d.filter(p=>!escolhidas.some(e=>e.join()===p.join()));
  const baralho=[escolhidas[0],...resto.slice(0,6),escolhidas[1],...resto.slice(6)];
  const j=new Domino(baralho);j.jogar(0,0);j.jogar(1,0,'esquerda');
  assert.deepEqual(j.estado.mesa,[[2,0],[0,1]]);
});
test('CT06 - rejeita peca sem encaixe sem alterar o estado', () => {
  const j=new Domino();j.jogar(0,0);const antes=j.estado;
  assert.throws(()=>j.jogar(1,0)); assert.deepEqual(j.estado,antes);
});
test('CT07 - rejeita turno, indice e lado invalidos', () => {
  const j=new Domino();const antes=j.estado;
  assert.throws(()=>j.jogar(1,0));
  assert.throws(()=>j.jogar(0,-1),RangeError);
  assert.throws(()=>j.jogar(0,0,'centro'),RangeError);
  assert.deepEqual(j.estado,antes);
});
test('CT08 - nao compra nem passa quando existe jogada', () => {
  const j=new Domino();
  assert.throws(()=>j.comprar(0));assert.throws(()=>j.passar(0));
});
test('CT09 - compra obrigatoria sem encaixe mantem turno e conserva pecas', () => {
  const j=new Domino();j.jogar(0,0);
  const antes=j.estado;j.comprar(1);const depois=j.estado;
  assert.equal(depois.maos[1].length,antes.maos[1].length+1);
  assert.equal(depois.monte,antes.monte-1);assert.equal(depois.vez,1);
  assert.throws(()=>j.passar(1));
});
test('CT10 - partidas deterministicas conservam as 28 pecas e encerram', () => {
  for(let seed=1;seed<=20;seed++) {
    const j=new Domino(baralhoSemente(seed));
    for(let passo=0;!j.estado.terminou && passo<200;passo++) {
      jogarAutomatico(j);
      const s=j.estado;
      assert.equal(s.maos[0].length+s.maos[1].length+s.mesa.length+s.monte,28);
      for(let i=1;i<s.mesa.length;i++) assert.equal(s.mesa[i-1][1],s.mesa[i][0]);
    }
    assert.equal(j.estado.terminou,true);
    assert.throws(()=>j.jogar(j.estado.vez,0));
    assert.throws(()=>j.comprar(j.estado.vez));
    assert.throws(()=>j.passar(j.estado.vez));
  }
});
test('CT11 - esvaziar a mao vence a partida', () => {
  const j=new Domino();
  for(let n=0;!j.estado.terminou && n<200;n++) jogarAutomatico(j);
  assert.ok([0,1].includes(j.estado.vencedor));
  assert.equal(j.estado.maos[j.estado.vencedor].length,0);
});
test('CT12 - bloqueio compara soma dos pontos nas maos restantes', () => {
  let bloqueados=0;
  for(let seed=1;seed<=100;seed++) {
    const j=new Domino(baralhoSemente(seed));
    for(let n=0;!j.estado.terminou && n<200;n++) jogarAutomatico(j);
    const s=j.estado;
    if(s.maos.every(m=>m.length>0)) {
      bloqueados++;
      const pontos=s.maos.map(m=>m.flat().reduce((a,b)=>a+b,0));
      const esperado=pontos[0]===pontos[1]?'empate':pontos[0]<pontos[1]?0:1;
      assert.equal(s.vencedor,esperado);assert.equal(s.monte,0);
    }
  }
  assert.ok(bloqueados>0);
});
test('CT13 - copia baralho e retorna consultas defensivas', () => {
  const d=criarPecas(),j=new Domino(d);d[0][0]=6;
  const consulta=j.estado;consulta.maos[0][0][0]=5;
  assert.deepEqual(j.estado.maos[0][0],[0,0]);
});
