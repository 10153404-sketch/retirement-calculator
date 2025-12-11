
/* Tabs switching */
document.querySelectorAll('.tab').forEach(tab=>{
  tab.addEventListener('click', ()=>{
    document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p=>{p.classList.remove('active','show')});
    tab.classList.add('active');
    const id = tab.getAttribute('data-target');
    const panel = document.getElementById(id);
    if(panel){
      panel.classList.add('active');
      // slight delay for transition
      setTimeout(()=>panel.classList.add('show'),20);
    }
    // scroll to top of main-area if needed (no long page)
    window.scrollTo({top:0,behavior:'smooth'});
  });
});

/* Welcome Start button */
const startBtn = document.getElementById('startBtn');
if(startBtn){
  startBtn.addEventListener('click', ()=>{
    const welcome = document.getElementById('welcome');
    const main = document.getElementById('main-area');
    welcome.style.transition = 'opacity .45s ease, transform .45s ease';
    welcome.style.opacity = '0';
    welcome.style.transform = 'translateY(-8px)';
    setTimeout(()=>{ welcome.style.display = 'none'; main.classList.remove('hidden'); initialize(); },420);
  });
}

/* Chart factory(FV) */
function makeChartFV(canvas){
  return new Chart(canvas, {
    type:'line',
    data:{ labels:[], datasets:[
      { label:'資產成長', data:[], borderColor:'#FBBF24', backgroundColor:'rgba(251,191,36,0.06)', borderWidth:2, tension:0.22, pointRadius:0 },
      { label:'累積投入', data:[], borderColor:'#F0620A', backgroundColor:'transparent', borderWidth:2, tension:0.22, borderDash: [6,4], pointRadius:0 }
    ]},
    options:{
      maintainAspectRatio:false,
      plugins:{legend:{labels:{color:'#F5F5F5'}}},
      scales:{ x:{ ticks:{color:'#F5F5F5'} }, y:{ ticks:{color:'#F5F5F5'} } }
    }
  });
}

let chartFV;

function makeChartRT(canvas){
  return new Chart(canvas, {
    type:'line',
    data:{ labels:[], datasets:[
      { label:'預期通膨下每月生活費', data:[], borderColor:'#FBBF24', backgroundColor:'rgba(251,191,36,0.06)', borderWidth:2, tension:0.22, pointRadius:0 },
      { label:'每月生活費', data:[], borderColor:'#F0620A', backgroundColor:'transparent', borderWidth:2, tension:0.22, borderDash: [6,4], pointRadius:0 }
    ]},
    options:{
      maintainAspectRatio:false,
      plugins:{legend:{labels:{color:'#F5F5F5'}}},
      scales:{ x:{ ticks:{color:'#F5F5F5'} }, y:{ ticks:{color:'#F5F5F5'} } }
    }
  });
}

let chartRT;

function makeChartMS(canvas){
  return new Chart(canvas, {
    type:'line',
    data:{ labels:[], datasets:[
      { label:'每月生活費(含預期通膨率)', data:[], borderColor:'#FBBF24', backgroundColor:'rgba(251,191,36,0.06)', borderWidth:2, tension:0.22, pointRadius:0 },
      { label:'目標退休金', data:[], borderColor:'#F0620A', backgroundColor:'transparent', borderWidth:2, tension:0.22, borderDash: [6,4], pointRadius:0 }
    ]},
    options:{
      maintainAspectRatio:false,
      plugins:{legend:{labels:{color:'#F5F5F5'}}},
      scales:{ x:{ ticks:{color:'#F5F5F5'} }, y:{ ticks:{color:'#F5F5F5'} } }
    }
  });
}

let chartMS;

/* helper */
function fmt(n){ if(!isFinite(n) || isNaN(n)) return '-'; return Math.round(n).toLocaleString(); }

/* ---------- Feature 1 (P + monthly M) ---------- */
function calcFV(){
  const P = Number(document.getElementById('fv_P').value) || 0;
  const M = Number(document.getElementById('fv_M').value) || 0;
  const t = Number(document.getElementById('fv_t').value) || 0;
  const r = Number(document.getElementById('fv_r').value) / 100 || 0;

  document.getElementById('fv_t_text').textContent = `${t} 年`;
  document.getElementById('fv_r_text').textContent = `${(r*100).toFixed(1)}%`;

  const rm = Math.pow(1 + r, 1/12) - 1;
  const m = t * 12;
  const pow = Math.pow(1 + rm, m);

  let A;
  if(rm === 0) A = P + M * m;
  else A = P * pow + M * ((pow - 1) / rm);

  const totalInvest = P + M * m;
  const interest = A - totalInvest;

  document.getElementById('fv_A_card').textContent = `最終資產 A：NT$ ${fmt(A)}`;
  document.getElementById('fv_totalInvest_card').textContent = `累積投入：NT$ ${fmt(totalInvest)}`;
  document.getElementById('fv_interest_card').textContent = `總利息：NT$ ${fmt(interest)}`;

  // chart: yearly points
  const labels = [], assets = [], invests = [];
  let bal = P;
  for(let month=1; month<=m; month++){
    bal = bal * (1 + rm) + M;
    if(month % 12 === 0){
      labels.push(`${month/12}年`);
      assets.push(bal);
      invests.push(P + M * month);
    }
  }
  if(chartFV){
    chartFV.data.labels = labels;
    chartFV.data.datasets[0].data = assets;
    chartFV.data.datasets[1].data = invests;
    chartFV.update();
  }
}

