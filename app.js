// ===== MARKET DATA =====
var markets = [
  {id:1,s:"FOOTBALL",n:"Real Madrid vs Barcelona",t:"LIVE",o:[{n:"Real Madrid",v:2.10},{n:"Draw",v:3.40},{n:"Barcelona",v:2.85}],vol:"$234.5K",ex:"12.4%"},
  {id:2,s:"BASKETBALL",n:"Lakers vs Celtics",t:"Today 21:00",o:[{n:"Lakers",v:1.95},{n:"Celtics",v:1.85}],vol:"$187.2K",ex:"8.7%"},
  {id:3,s:"FOOTBALL",n:"Manchester City vs Liverpool",t:"Tomorrow 18:30",o:[{n:"Man City",v:1.75},{n:"Draw",v:3.80},{n:"Liverpool",v:3.50}],vol:"$312.8K",ex:"15.2%"},
  {id:4,s:"TENNIS",n:"Djokovic vs Alcaraz",t:"Today 15:00",o:[{n:"Djokovic",v:2.20},{n:"Alcaraz",v:1.70}],vol:"$98.4K",ex:"5.1%"},
  {id:5,s:"ESPORTS",n:"T1 vs Gen.G — Worlds Final",t:"LIVE",o:[{n:"T1",v:1.60},{n:"Gen.G",v:2.30}],vol:"$156.7K",ex:"7.3%"},
  {id:6,s:"FOOTBALL",n:"PSG vs Bayern Munich",t:"Wed 21:00",o:[{n:"PSG",v:2.40},{n:"Draw",v:3.30},{n:"Bayern",v:2.60}],vol:"$278.1K",ex:"13.8%"},
  {id:7,s:"BASKETBALL",n:"Warriors vs Bucks",t:"Thu 19:30",o:[{n:"Warriors",v:2.05},{n:"Bucks",v:1.78}],vol:"$142.3K",ex:"6.9%"},
  {id:8,s:"TENNIS",n:"Sinner vs Medvedev",t:"Fri 14:00",o:[{n:"Sinner",v:1.55},{n:"Medvedev",v:2.45}],vol:"$76.8K",ex:"3.8%"}
];

var currentBet = null;
var currentFilter = 'all';

// ===== RENDER MARKETS =====
function renderMarkets(filter) {
  var el = document.getElementById("M");
  if (!el) return;
  
  var filtered = filter === 'all' ? markets : markets.filter(function(m) { return m.s === filter; });
  var h = "";
  
  for (var i = 0; i < filtered.length; i++) {
    var m = filtered[i];
    var lv = m.t === "LIVE";
    h += '<div class="mkt"><div class="mkt-top"><span class="mkt-tag">' + m.s + '</span><span class="mkt-time' + (lv ? " live" : "") + '">' + m.t + '</span></div>';
    h += '<div class="mkt-name">' + m.n + '</div><div class="mkt-odds">';
    for (var j = 0; j < m.o.length; j++) {
      var sel = currentBet && currentBet.mId === m.id && currentBet.oIdx === j ? ' sel' : '';
      h += '<div class="odd' + sel + '" data-mid="' + m.id + '" data-oidx="' + j + '"><span class="odd-name">' + m.o[j].n + '</span><span class="odd-val">' + m.o[j].v.toFixed(2) + '</span></div>';
    }
    h += '</div><div class="mkt-bot"><span>Vol ' + m.vol + '</span><span>Exp ' + m.ex + '</span></div></div>';
  }
  
  el.innerHTML = h;
  
  // Attach click handlers
  var odds = el.querySelectorAll('.odd');
  for (var k = 0; k < odds.length; k++) {
    odds[k].addEventListener('click', handleOddClick);
  }
}

