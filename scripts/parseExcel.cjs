/* eslint-disable */
'use strict';

const XLSX = require('../node_modules/xlsx');
const fs = require('fs');
const path = require('path');

const EXCEL_PATH = path.join(__dirname, '../attached_assets/ConvertedData_1772557931230.xlsx');
const OUT_DIR = path.join(__dirname, '../client/src/data/real');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const wb = XLSX.readFile(EXCEL_PATH);
const ws = wb.Sheets['Results'];
const rawRows = XLSX.utils.sheet_to_json(ws, { defval: '' });

function g(r, k) {
  const v = r[k];
  return (typeof v === 'string' ? v : String(v || '')).trim();
}
function n(r, k) { return parseFloat(r[k]) || 0; }

function excelDate(serial) {
  if (!serial || isNaN(serial)) return '';
  const d = new Date((serial - 25569) * 86400 * 1000);
  return (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear();
}

function normalizeProduct(p) {
  if (p === '51') return '5/1 ARM';
  if (p === '71') return '7/1 ARM';
  return p; // 30FRM, 15FRM pass through
}

function normalizeOccupancy(o) {
  if (o === 'Owner') return 'Owner';
  if (o === 'Investment') return 'Investment';
  if (o === 'Second Home') return 'Second Home';
  return o || 'Owner';
}

function normalizePurpose(p) {
  if (p === 'Refinance') return 'Refinance';
  if (p === 'Purchase') return 'Purchase';
  return 'Refinance';
}

// Deterministic status assignment: Available 55%, Allocated 21%, Committed 13%, Sold 11%
// Totals: 3878 Available, 1481 Allocated, 917 Committed, 774 Sold (out of 7050)
const STATUS_THRESHOLDS = [0.55, 0.76, 0.89, 1.0]; // cumulative
const STATUSES = ['Available', 'Allocated', 'Committed', 'Sold'];
const BUYER_IDS = ['BNK-001', 'BNK-002', 'BNK-003', 'CU-001', 'INS-001'];

function seededRand(seed) {
  let s = seed;
  return function() {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

// Build full loan array
const loans = [];
let idx = 0;
for (const r of rawRows) {
  const upb = n(r, 'UPB');
  if (upb <= 0) continue;

  const rng = seededRand(idx * 7919 + 1234);
  const rv = rng();
  let status = 'Available';
  let buyerId;
  for (let i = 0; i < STATUS_THRESHOLDS.length; i++) {
    if (rv < STATUS_THRESHOLDS[i]) { status = STATUSES[i]; break; }
  }
  if (status !== 'Available') {
    const bi = Math.floor(rng() * BUYER_IDS.length);
    buyerId = BUYER_IDS[bi];
  }

  // Calculate LLPA other adjustments
  const investmentPropLlpa = n(r, 'Investment Property');
  const selfEmpLlpa = n(r, 'Self Employed');
  const gt4Financed = n(r, '> 4 Financed Properties (a)');
  const twoUnit = n(r, '2 - Unit');
  const threeFourUnit = n(r, '3 - 4 Unit');
  const condo = n(r, 'Condo w/ Term > 15 Year');
  const otherLlpas = +(investmentPropLlpa + selfEmpLlpa + gt4Financed + twoUnit + threeFourUnit + condo).toFixed(4);

  const loan = {
    tvm: g(r, 'TVMA Inventory #'),
    source: g(r, 'Source') || 'Provident',
    loanAmount: Math.round(n(r, 'LoanAmount')),
    upb: Math.round(upb),
    rate: +n(r, 'InterestRate').toFixed(4),
    firstPaymentDate: excelDate(n(r, 'FirstPaymentDate')),
    purpose: normalizePurpose(g(r, 'Purpose')),
    fico: Math.round(n(r, 'FICO')),
    ltv: +( n(r, 'LTV') * 100).toFixed(2),
    cltv: +(n(r, 'CLTV') * 100).toFixed(2),
    dti: +(n(r, 'DTI') * 100).toFixed(2),
    occupancy: normalizeOccupancy(g(r, 'Occupancy')),
    propertyAddress: g(r, 'Property Address'),
    city: g(r, 'City'),
    county: g(r, 'County'),
    state: g(r, 'State'),
    zip: g(r, 'Zip'),
    propertyType: g(r, 'Property Type') || 'Single-Family',
    units: Math.round(n(r, 'Units')) || 1,
    productType: normalizeProduct(g(r, 'Product Type')),
    term: Math.round(n(r, 'Term')) || 360,
    lienPosition: g(r, 'Lien Position') || '1st',
    status,
    basePrice: +n(r, 'Base Price').toFixed(4),
    ltvFicoAdj: +n(r, 'LTV/FICO Adjuster').toFixed(4),
    priceAdj: +n(r, 'Buyup/ Buy Down Adjuster ').toFixed(4),
    otherLlpas: +otherLlpas.toFixed(4),
    finalPrice: +n(r, 'Final Price').toFixed(4),
    estimatedIncome: +n(r, 'Estimated Annual Income').toFixed(2),
  };
  if (buyerId) loan.buyerId = buyerId;

  loans.push(loan);
  idx++;
}

console.log('Total loans parsed:', loans.length);

// ---- Compute stats ----
let totalUpb = 0, ficoWSum = 0, ltvWSum = 0, dtiWSum = 0, rateWSum = 0, priceWSum = 0;
const byState = {};
const byProduct = {};
const byOccupancy = {};
const byPurpose = {};
const bySource = {};
const byStatus = {};
const ficoR = { '<620': 0, '620-639': 0, '640-659': 0, '660-679': 0, '680-699': 0, '700-719': 0, '720-739': 0, '740-759': 0, '760-779': 0, '780+': 0 };
const ltvR = { '<60': 0, '60-64.9': 0, '65-69.9': 0, '70-74.9': 0, '75-79.9': 0, '80-84.9': 0, '85-89.9': 0, '90-94.9': 0, '95+': 0 };
const dtiR = { '<20': 0, '20-24': 0, '25-29': 0, '30-34': 0, '35-39': 0, '40-44': 0, '45+': 0 };
const rateR = { '<3': 0, '3-3.49': 0, '3.5-3.99': 0, '4-4.49': 0, '4.5-4.99': 0, '5-5.49': 0, '5.5+': 0 };

for (const L of loans) {
  totalUpb += L.upb;
  ficoWSum += L.fico * L.upb;
  ltvWSum += L.ltv * L.upb;
  dtiWSum += L.dti * L.upb;
  rateWSum += L.rate * L.upb;
  priceWSum += L.finalPrice * L.upb;

  byState[L.state] = byState[L.state] || { count: 0, upb: 0 };
  byState[L.state].count++;
  byState[L.state].upb += L.upb;

  byProduct[L.productType] = (byProduct[L.productType] || 0) + 1;
  byOccupancy[L.occupancy] = (byOccupancy[L.occupancy] || 0) + 1;
  byPurpose[L.purpose] = (byPurpose[L.purpose] || 0) + 1;
  byStatus[L.status] = (byStatus[L.status] || 0) + 1;

  bySource[L.source] = bySource[L.source] || { count: 0, upb: 0 };
  bySource[L.source].count++;
  bySource[L.source].upb += L.upb;

  const fico = L.fico, ltv = L.ltv, dti = L.dti, rate = L.rate;
  if (fico < 620) ficoR['<620']++;
  else if (fico < 640) ficoR['620-639']++;
  else if (fico < 660) ficoR['640-659']++;
  else if (fico < 680) ficoR['660-679']++;
  else if (fico < 700) ficoR['680-699']++;
  else if (fico < 720) ficoR['700-719']++;
  else if (fico < 740) ficoR['720-739']++;
  else if (fico < 760) ficoR['740-759']++;
  else if (fico < 780) ficoR['760-779']++;
  else ficoR['780+']++;

  if (ltv < 60) ltvR['<60']++;
  else if (ltv < 65) ltvR['60-64.9']++;
  else if (ltv < 70) ltvR['65-69.9']++;
  else if (ltv < 75) ltvR['70-74.9']++;
  else if (ltv < 80) ltvR['75-79.9']++;
  else if (ltv < 85) ltvR['80-84.9']++;
  else if (ltv < 90) ltvR['85-89.9']++;
  else if (ltv < 95) ltvR['90-94.9']++;
  else ltvR['95+']++;

  if (dti < 20) dtiR['<20']++;
  else if (dti < 25) dtiR['20-24']++;
  else if (dti < 30) dtiR['25-29']++;
  else if (dti < 35) dtiR['30-34']++;
  else if (dti < 40) dtiR['35-39']++;
  else if (dti < 45) dtiR['40-44']++;
  else dtiR['45+']++;

  if (rate < 3) rateR['<3']++;
  else if (rate < 3.5) rateR['3-3.49']++;
  else if (rate < 4) rateR['3.5-3.99']++;
  else if (rate < 4.5) rateR['4-4.49']++;
  else if (rate < 5) rateR['4.5-4.99']++;
  else if (rate < 5.5) rateR['5-5.49']++;
  else rateR['5.5+']++;
}

const realStats = {
  totalLoans: loans.length,
  totalUpb: Math.round(totalUpb),
  waRate: +(rateWSum / totalUpb).toFixed(4),
  waLtv: +(ltvWSum / totalUpb).toFixed(2),
  waFico: Math.round(ficoWSum / totalUpb),
  waDti: +(dtiWSum / totalUpb).toFixed(2),
  waPrice: +(priceWSum / totalUpb).toFixed(4),
  avgBalance: Math.round(totalUpb / loans.length / 1000),
  byState,
  byProduct,
  byOccupancy,
  byPurpose,
  bySource,
  byStatus,
  ficoDistribution: ficoR,
  ltvDistribution: ltvR,
  dtiDistribution: dtiR,
  rateDistribution: rateR,
};

console.log('Stats:', JSON.stringify({
  totalLoans: realStats.totalLoans,
  totalUpb: realStats.totalUpb,
  waRate: realStats.waRate,
  waLtv: realStats.waLtv,
  waFico: realStats.waFico,
  waDti: realStats.waDti,
  waPrice: realStats.waPrice,
  avgBalance: realStats.avgBalance,
  byStatus: realStats.byStatus,
}));

// ---- Write realStats.json ----
fs.writeFileSync(path.join(OUT_DIR, 'realStats.json'), JSON.stringify(realStats, null, 2));
console.log('Written: realStats.json');

// ---- Write realLoans.json ----
fs.writeFileSync(path.join(OUT_DIR, 'realLoans.json'), JSON.stringify(loans));
console.log('Written: realLoans.json (' + loans.length + ' loans)');

// ---- Build step7Sample.json — 200 representative loans ----
// Sample proportionally: ~85 Provident, ~27 Stonegate, ~88 New Penn
function sampleBySource(source, count) {
  const pool = loans.filter(l => l.source === source);
  const step = Math.floor(pool.length / count);
  const result = [];
  for (let i = 0; i < count && i * step < pool.length; i++) {
    result.push(pool[i * step]);
  }
  return result;
}

const provSample = sampleBySource('Provident', 85);
const stoneSample = sampleBySource('Stonegate', 27);
const newPennSample = sampleBySource('New Penn Financial', 88);
const step7Sample = [...provSample, ...stoneSample, ...newPennSample].slice(0, 200);

fs.writeFileSync(path.join(OUT_DIR, 'step7Sample.json'), JSON.stringify(step7Sample));
console.log('Written: step7Sample.json (' + step7Sample.length + ' loans)');

// ---- Build step4Sample.json — first 50 loans with non-zero basePrice ----
const step4Sample = loans.filter(l => l.basePrice > 0).slice(0, 50);
fs.writeFileSync(path.join(OUT_DIR, 'step4Sample.json'), JSON.stringify(step4Sample));
console.log('Written: step4Sample.json (' + step4Sample.length + ' loans)');

console.log('Done!');
