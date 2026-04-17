import {Bid} from '../utils/types';
import {formatCurrency, formatDate} from '../utils/calculations';
import RNFS from 'react-native-fs';

const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 380">
  <defs>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#FFE080"/>
      <stop offset="100%" style="stop-color:#B8860B"/>
    </linearGradient>
    <linearGradient id="goldH" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#FFE080"/>
      <stop offset="50%" style="stop-color:#D4A017"/>
      <stop offset="100%" style="stop-color:#7A5800"/>
    </linearGradient>
  </defs>
  <polygon points="160,24 300,132 300,216 20,216 20,132" fill="none" stroke="url(#gold)" stroke-width="3.5" stroke-linejoin="round"/>
  <polygon points="160,46 278,136 278,204 42,204 42,136" fill="none" stroke="url(#gold)" stroke-width="1" stroke-linejoin="round" opacity="0.35"/>
  <rect x="20" y="212" width="280" height="6" rx="2" fill="url(#gold)"/>
  <rect x="72" y="112" width="14" height="76" fill="#111"/>
  <rect x="58" y="112" width="28" height="5" fill="#111"/>
  <rect x="58" y="183" width="28" height="5" fill="#111"/>
  <rect x="234" y="112" width="14" height="76" fill="#111"/>
  <rect x="222" y="112" width="28" height="5" fill="#111"/>
  <rect x="222" y="183" width="28" height="5" fill="#111"/>
  <polygon points="86,112 114,112 248,188 234,188" fill="#111"/>
  <text x="160" y="268" font-family="Georgia,serif" font-size="52" letter-spacing="14" text-anchor="middle" fill="#111">NOVA</text>
  <rect x="30" y="278" width="260" height="1.2" fill="url(#goldH)"/>
  <text x="160" y="306" font-family="Arial,sans-serif" font-weight="300" font-size="16" letter-spacing="12" text-anchor="middle" fill="#666">BUILDERS</text>
  <polygon points="160,324 166,332 160,340 154,332" fill="url(#gold)"/>