function handleOddClick(e) {
  var btn = e.currentTarget;
  var mid = parseInt(btn.getAttribute('data-mid'));
  var oidx = parseInt(btn.getAttribute('data-oidx'));
  
  var m = markets.find(function(x) { return x.id === mid; });
  var o = m.o[oidx];
  
  // Deselect all
  document.querySelectorAll('.odd').forEach(function(el) { el.classList.remove('sel'); });
  
  // Select this one
  btn.classList.add('sel');
  
  // Update bet slip
  currentBet = { mId: mid, oIdx: oidx, market: m, outcome: o };
  
  var se = document.getElementById('SE');
  var sb = document.getElementById('SB');
  var sc = document.getElementById('SC');
  
  if (se) se.style.display = 'none';
  if (sb) { sb.style.display = 'flex'; sb.classList.add('show'); }
  if (sc) sc.textContent = '1';
  
  var xe = document.getElementById('XE');
  var xp = document.getElementById('XP');
  var xo = document.getElementById('XO');
  var doo = document.getElementById('DO');
  
  if (xe) xe.textContent = m.n;
  if (xp) xp.textContent = o.n;
  if (xo) xo.textContent = o.v.toFixed(2);
  if (doo) doo.textContent = o.v.toFixed(2);
  
  calc();
}

// ===== FILTER MARKETS =====
function filterMkts(filter, btn) {
  currentFilter = filter;
  document.querySelectorAll('.f-btn').forEach(function(b) { b.classList.remove('on'); });
  btn.classList.add('on');
  renderMarkets(filter);
}

// ===== BET SLIP =====
function ss(val) {
  var input = document.getElementById('SI');
  if (input) { input.value = val; calc(); }
}

function calc() {
  var input = document.getElementById('SI');
  var s = input ? parseFloat(input.value) || 0 : 0;
  var odds = currentBet ? currentBet.outcome.v : 0;
  var payout = s * odds;
  var profit = payout - s;
  
  var dp = document.getElementById('DP');
  var dpr = document.getElementById('DPR');
  if (dp) dp.textContent = '$' + payout.toFixed(2);
  if (dpr) dpr.textContent = '$' + profit.toFixed(2);
}

function removeBet() {
  currentBet = null;
  document.querySelectorAll('.odd').forEach(function(el) { el.classList.remove('sel'); });
  
  var se = document.getElementById('SE');
  var sb = document.getElementById('SB');
  var sc = document.getElementById('SC');
  
  if (se) se.style.display = 'flex';
  if (sb) { sb.style.display = 'none'; sb.classList.remove('show'); }
  if (sc) sc.textContent = '0';
}

function placeBet() {
  if (!currentBet) { toast('Select an outcome first', 'er'); return; }
  var input = document.getElementById('SI');
  var s = input ? parseFloat(input.value) : 0;
  if (!s || s < 1) { toast('Enter a valid stake', 'er'); return; }
  toast(currentBet.outcome.n + ' @ ' + currentBet.outcome.v.toFixed(2) + ' — $' + s + ' placed!', 'ok');
}

// ===== WALLET =====
function connectWallet() {
  var btn = document.getElementById('walletBtn');
  if (btn) {
    btn.textContent = '0x7a3...f2c1';
    btn.classList.add('connected');
  }
  toast('Wallet connected (demo)', 'ok');
}

// ===== VAULT TABS =====
function showDeposit() {
  var vd = document.getElementById('VD');
  var vw = document.getElementById('VW');
  var dt = document.getElementById('depTab');
  var wt = document.getElementById('witTab');
  if (vd) vd.style.display = 'block';
  if (vw) vw.style.display = 'none';
  if (dt) dt.classList.add('on');
  if (wt) wt.classList.remove('on');
}

function showWithdraw() {
  var vd = document.getElementById('VD');
  var vw = document.getElementById('VW');
  var dt = document.getElementById('depTab');
  var wt = document.getElementById('witTab');
  if (vd) vd.style.display = 'none';
  if (vw) vw.style.display = 'block';
  if (dt) dt.classList.remove('on');
  if (wt) wt.classList.add('on');
}

// ===== TOAST =====
function toast(msg, type) {
  var c = document.getElementById('TW');
  if (!c) return;
  var d = document.createElement('div');
  d.className = 't ' + type;
  d.textContent = msg;
  c.appendChild(d);
  setTimeout(function() { d.remove(); }, 3000);
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function() {
  // Render markets if on trade page
  renderMarkets('all');
  
  // Wallet button
  var wb = document.getElementById('walletBtn');
  if (wb) wb.addEventListener('click', connectWallet);
  
  // Place bet button
  var pb = document.getElementById('placeBetBtn');
  if (pb) pb.addEventListener('click', placeBet);
  
  // Remove bet button
  var rb = document.getElementById('removeBtn');
  if (rb) rb.addEventListener('click', removeBet);
});
