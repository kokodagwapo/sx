/* eslint-disable */
'use strict';

/**
 * parseExcel.cjs — Convert ConvertedData XLSX → real JSON data files
 * Run: node scripts/parseExcel.cjs
 */
const XLSX = require('../node_modules/xlsx');
const fs   = require('fs');
const path = require('path');

const XLSX_PATH = path.join(__dirname, '../attached_assets/ConvertedData_1772557931230.xlsx');
const REAL_DIR  = path.join(__dirname, '../client/src/data/real');
fs.mkdirSync(REAL_DIR, { recursive: true });

// ─── Load workbook ────────────────────────────────────────────────────────────
const wb  = XLSX.readFile(XLSX_PATH);
const ws  = wb.Sheets['Results'];
const raw = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });

const HEADERS = raw[0];
console.log('Columns:', HEADERS.length, '| Data rows:', raw.length - 1);

// Build column-name → index map (first occurrence)
const COL = {};
HEADERS.forEach((h, i) => { if (h && !COL[h]) COL[h] = i; });

// ─── Helpers ──────────────────────────────────────────────────────────────────
function serialToDate(serial) {
  if (!serial || typeof serial !== 'number') return '';
  const ms = (serial - 25569) * 86400 * 1000;
  const d  = new Date(ms);
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()}/${d.getUTCFullYear()}`;
}

function normaliseProduct(raw) {
  if (!raw) return '30FRM';
  const s = String(raw).trim();
  if (/^5[/\-]?1/i.test(s) || s === '51') return '5/1 ARM';
  if (/^7[/\-]?1/i.test(s) || s === '71') return '7/1 ARM';
  if (s.includes('15')) return '15FRM';
  return '30FRM';
}

function assignStatus(tvm, idx) {
  const num    = parseInt(String(tvm).replace(/\D/g, '').slice(-6) || '0') + idx * 7;
  const bucket = num % 100;
  if (bucket < 55) return 'Available';
  if (bucket < 76) return 'Allocated';
  if (bucket < 89) return 'Committed';
  return 'Sold';
}

const BUYER_IDS = ['BNK-001', 'BNK-002', 'BNK-003', 'CU-001', 'INS-001'];
let buyerCounter = 0;

// Find column indices for columns with duplicate-ish names
const colBase  = HEADERS.findIndex((h) => h === 'Base Price');
const colBuyup = HEADERS.findIndex((h) => h && String(h).trim() === "Buyup/ Buy Down Adjuster ");
const colLlpa  = HEADERS.findIndex((h) => h === 'LTV/FICO Adjuster');
const colFinal = HEADERS.findIndex((h) => h === 'Final Price');
// Second "Investment Property" occurrence (first is "Self-Employed" check, second is LLPA adjuster column)
const colInvLlpa = (() => {
  let count = 0;
  for (let i = 0; i < HEADERS.length; i++) {
    if (HEADERS[i] === 'Investment Property') { count++; if (count === 2) return i; }
  }
  return -1;
})();
const colSelfLlpa = HEADERS.findIndex((h) => h === 'Self Employed');
const colIncome   = HEADERS.lastIndexOf('Estimated Annual Income');

console.log('Key col indices → basePrice:', colBase, 'finalPrice:', colFinal, 'buyup:', colBuyup, 'llpa:', colLlpa);

// ─── Parse loans ──────────────────────────────────────────────────────────────
const loans = [];

for (let i = 1; i < raw.length; i++) {
  const row = raw[i];
  const tvm = row[0];
  if (!tvm || String(tvm).trim() === '') continue;

  const ltv        = row[COL['LTV']];
  const cltv       = row[COL['CLTV']];
  const dti        = row[COL['DTI']];
  const rate       = row[COL['InterestRate']];
  const upb        = row[COL['UPB']];
  const loanAmount = row[COL['LoanAmount']];
  const fico       = row[COL['FICO']];
  const source     = row[COL['Source']] || 'Provident';
  const units      = row[COL['Units']]  || 1;
  const occ        = row[COL['Occupancy']] || 'Owner';
  const propType   = row[COL['Property Type']] || 'SFR';
  const propAddr   = row[COL['Property Address']] || '';
  const city       = row[COL['City']] || '';
  const county     = row[COL['County']] || '';
  const state      = row[COL['State']] || '';
  const zip        = row[COL['Zip']] != null ? String(row[COL['Zip']]) : '';
  const term       = row[COL['Term']] || 360;
  const purpose    = row[COL['Purpose']] || 'Refinance';

  const ltvPct  = typeof ltv  === 'number' ? parseFloat((ltv  * 100).toFixed(4)) : 0;
  const cltvPct = typeof cltv === 'number' ? parseFloat((cltv * 100).toFixed(4)) : ltvPct;
  const dtiPct  = typeof dti  === 'number' ? parseFloat((dti  * 100).toFixed(4)) : 0;

  const product  = normaliseProduct(row[COL['Product Type']]);
  const loanType = (product === '5/1 ARM' || product === '7/1 ARM') ? 'ARM' : 'Conventional';

  const firstPayDate = serialToDate(row[COL['FirstPaymentDate']]);

  const lienRaw      = row[COL['Lien Position']];
  const lienPosition = (lienRaw && String(lienRaw).trim()) || '1st';

  const r = typeof rate === 'number' ? rate : 0;
  let interestRate = '4.5+';
  if      (r < 3)   interestRate = '< 3';
  else if (r < 3.5) interestRate = '3–3.5';
  else if (r < 4)   interestRate = '3.5–4';
  else if (r < 4.5) interestRate = '4–4.5';

  const status   = assignStatus(tvm, i);
  const buyerId  = (status !== 'Available') ? BUYER_IDS[buyerCounter++ % BUYER_IDS.length] : undefined;

  const basePrice  = colBase  >= 0 ? (row[colBase]  ?? null) : null;
  const priceAdj   = colBuyup >= 0 ? (row[colBuyup] ?? null) : null;
  const ltvFicoAdj = colLlpa  >= 0 ? (row[colLlpa]  ?? null) : null;
  const finalPrice = colFinal >= 0 ? (row[colFinal] ?? null) : null;
  const invLlpa    = colInvLlpa  >= 0 ? (row[colInvLlpa]  || 0) : 0;
  const selfLlpa   = colSelfLlpa >= 0 ? (row[colSelfLlpa] || 0) : 0;
  const otherLlpas = parseFloat((invLlpa + selfLlpa).toFixed(6));

  const estimatedIncome = colIncome >= 0 ? Math.round(row[colIncome] || 0) : 0;

  const loan = {
    id:              String(tvm).trim(),
    tvm:             String(tvm).trim(),
    source,
    loanAmount:      Math.round(loanAmount || upb || 0),
    upb:             Math.round(upb || loanAmount || 0),
    rate:            r,
    coupon:          r,
    firstPaymentDate: firstPayDate,
    purpose,
    fico:            typeof fico === 'number' ? Math.round(fico) : 700,
    ltv:             ltvPct,
    cltv:            cltvPct,
    dti:             dtiPct,
    occupancy:       occ,
    propertyAddress: propAddr,
    city,
    county,
    state,
    zip,
    propertyType:    propType,
    units:           typeof units === 'number' ? Math.round(units) : 1,
    product,
    productType:     product,
    loanType,
    interestRate,
    term:            typeof term === 'number' ? Math.round(term) : 360,
    lienPosition,
    status,
    ...(buyerId ? { buyerId } : {}),
    basePrice:       typeof basePrice  === 'number' ? parseFloat(basePrice.toFixed(6))  : null,
    ltvFicoAdj:      typeof ltvFicoAdj === 'number' ? parseFloat(ltvFicoAdj.toFixed(6)) : null,
    priceAdj:        typeof priceAdj   === 'number' ? parseFloat(priceAdj.toFixed(6))   : null,
    otherLlpas,
    finalPrice:      typeof finalPrice === 'number' ? parseFloat(finalPrice.toFixed(6)) : null,
    estimatedIncome,
  };

  loans.push(loan);
}

console.log(`Parsed ${loans.length} loans`);

// ─── realLoans.json ───────────────────────────────────────────────────────────
fs.writeFileSync(path.join(REAL_DIR, 'realLoans.json'), JSON.stringify(loans));
console.log('✓ realLoans.json written');

// ─── Compute realStats.json ───────────────────────────────────────────────────
const totalUpb = loans.reduce((s, l) => s + l.upb, 0);
const waRate   = loans.reduce((s, l) => s + l.rate   * l.upb, 0) / totalUpb;
const waLtv    = loans.reduce((s, l) => s + l.ltv    * l.upb, 0) / totalUpb;
const waFico   = loans.reduce((s, l) => s + l.fico   * l.upb, 0) / totalUpb;
const waDti    = loans.reduce((s, l) => s + l.dti    * l.upb, 0) / totalUpb;
const priceLoans = loans.filter(l => l.finalPrice);
const waPrice  = priceLoans.reduce((s,l)=>s+l.finalPrice*l.upb,0) /
                 priceLoans.reduce((s,l)=>s+l.upb,0);

function upbBy(key) {
  const m = {};
  for (const l of loans) {
    const v = l[key] || 'Unknown';
    if (!m[v]) m[v] = { count: 0, upb: 0 };
    m[v].count++;
    m[v].upb += l.upb;
  }
  return m;
}
function countBy(key) {
  const m = {};
  for (const l of loans) { const v = l[key] || 'Unknown'; m[v] = (m[v] || 0) + 1; }
  return m;
}

// Distribution buckets
const ficoBuckets = {'<620':0,'620-639':0,'640-659':0,'660-679':0,'680-699':0,'700-719':0,'720-739':0,'740-759':0,'760-779':0,'780+':0};
for (const l of loans) {
  const f = l.fico;
  if      (f < 620) ficoBuckets['<620']++;
  else if (f < 640) ficoBuckets['620-639']++;
  else if (f < 660) ficoBuckets['640-659']++;
  else if (f < 680) ficoBuckets['660-679']++;
  else if (f < 700) ficoBuckets['680-699']++;
  else if (f < 720) ficoBuckets['700-719']++;
  else if (f < 740) ficoBuckets['720-739']++;
  else if (f < 760) ficoBuckets['740-759']++;
  else if (f < 780) ficoBuckets['760-779']++;
  else              ficoBuckets['780+']++;
}

const ltvBuckets = {'<60':0,'60-64.9':0,'65-69.9':0,'70-74.9':0,'75-79.9':0,'80-84.9':0,'85-89.9':0,'90-94.9':0,'95+':0};
for (const l of loans) {
  const v = l.ltv;
  if      (v < 60) ltvBuckets['<60']++;
  else if (v < 65) ltvBuckets['60-64.9']++;
  else if (v < 70) ltvBuckets['65-69.9']++;
  else if (v < 75) ltvBuckets['70-74.9']++;
  else if (v < 80) ltvBuckets['75-79.9']++;
  else if (v < 85) ltvBuckets['80-84.9']++;
  else if (v < 90) ltvBuckets['85-89.9']++;
  else if (v < 95) ltvBuckets['90-94.9']++;
  else             ltvBuckets['95+']++;
}

const dtiBuckets = {'<20':0,'20-24':0,'25-29':0,'30-34':0,'35-39':0,'40-44':0,'45+':0};
for (const l of loans) {
  const v = l.dti;
  if      (v < 20) dtiBuckets['<20']++;
  else if (v < 25) dtiBuckets['20-24']++;
  else if (v < 30) dtiBuckets['25-29']++;
  else if (v < 35) dtiBuckets['30-34']++;
  else if (v < 40) dtiBuckets['35-39']++;
  else if (v < 45) dtiBuckets['40-44']++;
  else             dtiBuckets['45+']++;
}

const rateBuckets = {'<3':0,'3-3.49':0,'3.5-3.99':0,'4-4.49':0,'4.5-4.99':0,'5-5.49':0,'5.5+':0};
for (const l of loans) {
  const v = l.rate;
  if      (v < 3)   rateBuckets['<3']++;
  else if (v < 3.5) rateBuckets['3-3.49']++;
  else if (v < 4)   rateBuckets['3.5-3.99']++;
  else if (v < 4.5) rateBuckets['4-4.49']++;
  else if (v < 5)   rateBuckets['4.5-4.99']++;
  else if (v < 5.5) rateBuckets['5-5.49']++;
  else              rateBuckets['5.5+']++;
}

const stats = {
  totalLoans:       loans.length,
  totalUpb:         Math.round(totalUpb),
  waRate:           parseFloat(waRate.toFixed(4)),
  waLtv:            parseFloat(waLtv.toFixed(2)),
  waFico:           Math.round(waFico),
  waDti:            parseFloat(waDti.toFixed(2)),
  waPrice:          parseFloat(waPrice.toFixed(3)),
  avgBalance:       Math.round(totalUpb / loans.length / 1000),
  byState:          upbBy('state'),
  byProduct:        countBy('product'),
  byOccupancy:      countBy('occupancy'),
  byPurpose:        countBy('purpose'),
  bySource:         upbBy('source'),
  byStatus:         countBy('status'),
  ficoDistribution: ficoBuckets,
  ltvDistribution:  ltvBuckets,
  dtiDistribution:  dtiBuckets,
  rateDistribution: rateBuckets,
};

fs.writeFileSync(path.join(REAL_DIR, 'realStats.json'), JSON.stringify(stats, null, 2));
console.log('✓ realStats.json written');
console.log(`  totalUpb=$${(totalUpb/1e9).toFixed(3)}B | waRate=${waRate.toFixed(4)}% | waFico=${Math.round(waFico)} | waLtv=${waLtv.toFixed(2)}%`);

// ─── step7Sample.json — 200 representative loans ──────────────────────────────
const sources = ['Provident', 'Stonegate', 'New Penn Financial'];
const sample  = [];

for (const src of sources) {
  const srcLoans = loans.filter(l => l.source === src);
  const need     = Math.round((srcLoans.length / loans.length) * 200);
  const sorted   = [...srcLoans].sort((a, b) => a.state.localeCompare(b.state));
  const step     = Math.max(1, Math.floor(sorted.length / need));
  let added = 0;
  for (let i = 0; i < sorted.length && added < need; i += step) {
    sample.push(sorted[i]);
    added++;
  }
}

const sample200 = sample.slice(0, 200);
fs.writeFileSync(path.join(REAL_DIR, 'step7Sample.json'), JSON.stringify(sample200));
console.log(`✓ step7Sample.json written (${sample200.length} loans)`);

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log('\nStatus:', stats.byStatus);
console.log('Products:', stats.byProduct);
console.log('Top 5 states:', Object.entries(stats.byState).sort((a,b)=>b[1].count-a[1].count).slice(0,5).map(([s,v])=>`${s}:${v.count}`).join(' | '));
console.log('FICO dist:', stats.ficoDistribution);
console.log('DTI dist:', stats.dtiDistribution);