</svg>`;

export function generateBidHTML(bid: Bid): string {
  const includedDivisions = bid.divisions.filter(d => d.included);

  const divisionRows = includedDivisions
    .map(
      d => `
    <tr style="border-bottom:1px solid #ede8e0;">
      <td style="padding:9px 14px; font-size:13px; color:#1c1c1c;">${d.label}</td>
      <td style="padding:9px 14px; text-align:right; font-weight:500; font-size:13px;">${formatCurrency(d.directCost)}</td>
    </tr>`,
    )
    .join('');

  const drawAmount = bid.grandTotal / 5;
  const drawRows = [
    ['1', 'Contract execution & mobilization'],
    ['2', 'Foundation & slab complete + passed inspection'],
    ['3', 'Framing, sheathing & roofing rough-in complete'],
    ['4', 'Rough MEP, siding, windows & deck complete'],
    ['5', 'Final inspection passed, punch list complete'],
  ]
    .map(
      ([n, label]) => `
    <tr style="border-bottom:1px solid #ede8e0;">
      <td style="padding:8px 14px; font-weight:700; color:#B8860B;">${n}</td>
      <td style="padding:8px 14px; font-size:13px;">${label}</td>
      <td style="padding:8px 14px; text-align:right; font-weight:500;">${formatCurrency(drawAmount)}</td>
      <td style="padding:8px 14px; text-align:right; color:#aaa; font-size:12px;">${Number(n) * 20}%</td>
    </tr>`,
    )
    .join('');

  const logoB64 = Buffer.from(LOGO_SVG).toString('base64');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Nova Builders – ${bid.bidNumber}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:Arial,Helvetica,sans-serif; background:#f9f7f4; color:#1c1c1c; font-size:10pt; line-height:1.6; }
  .header { background:#fff; border-bottom:4px solid #B8860B; padding:28px 48px; display:flex; justify-content:space-between; align-items:center; }
  .co-block .name { font-family:Georgia,serif; font-size:24pt; font-weight:600; letter-spacing:3px; }
  .co-block .tagline { font-size:8pt; color:#888; letter-spacing:2px; text-transform:uppercase; margin-top:3px; }
  .co-block .contact { font-size:9pt; color:#555; margin-top:5px; }
  .co-block .lic { font-size:8pt; color:#aaa; margin-top:2px; }
  .bid-box { background:#1c1c1c; color:#fff; padding:14px 20px; border-radius:4px; text-align:right; }
  .bid-box .lbl { font-size:7pt; letter-spacing:3px; text-transform:uppercase; color:#B8860B; }
  .bid-box .num { font-size:13pt; font-weight:700; margin-top:3px; }
  .bid-box .dt  { font-size:8pt; color:#aaa; margin-top:5px; }
  .gold-bar { height:2px; background:linear-gradient(90deg,#FFE080,#B8860B,#7A5800); }
  .section { padding:22px 48px; background:#fff; margin-bottom:2px; }
  .section-gray { background:#f9f7f4; }
  h2 { font-family:Georgia,serif; font-size:13pt; font-weight:500; color:#1c1c1c; letter-spacing:2px; text-transform:uppercase; border-bottom:1px solid #e0d9ce; padding-bottom:7px; margin-bottom:14px; }
  .proj-grid { display:grid; grid-template-columns:1fr 1fr; gap:6px 40px; }
  .proj-row { display:flex; gap:8px; padding:4px 0; border-bottom:1px dotted #e8e2d9; font-size:9pt; }
  .pl { color:#999; min-width:120px; font-size:8.5pt; text-transform:uppercase; letter-spacing:0.5px; }
  .pv { font-weight:500; }
  .scope-text { font-size:9.5pt; color:#444; background:#f9f7f4; border-left:3px solid #B8860B; padding:12px 16px; border-radius:0 4px 4px 0; line-height:1.7; }
  table { width:100%; border-collapse:collapse; font-size:9pt; }
  thead tr { background:#1c1c1c; }
  thead th { padding:9px 14px; text-align:left; color:#B8860B; font-weight:500; font-size:8pt; text-transform:uppercase; letter-spacing:1.5px; }
  thead th.r { text-align:right; }
  .div-row { background:#f0ece4; border-top:1px solid #d4c9b0; }
  .grand-row td { background:#1c1c1c; color:#FFE080; font-weight:700; font-size:11pt; padding:12px 14px; }
  .oh-row td { background:#fef9ec; color:#92650a; font-style:italic; border-top:1px solid #f0d88a; padding:9px 14px; }
  .pf-row td { background:#f0f9ec; color:#2d6a1f; font-style:italic; border-top:1px solid #b6e0a0; padding:9px 14px; }
  .total-box { background:#1c1c1c; color:#fff; border-radius:6px; padding:24px 28px; margin-top:14px; display:flex; justify-content:space-between; align-items:center; }
  .logic-box { display:flex; gap:0; margin-top:12px; border:1px solid #e0d9ce; border-radius:4px; overflow:hidden; }
  .logic-item { flex:1; text-align:center; padding:10px; border-right:1px solid #e0d9ce; }
  .logic-item:last-child { border-right:none; }
  .li-label { font-size:7.5pt; color:#999; text-transform:uppercase; letter-spacing:1px; }
  .li-val { font-size:13pt; font-weight:700; color:#1c1c1c; margin-top:4px; font-family:Georgia,serif; }
  .li-pct { font-size:8.5pt; color:#B8860B; margin-top:2px; }
  .terms li { padding:4px 0 4px 18px; position:relative; border-bottom:1px dotted #e8e2d9; font-size:9pt; color:#555; list-style:none; }
  .terms li::before { content:"›"; position:absolute; left:4px; color:#B8860B; }
  .sig-grid { display:grid; grid-template-columns:1fr 1fr; gap:32px; margin-top:14px; }
  .sig-line { border-bottom:1px solid #1c1c1c; height:38px; margin:12px 0 4px; }
  .sig-label { font-size:8pt; color:#999; }
  .footer { background:#1c1c1c; color:#666; padding:12px 48px; font-size:8pt; display:flex; justify-content:space-between; }
  .footer .gold { color:#B8860B; }
</style>
</head>
<body>

<div class="header">
  <div style="display:flex; align-items:center; gap:18px;">
    <img src="data:image/svg+xml;base64,${logoB64}" width="64" height="auto" alt="Nova Builders">
    <div class="co-block">
      <div class="name">NOVA BUILDERS</div>
      <div class="tagline">Licensed General Contractor · Utah Area</div>
      <div class="contact">📞 801-918-1236 · novabuilders@yahoo.com</div>
      <div class="contact">Isai Tapia · Project Manager</div>
      <div class="lic">Contractor Lic. No. 14271957-5501 · Fully Insured & Bonded</div>
    </div>
  </div>
  <div class="bid-box">
    <div class="lbl">Bid Proposal</div>
    <div class="num">${bid.bidNumber}</div>
    <div class="dt">Issued: ${formatDate(bid.createdAt)}<br>Valid through: 30 days</div>
  </div>
</div>
<div class="gold-bar"></div>

<div class="section">
  <h2>Project Information</h2>
  <div class="proj-grid">
    <div class="proj-row"><span class="pl">Client</span><span class="pv">${bid.clientName}</span></div>
    <div class="proj-row"><span class="pl">Bid Number</span><span class="pv">${bid.bidNumber}</span></div>
    <div class="proj-row"><span class="pl">Address</span><span class="pv">${bid.projectAddress}</span></div>
    <div class="proj-row"><span class="pl">Project Type</span><span class="pv">${bid.projectType}</span></div>
    <div class="proj-row"><span class="pl">Area</span><span class="pv">${bid.squareFeet} SF</span></div>
    <div class="proj-row"><span class="pl">Date</span><span class="pv">${formatDate(bid.createdAt)}</span></div>
    <div class="proj-row"><span class="pl">Project Manager</span><span class="pv">Isai Tapia</span></div>
    <div class="proj-row"><span class="pl">Jurisdiction</span><span class="pv">Utah Area</span></div>
  </div>
</div>

<div class="section section-gray">
  <h2>Scope of Work</h2>
  <div class="scope-text">
    Construction including: ${includedDivisions.map(d => d.label).join(', ')}. All work performed per approved plan set and in accordance with 2021 IBC and local codes.
    ${bid.notes ? '<br><br><strong>Notes:</strong> ' + bid.notes : ''}
    <br><br><strong>Note:</strong> City building permits, plan check fees, and structural engineering are excluded and remain the owner's responsibility.
  </div>
</div>

<div class="section">
  <h2>Bid Summary</h2>
  <p style="font-size:8.5pt; color:#888; margin-bottom:12px;">Pricing includes direct field costs, ${bid.overheadPct}% overhead, and ${bid.profitPct}% contractor profit.</p>
  <table>
    <thead>
      <tr><th>Division / Scope Item</th><th class="r">Amount</th></tr>
    </thead>
    <tbody>
      ${divisionRows}
      <tr class="oh-row">
        <td>Overhead (${bid.overheadPct}%) — G&amp;A, tools, bonding, workers comp, insurance premium</td>
        <td style="text-align:right; font-weight:600; font-style:normal;">Included</td>
      </tr>
      <tr class="pf-row">
        <td>Contractor Profit (${bid.profitPct}%) — Applied on direct costs + overhead</td>
        <td style="text-align:right; font-weight:600; font-style:normal;">Included</td>
      </tr>
      <tr class="grand-row">
        <td style="font-size:11pt; letter-spacing:1px;">TOTAL BID PRICE</td>
        <td style="text-align:right; font-size:14pt; color:#FFE080;">${formatCurrency(bid.grandTotal)}</td>
      </tr>
    </tbody>
  </table>

  <div class="logic-box">
    <div class="logic-item">
      <div class="li-label">Direct Field Costs</div>
      <div class="li-val">${formatCurrency(bid.directTotal)}</div>
      <div class="li-pct">Materials + Labor</div>
    </div>
    <div class="logic-item">
      <div class="li-label">Overhead</div>
      <div class="li-val">${bid.overheadPct}%</div>
      <div class="li-pct">${formatCurrency(Math.round(bid.overheadAmount))} — G&amp;A</div>
    </div>
    <div class="logic-item">
      <div class="li-label">Profit</div>
      <div class="li-val">${bid.profitPct}%</div>
      <div class="li-pct">${formatCurrency(Math.round(bid.profitAmount))} — Contractor fee</div>
    </div>
  </div>

  <div class="total-box">
    <div>
      <div style="font-weight:500; font-size:11pt; margin-bottom:4px;">${bid.clientName} — ${bid.projectType}</div>
      <div style="color:#aaa; font-size:9pt;">${bid.projectAddress}</div>
      <div style="color:#666; font-size:8.5pt; margin-top:6px;">Permits &amp; engineering by owner · Est. duration per scope</div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:8pt; color:#B8860B; text-transform:uppercase; letter-spacing:2px;">Total Project Bid</div>
      <div style="font-size:28pt; font-weight:700; color:#FFE080; letter-spacing:1px;">${formatCurrency(bid.grandTotal)}</div>
      <div style="font-size:7.5pt; color:#666; margin-top:5px;">Includes ${bid.overheadPct}% overhead + ${bid.profitPct}% profit</div>
    </div>
  </div>
</div>

<div class="section section-gray">
  <h2>Payment Schedule</h2>
  <table>
    <thead><tr><th style="width:8%">Draw</th><th>Milestone</th><th class="r" style="width:14%">Amount</th><th class="r" style="width:10%">%</th></tr></thead>
    <tbody>${drawRows}</tbody>
  </table>
</div>

<div class="section">
  <h2>Clarifications &amp; Exclusions</h2>
  <ul class="terms">
    <li>City building permits, plan check fees, and inspection fees are excluded — owner pays directly.</li>
    <li>Structural engineering drawings and stamped calculations are excluded — owner to arrange separately.</li>
    <li>Any owner-initiated changes will be handled via written change order prior to additional work.</li>
    <li>Hazardous materials discovered during demolition addressed via separate change order.</li>
    <li>Utility company connection or relocation fees are excluded.</li>
    <li>Bid valid 30 days from issue date. Material costs subject to adjustment if contract not executed within this period.</li>
    <li>Landscaping, irrigation, and re-seeding beyond construction footprint are excluded.</li>
  </ul>
</div>

<div class="section section-gray">
  <h2>Acceptance &amp; Authorization</h2>
  <p style="font-size:9pt; color:#555; margin-bottom:14px;">By signing below, the Owner accepts this proposal and authorizes Nova Builders to proceed upon receipt of Draw 1 payment.</p>
  <div class="sig-grid">
    <div>
      <strong>NOVA BUILDERS — General Contractor</strong>
      <div style="font-size:8.5pt; color:#888; margin-top:2px;">Isai Tapia · Project Manager</div>
      <div class="sig-line"></div>
      <div class="sig-label">Signature &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Date</div>
    </div>
    <div>
      <strong>OWNER — ${bid.clientName}</strong>
      <div style="font-size:8.5pt; color:#888; margin-top:2px;">${bid.projectAddress}</div>
      <div class="sig-line"></div>
      <div class="sig-label">Signature &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Date</div>
    </div>
  </div>
</div>

<div class="gold-bar"></div>
<div class="footer">
  <span><span class="gold">NOVA BUILDERS</span> · Lic. 14271957-5501 · Fully Insured &amp; Bonded · Utah Area</span>
  <span>${bid.bidNumber} · ${formatDate(bid.createdAt)} · Valid 30 Days</span>
</div>

</body>
</html>`;
}

export async function saveBidHTML(bid: Bid): Promise<string> {
  const html = generateBidHTML(bid);
  const path = `${RNFS.DocumentDirectoryPath}/bid_${bid.bidNumber}.html`;
  await RNFS.writeFile(path, html, 'utf8');
  return path;
}
