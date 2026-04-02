const path = require('path');
const XLSX = require('xlsx');

const TOTAL_LINHAS = 120;

const catalogoBase = [
  { nome: 'Cimento CP II 50kg', categoria: 'Cimentos e Argamassas', ncm: '25232990', custo: 29.5, venda: 39.9, min: 25 },
  { nome: 'Argamassa ACII 20kg', categoria: 'Cimentos e Argamassas', ncm: '32149000', custo: 14.8, venda: 22.9, min: 20 },
  { nome: 'Rejunte Flexivel 1kg', categoria: 'Acabamentos', ncm: '32149000', custo: 5.2, venda: 11.9, min: 30 },
  { nome: 'Tijolo Ceramico 8 Furos', categoria: 'Alvenaria', ncm: '69041000', custo: 0.92, venda: 1.59, min: 800 },
  { nome: 'Bloco de Concreto 14x19x39', categoria: 'Alvenaria', ncm: '68101100', custo: 3.1, venda: 5.8, min: 300 },
  { nome: 'Areia Media 20kg', categoria: 'Agregados', ncm: '25051000', custo: 4.7, venda: 8.9, min: 60 },
  { nome: 'Brita 1 20kg', categoria: 'Agregados', ncm: '25171000', custo: 5.8, venda: 10.4, min: 60 },
  { nome: 'Tubo PVC Soldavel 25mm 3m', categoria: 'Hidraulica', ncm: '39172300', custo: 18.5, venda: 29.9, min: 25 },
  { nome: 'Joelho PVC Soldavel 25mm', categoria: 'Hidraulica', ncm: '39174090', custo: 1.4, venda: 3.9, min: 60 },
  { nome: 'Registro Esfera 25mm', categoria: 'Hidraulica', ncm: '84818099', custo: 16.5, venda: 29.5, min: 20 },
  { nome: 'Fio Flexivel 2,5mm 100m', categoria: 'Eletrica', ncm: '85444900', custo: 199.0, venda: 289.0, min: 10 },
  { nome: 'Disjuntor Din 1P 20A', categoria: 'Eletrica', ncm: '85362000', custo: 12.8, venda: 21.9, min: 30 },
  { nome: 'Tomada 2P+T 10A', categoria: 'Eletrica', ncm: '85366990', custo: 6.2, venda: 13.9, min: 40 },
  { nome: 'Interruptor Simples 10A', categoria: 'Eletrica', ncm: '85365090', custo: 5.7, venda: 12.5, min: 40 },
  { nome: 'Tinta Acrilica Fosca 18L', categoria: 'Tintas', ncm: '32091010', custo: 179.0, venda: 259.0, min: 12 },
  { nome: 'Selador Acrilico 18L', categoria: 'Tintas', ncm: '32091090', custo: 121.0, venda: 189.0, min: 10 },
  { nome: 'Rolo de Lã 23cm', categoria: 'Pintura', ncm: '96034010', custo: 9.8, venda: 19.9, min: 30 },
  { nome: 'Pincel Trincha 2"', categoria: 'Pintura', ncm: '96034010', custo: 7.2, venda: 14.5, min: 30 },
  { nome: 'Serra Copo Bi-Metal 48mm', categoria: 'Ferramentas', ncm: '82075011', custo: 28.0, venda: 49.0, min: 15 },
  { nome: 'Broca Concreto 8mm', categoria: 'Ferramentas', ncm: '82075011', custo: 5.5, venda: 11.9, min: 40 },
  { nome: 'Parafuso Madeira 5x50', categoria: 'Fixacao', ncm: '73181200', custo: 0.21, venda: 0.69, min: 1500 },
  { nome: 'Bucha Nylon S8', categoria: 'Fixacao', ncm: '39269090', custo: 0.09, venda: 0.39, min: 2000 },
  { nome: 'Fechadura Externa Inox', categoria: 'Ferragens', ncm: '83014000', custo: 47.0, venda: 89.0, min: 20 },
  { nome: 'Dobradiça 3" Galvanizada', categoria: 'Ferragens', ncm: '83021000', custo: 6.1, venda: 12.5, min: 60 },
  { nome: 'Telha Fibrocimento 2,44m', categoria: 'Coberturas', ncm: '68118200', custo: 49.0, venda: 79.0, min: 40 },
  { nome: 'Manta Asfaltica 3mm', categoria: 'Impermeabilizacao', ncm: '68071000', custo: 198.0, venda: 289.0, min: 10 },
  { nome: 'Caixa d\'Agua 1000L', categoria: 'Hidraulica', ncm: '39251000', custo: 399.0, venda: 579.0, min: 6 },
  { nome: 'Prego com Cabeca 18x27', categoria: 'Fixacao', ncm: '73170090', custo: 13.0, venda: 21.5, min: 35 },
  { nome: 'Viga de Madeira 5x10', categoria: 'Madeiras', ncm: '44091000', custo: 42.0, venda: 69.0, min: 30 },
  { nome: 'Porta Lisa 80cm', categoria: 'Esquadrias', ncm: '44182000', custo: 199.0, venda: 329.0, min: 12 }
];

function calcularDigitoEan13(base12) {
  const digitos = base12.split('').map(Number);
  const soma = digitos.reduce((acc, digito, index) => {
    return acc + digito * (index % 2 === 0 ? 1 : 3);
  }, 0);
  return (10 - (soma % 10)) % 10;
}

function gerarCodigoBarrasPorNcm(ncm, indice) {
  const prefixoPais = '789';
  const blocoNcm = ncm.slice(0, 4);
  const sequencia = String(indice + 1).padStart(5, '0');
  const base12 = `${prefixoPais}${blocoNcm}${sequencia}`;
  const dv = calcularDigitoEan13(base12);
  return `${base12}${dv}`;
}

function arredondar(valor) {
  return Math.round(valor * 100) / 100;
}

const linhas = Array.from({ length: TOTAL_LINHAS }, (_, i) => {
  const base = catalogoBase[i % catalogoBase.length];
  const variacao = 1 + ((i % 7) - 3) * 0.015;
  const custo = arredondar(base.custo * variacao);
  const venda = arredondar(Math.max(custo * 1.22, base.venda * variacao));
  const quantidade = Math.max(1, Math.floor(base.min * (1 + ((i % 9) - 4) * 0.12)));

  return {
    nome: `${base.nome} - Lote ${String(i + 1).padStart(3, '0')}`,
    categoria: base.categoria,
    ncm: base.ncm,
    preco_custo: custo,
    preco_venda: venda,
    quantidade,
    estoque_minimo: base.min,
    codigo_barras: gerarCodigoBarrasPorNcm(base.ncm, i)
  };
});

const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(linhas, {
  header: ['nome', 'categoria', 'ncm', 'preco_custo', 'preco_venda', 'quantidade', 'estoque_minimo', 'codigo_barras']
});

XLSX.utils.book_append_sheet(wb, ws, 'entrada_estoque');

const outputPath = path.join(process.cwd(), 'database', 'entrada_estoque_materiais_construcao_120_linhas.xlsx');
XLSX.writeFile(wb, outputPath);

console.log(`Arquivo gerado: ${outputPath}`);
console.log(`Total de linhas: ${linhas.length}`);