/* ---------- Feature 2 (4% rule + inflation) ---------- */
function calcRT(){
  const L = Number(document.getElementById('rt_L').value) || 0;
  const n = Number(document.getElementById('rt_n').value) || 0;
  const infl = Number(document.getElementById('rt_infl').value) / 100 || 0;

  document.getElementById('rt_n_text').textContent = `${n} 年`;
  document.getElementById('rt_infl_text').textContent = `${(infl*100).toFixed(1)}%`;

  const nowAnnual = L * 12;
  const futureAnnual = nowAnnual * Math.pow(1 + infl, n);
  const N = futureAnnual / 0.04;

  document.getElementById('rt_futureAnnual_card').textContent = `通膨後年支出：NT$ ${fmt(futureAnnual)}`;
  document.getElementById('rt_required_card').textContent = `退休所需總資產 N：NT$ ${fmt(N)}`;

  const labels = [], futurePerMonth = [];
  for(let y=1; y<=n; y++){
    labels.push(`${y}年`);
    futurePerMonth.push(L * Math.pow(1 + infl, y));
  }
  if(chartRT){
    chartRT.data.labels = labels;
    chartRT.data.datasets[0].data = futurePerMonth;
    chartRT.data.datasets[1].data = labels.map(()=>L);
    chartRT.update();
  }
}

/* ---------- Feature 3 (inverse monthly) ---------- */
function calcMS(){
  const N = Number(document.getElementById('ms_N').value) || 0;
  const P = Number(document.getElementById('ms_P').value) || 0;
  const t = Number(document.getElementById('ms_t').value) || 0;
  const r = Number(document.getElementById('ms_r').value) / 100 || 0;

  document.getElementById('ms_t_text').textContent = `${t} 年`;
  document.getElementById('ms_r_text').textContent = `${(r*100).toFixed(1)}%`;

  const rm = Math.pow(1 + r, 1/12) - 1;
  const m = t * 12;
  const pow = Math.pow(1 + rm, m);

  let M;
  if(rm === 0) M = (N - P) / m;
  else M = (N - P * pow) * rm / (pow - 1);
  if(!isFinite(M) || M < 0) M = 0;

  let final;
  if(rm === 0) final = P + M * m;
  else final = P * pow + M * ((pow - 1) / rm);

  document.getElementById('ms_M_card').textContent = `每月應儲蓄 M：NT$ ${fmt(M)}`;
  document.getElementById('ms_future_card').textContent = `累積總資產：NT$ ${fmt(final)}`;

  const labels = [], assets = [];
  let bal = P;
  for(let month=1; month<=m; month++){
    bal = bal * (1 + rm) + M;
    if(month % 12 === 0){
      labels.push(`${month/12}年`);
      assets.push(bal);
    }
  }
  if(chartMS){
    chartMS.data.labels = labels;
    chartMS.data.datasets[0].data = assets;
    chartMS.data.datasets[1].data = labels.map(()=>N);
    chartMS.update();
  }
}

/* ---------- bind inputs (instant update) ---------- */
function bindInputs(){
  ['fv_P','fv_M','fv_t','fv_r'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.addEventListener('input', calcFV);
  });
  ['rt_L','rt_n','rt_infl'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.addEventListener('input', calcRT);
  });
  ['ms_N','ms_P','ms_t','ms_r'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.addEventListener('input', calcMS);
  });
}

/* ---------- initialize charts and bind ---------- */
function initialize(){
  const c1 = document.getElementById('chart_fv').getContext('2d');
  const c2 = document.getElementById('chart_rt').getContext('2d');
  const c3 = document.getElementById('chart_ms').getContext('2d');
  chartFV = makeChartFV(c1.canvas);
  chartRT = makeChartRT(c2.canvas);
  chartMS = makeChartMS(c3.canvas);
  bindInputs();
  calcFV(); calcRT(); calcMS();
  // show first panel smoothly
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('show'));
  const active = document.querySelector('.panel.active');
  if(active) setTimeout(()=>active.classList.add('show'),30);
}

/* if user bypassed welcome (main visible), init */
if(!document.getElementById('welcome') || document.getElementById('welcome').style.display === 'none'){
  setTimeout(initialize,120);
}
