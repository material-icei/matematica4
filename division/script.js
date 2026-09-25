/* ================= STORAGE (badges) ================= */
function loadBadges(){
  try{
    const raw = localStorage.getItem('df_badges');
    if(raw) return JSON.parse(raw);
  }catch(e){}
  return { bronze:false, silver:false, gold:false, correctCount:0 };
}
function saveBadges(state){
  try{ localStorage.setItem('df_badges', JSON.stringify(state)); }catch(e){}
}
let badgeState = loadBadges();

function renderBadges(){
  document.getElementById('medalBronze').classList.toggle('earned', badgeState.bronze);
  document.getElementById('medalSilver').classList.toggle('earned', badgeState.silver);
  document.getElementById('medalGold').classList.toggle('earned', badgeState.gold);
}
renderBadges();

const THRESHOLDS = [ {key:'bronze', goal:5, icon:'🥉'}, {key:'silver', goal:10, icon:'🥈'}, {key:'gold', goal:20, icon:'🥇'} ];

function updateProgressUI(){
  let next = THRESHOLDS.find(t => !badgeState[t.key]);
  const fills = document.querySelectorAll('.progress-fill');
  const labels = document.querySelectorAll('.progress-label');
  if(!next){
    fills.forEach(f=> f.style.width = '100%');
    labels.forEach(l=> l.textContent = '🏆 ¡Completaste todas las medallas!');
    return;
  }
  const prevGoal = THRESHOLDS[THRESHOLDS.indexOf(next)-1]?.goal || 0;
  const span = next.goal - prevGoal;
  const progressed = badgeState.correctCount - prevGoal;
  const pct = Math.max(0, Math.min(100, (progressed/span)*100));
  fills.forEach(f=> f.style.width = pct + '%');
  labels.forEach(l=> l.textContent = `${next.icon} ${badgeState.correctCount} / ${next.goal}`);
}

function registerCorrect(){
  badgeState.correctCount++;
  let newlyEarned = null;
  THRESHOLDS.forEach(t=>{
    if(!badgeState[t.key] && badgeState.correctCount >= t.goal){
      badgeState[t.key] = true;
      newlyEarned = t;
    }
  });
  saveBadges(badgeState);
  renderBadges();
  updateProgressUI();
  if(newlyEarned){
    showToast(`${newlyEarned.icon} ¡Nueva medalla ${newlyEarned.key === 'bronze' ? 'de bronce' : newlyEarned.key === 'silver' ? 'de plata' : 'de oro'}!`);
    launchConfetti();
  }
}

/* ================= NAVIGATION ================= */
function showScreen(name){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById('screen-'+name).classList.add('active');
  document.getElementById('backBtn').classList.toggle('show', name !== 'home');
}
function goHome(){ showScreen('home'); }

function showLocked(){ document.getElementById('lockedOverlay').classList.add('show'); }
function hideLocked(){ document.getElementById('lockedOverlay').classList.remove('show'); }

function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(()=> t.classList.remove('show'), 2600);
}

function launchConfetti(){
  const emojis = ['🎉','⭐','🎊','✨','🏅'];
  for(let i=0;i<24;i++){
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.textContent = emojis[Math.floor(Math.random()*emojis.length)];
    el.style.left = Math.random()*100+'vw';
    el.style.animationDuration = (1.6+Math.random()*1.2)+'s';
    el.style.fontSize = (1.6+Math.random()*1.6)+'vh';
    document.body.appendChild(el);
    setTimeout(()=> el.remove(), 3200);
  }
}

/* ================= TABLAS DE MULTIPLICAR ================= */
function switchTablasTab(tab){
  document.getElementById('btnConsulta').classList.toggle('active', tab==='consulta');
  document.getElementById('btnQuiz').classList.toggle('active', tab==='quiz');
  document.getElementById('view-consulta').classList.toggle('active', tab==='consulta');
  document.getElementById('view-quiz').classList.toggle('active', tab==='quiz');
  if(tab==='quiz') newQuizQuestion();
}

let selectedTabla = 5;
function renderTablaSelect(){
  const wrap = document.getElementById('tablaSelect');
  wrap.innerHTML = '';
  for(let n=1;n<=10;n++){
    const b = document.createElement('button');
    b.textContent = n;
    if(n===selectedTabla) b.classList.add('sel');
    b.onclick = ()=>{ selectedTabla = n; renderTablaSelect(); renderTablaGrid(); };
    wrap.appendChild(b);
  }
}
function renderTablaGrid(){
  const grid = document.getElementById('tablaGrid');
  grid.innerHTML = '';
  for(let i=1;i<=10;i++){
    const cell = document.createElement('div');
    cell.className = 'tabla-cell';
    cell.innerHTML = `${selectedTabla} <b>×</b> ${i} <b>=</b> ${selectedTabla*i}`;
    grid.appendChild(cell);
  }
}
renderTablaSelect();
renderTablaGrid();

let quizScore = 0;
let quizAnswer = 0;
function newQuizQuestion(){
  const a = Math.floor(Math.random()*10)+1;
  const b = Math.floor(Math.random()*10)+1;
  quizAnswer = a*b;
  document.getElementById('quizQuestion').textContent = `${a} × ${b} = ?`;
  document.getElementById('quizFeedback').textContent = '';
  const opts = new Set([quizAnswer]);
  while(opts.size < 4){
    const delta = Math.floor(Math.random()*10)-5;
    const candidate = quizAnswer + delta;
    if(candidate > 0 && candidate !== quizAnswer) opts.add(candidate);
  }
  const arr = Array.from(opts).sort(()=>Math.random()-0.5);
  const optWrap = document.getElementById('quizOptions');
  optWrap.innerHTML = '';
  arr.forEach(val=>{
    const btn = document.createElement('button');
    btn.textContent = val;
    btn.onclick = ()=> checkQuizAnswer(val, btn);
    optWrap.appendChild(btn);
  });
}
function checkQuizAnswer(val, btn){
  const allBtns = document.querySelectorAll('#quizOptions button');
  allBtns.forEach(b=> b.disabled = true);
  if(val === quizAnswer){
    btn.classList.add('correct');
    document.getElementById('quizFeedback').textContent = '¡Muy bien! 🎉';
    quizScore++;
  } else {
    btn.classList.add('wrong');
    document.getElementById('quizFeedback').textContent = `Casi... ¡era ${quizAnswer}! 💪`;
  }
  document.getElementById('quizScore').textContent = 'Aciertos: ' + quizScore;
  setTimeout(newQuizQuestion, 1400);
}

/* ================= TUTORIAL (paso a paso) =================
   Dos ejemplos disponibles: divisor de 1 cifra (486÷2) y divisor
   de 2 cifras (864÷32), seleccionables con las pestañas. */
const tutorialSteps1 = [
  { rem:486, sub:null, cociente:0,  calc:null, caption:'Este es el dividendo 486 (lo que repartimos) y el divisor 2 (en cuántas partes lo repartimos). ¡Empecemos! 🎉' },
  { rem:486, sub:200,  cociente:0,  calc:'2 × 100 = 200', caption:'Buscamos un múltiplo fácil de 2 que se pueda restar de 486. ¡200 funciona! Restamos 486 − 200.' },
  { rem:286, sub:null, cociente:100, calc:null, caption:'Nos queda 286 y ya sabemos que el cociente lleva, al menos, 100.' },
  { rem:286, sub:200,  cociente:100, calc:'2 × 100 = 200', caption:'286 también nos permite restar 200 (2 × 100). ¡Restamos otra vez!' },
  { rem:86,  sub:null, cociente:200, calc:null, caption:'Quedan 86. El cociente acumulado ya es 200.' },
  { rem:86,  sub:20,   cociente:200, calc:'2 × 10 = 20', caption:'Ahora 86 es más chico: probamos restar 20 (2 × 10).' },
  { rem:66,  sub:null, cociente:210, calc:null, caption:'Quedan 66. Cociente acumulado: 210.' },
  { rem:66,  sub:20,   cociente:210, calc:'2 × 10 = 20', caption:'Restamos otra vez 20 (2 × 10).' },
  { rem:46,  sub:null, cociente:220, calc:null, caption:'Quedan 46. Cociente acumulado: 220.' },
  { rem:46,  sub:20,   cociente:220, calc:'2 × 10 = 20', caption:'46 todavía admite restar 20 (2 × 10).' },
  { rem:26,  sub:null, cociente:230, calc:null, caption:'Quedan 26. Cociente acumulado: 230.' },
  { rem:26,  sub:20,   cociente:230, calc:'2 × 10 = 20', caption:'Una vez más: restamos 20 (2 × 10).' },
  { rem:6,   sub:null, cociente:240, calc:null, caption:'Quedan solo 6. Cociente acumulado: 240. ¡Ya casi terminamos!' },
  { rem:6,   sub:2,    cociente:240, calc:'2 × 1 = 2', caption:'Ahora usamos unidades: restamos 2 (2 × 1).' },
  { rem:4,   sub:null, cociente:241, calc:null, caption:'Quedan 4. Cociente acumulado: 241.' },
  { rem:4,   sub:2,    cociente:241, calc:'2 × 1 = 2', caption:'Restamos 2 (2 × 1) otra vez.' },
  { rem:2,   sub:null, cociente:242, calc:null, caption:'Quedan 2. Cociente acumulado: 242.' },
  { rem:2,   sub:2,    cociente:242, calc:'2 × 1 = 2', caption:'Última resta: 2 (2 × 1).' },
  { rem:0,   sub:null, cociente:243, calc:null, caption:'¡Llegamos a 0! El resto es 0 y el cociente final es 243. Comprobación: 243 × 2 = 486 ✅' },
];

const tutorialSteps2 = [
  { rem:864, sub:null, cociente:0,  calc:null, caption:'Ahora el divisor tiene dos cifras: 864 es el dividendo y 32 el divisor. ¡El método es el mismo! 🎉' },
  { rem:864, sub:320,  cociente:0,  calc:'32 × 10 = 320', caption:'Buscamos un múltiplo fácil de 32. ¡320 (32 × 10) funciona! Restamos 864 − 320.' },
  { rem:544, sub:null, cociente:10, calc:null, caption:'Nos queda 544. El cociente lleva, al menos, 10.' },
  { rem:544, sub:320,  cociente:10, calc:'32 × 10 = 320', caption:'544 también nos permite restar 320 (32 × 10). ¡Restamos otra vez!' },
  { rem:224, sub:null, cociente:20, calc:null, caption:'Quedan 224. Cociente acumulado: 20.' },
  { rem:224, sub:160,  cociente:20, calc:'32 × 5 = 160', caption:'224 ya no admite otro 320, pero sí 160 (32 × 5). ¡Restamos!' },
  { rem:64,  sub:null, cociente:25, calc:null, caption:'Quedan 64. Cociente acumulado: 25.' },
  { rem:64,  sub:32,   cociente:25, calc:'32 × 1 = 32', caption:'64 admite restar 32 (32 × 1) una vez.' },
  { rem:32,  sub:null, cociente:26, calc:null, caption:'Queda 32. Cociente acumulado: 26.' },
  { rem:32,  sub:32,   cociente:26, calc:'32 × 1 = 32', caption:'32 también admite restar 32 (32 × 1) una vez más.' },
  { rem:0,   sub:null, cociente:27, calc:null, caption:'¡Llegamos a 0! El resto es 0 y el cociente final es 27. Comprobación: 27 × 32 = 864 ✅' },
];

let activeTutorialNum = 1;
let tutorialSteps = tutorialSteps1;
let tutDivisorVal = 2;
let tutIndex = 0;

function switchTutorial(num){
  activeTutorialNum = num;
  tutorialSteps = num === 1 ? tutorialSteps1 : tutorialSteps2;
  tutDivisorVal = num === 1 ? 2 : 32;
  tutIndex = 0;
  document.getElementById('btnTut1').classList.toggle('active', num===1);
  document.getElementById('btnTut2').classList.toggle('active', num===2);
  document.getElementById('tutDivisorNum').textContent = tutDivisorVal;
  renderTutorial();
}

function renderTutorial(){
  const step = tutorialSteps[tutIndex];
  const divCol = document.getElementById('divCol');
  let html = `<div class="div-header"><span class="tag">DIVIDENDO</span></div>`;
  // build rows up to current index
  let rows = [];
  for(let i=1;i<=tutIndex;i++){
    const s = tutorialSteps[i];
    if(s.sub !== null){
      rows.push({type:'dividendo', val: tutorialSteps[i-1].rem});
      rows.push({type:'resta', val: s.sub});
    }
  }
  if(rows.length === 0){
    html += `<div class="div-row"><span class="dividendo">${tutorialSteps[0].rem}</span></div>`;
  } else {
    rows.forEach((r)=>{
      if(r.type==='dividendo'){
        html += `<div class="div-row"><span class="dividendo">${r.val}</span></div>`;
      } else {
        html += `<div class="div-row"><span class="resta">− ${r.val}</span></div><hr>`;
      }
    });
    html += `<div class="div-row"><span class="dividendo">${step.rem}</span></div>`;
  }
  divCol.innerHTML = html;
  divCol.scrollTop = divCol.scrollHeight;

  document.getElementById('cocienteAcum').textContent = step.cociente;
  document.getElementById('tutorialCaption').textContent = step.caption;

  // calc list: show calc entries used so far
  const calcList = document.getElementById('calcList');
  calcList.innerHTML = '';
  let calcs = [];
  for(let i=0;i<=tutIndex;i++){
    if(tutorialSteps[i].calc) calcs.push(tutorialSteps[i].calc);
  }
  calcs.slice(-6).forEach((c, idx)=>{
    const div = document.createElement('div');
    div.className = 'calc-item';
    const parts = c.split('=');
    div.innerHTML = `${parts[0]}= <b>${parts[1]}</b>`;
    calcList.appendChild(div);
    setTimeout(()=> div.classList.add('show'), 30*idx);
  });

  document.getElementById('btnPrevStep').disabled = tutIndex === 0;
  document.getElementById('btnNextStep').disabled = tutIndex === tutorialSteps.length-1;
  document.getElementById('btnNextStep').textContent = tutIndex === tutorialSteps.length-1 ? '¡Terminado! 🎉' : 'Siguiente ➡️';

  const dots = document.getElementById('stepDots');
  dots.innerHTML = '';
  tutorialSteps.forEach((_,i)=>{
    const d = document.createElement('span');
    if(i===tutIndex) d.classList.add('on');
    dots.appendChild(d);
  });
}
function tutorialStep(dir){
  tutIndex = Math.max(0, Math.min(tutorialSteps.length-1, tutIndex+dir));
  renderTutorial();
}
renderTutorial();

/* ================= EJERCICIOS ================= */
let currentEj = { dividendo:486, divisor:2, cociente:243 };

function generarEjercicio(){
  const divisor = Math.floor(Math.random()*8)+2; // 2..9
  let cociente, dividendo;
  do{
    cociente = Math.floor(Math.random()*80)+12; // rango variado
    dividendo = divisor * cociente;
  } while(dividendo < 100 || dividendo > 999);
  currentEj = { dividendo, divisor, cociente };
}

/* Panel izquierdo: la cuenta de división se va armando paso a paso, con
   casilleros que el alumno completa (resta, resultado y cociente parcial),
   confirmados con el botón OK, tal como en el papel. Cuando el resto queda
   por debajo del divisor, se habilita el casillero final para sumar el
   cociente. */
let ejDiv = { remaining: 0, cocienteAcum: 0, steps: [], phase: 'subtracting' };

function resetEjDiv(){
  ejDiv = { remaining: currentEj.dividendo, cocienteAcum: 0, steps: [], phase: 'subtracting' };
  renderEjDivCol();
}

function renderEjDivCol(){
  // --- columna del dividendo (izquierda) ---
  const col = document.getElementById('ejDivCol');
  let html = `<div class="div-header"><span class="tag">DIVIDENDO</span></div>`;
  html += `<div class="div-row"><span class="dividendo">${currentEj.dividendo}</span></div>`;
  ejDiv.steps.forEach(s=>{
    html += `<div class="div-row"><span class="resta">− ${s.subtract}</span></div><hr>`;
    html += `<div class="div-row"><span class="dividendo">${s.result}</span></div>`;
  });
  if(ejDiv.phase === 'subtracting'){
    html += `<div class="div-row div-row-pending">
      <span class="resta">−</span>
      <input type="number" id="pendSubtract" class="pending-box subtract-box" placeholder="?" onkeydown="if(event.key==='Enter') confirmarPaso()">
    </div>`;
    html += `<hr>`;
    html += `<div class="div-row div-row-pending">
      <input type="number" id="pendResult" class="pending-box" placeholder="?" onkeydown="if(event.key==='Enter') confirmarPaso()">
    </div>`;
  } else {
    html += `<div class="div-row"><span class="dividendo resto-cero">${ejDiv.remaining}</span></div>`;
  }
  col.innerHTML = html;
  const wrap = document.querySelector('#screen-ejercicios .ej-scroll-wrap');
  if(wrap) wrap.scrollTop = wrap.scrollHeight;

  // --- columna del divisor / cociente (derecha) ---
  const dcol = document.getElementById('ejDivisorCol');
  let dhtml = `<div class="div-header"><span class="tag">DIVISOR</span></div>`;
  dhtml += `<div class="divisor-num-display">${currentEj.divisor} <span class="check-mark">✔</span></div>`;
  ejDiv.steps.forEach(s=>{
    dhtml += `<div class="factor-box">${s.factor}</div>`;
    dhtml += `<div class="plus-sign">+</div>`;
  });
  if(ejDiv.phase === 'subtracting'){
    dhtml += `<div class="factor-row">
      <div class="factor-box pending"><input type="number" id="pendFactor" placeholder="?" onkeydown="if(event.key==='Enter') confirmarPaso()"></div>
      <button class="ok-inline-btn" onclick="confirmarPaso()">OK ✅</button>
    </div>`;
  } else {
    dhtml += `<hr class="sum-hr">`;
    dhtml += `<div class="factor-box final"><input type="number" id="ejFinalCociente" placeholder="?"></div>`;
  }
  dcol.innerHTML = dhtml;

  const focusTarget = document.getElementById('pendSubtract');
  if(focusTarget) setTimeout(()=> focusTarget.focus(), 30);
}

function confirmarPaso(){
  const fb = document.getElementById('ejFeedback');
  const sub = parseInt(document.getElementById('pendSubtract').value, 10);
  const res = parseInt(document.getElementById('pendResult').value, 10);
  const fac = parseInt(document.getElementById('pendFactor').value, 10);

  if(isNaN(sub) || isNaN(res) || isNaN(fac) || sub <= 0 || fac <= 0){
    fb.style.color = 'var(--red)';
    fb.textContent = '✍️ Completá los tres casilleros (resta, resultado y cociente parcial) antes de tocar OK.';
    return;
  }
  if(fac * currentEj.divisor !== sub){
    fb.style.color = 'var(--red)';
    fb.textContent = `Revisá: ${currentEj.divisor} × ${fac} no da ${sub}. Usá los cálculos auxiliares de la derecha. 🤔`;
    return;
  }
  if(sub > ejDiv.remaining){
    fb.style.color = 'var(--red)';
    fb.textContent = `Eso es más de lo que queda (quedan ${ejDiv.remaining}). Probá un múltiplo más chico. 💡`;
    return;
  }
  if(ejDiv.remaining - sub !== res){
    fb.style.color = 'var(--red)';
    fb.textContent = `${ejDiv.remaining} − ${sub} no es ${res}. Revisá esa resta. ✏️`;
    return;
  }

  ejDiv.steps.push({ subtract: sub, factor: fac, result: res });
  ejDiv.remaining = res;
  ejDiv.cocienteAcum += fac;
  if(ejDiv.remaining < currentEj.divisor){
    ejDiv.phase = 'summing';
  }
  renderEjDivCol();

  fb.style.color = 'var(--green)';
  if(ejDiv.phase === 'summing'){
    fb.textContent = res === 0
      ? '🎉 ¡Llegaste a resto 0! Ahora sumá los números del cociente.'
      : `Como ${res} es menor que ${currentEj.divisor}, ya no se puede seguir restando. ¡Sumá los números del cociente!`;
  } else {
    fb.textContent = `¡Bien! Quedan ${res}.`;
  }
}

/* Panel derecho: espacio libre para los cálculos auxiliares (multiplicaciones)
   que el alumno usa para decidir cuánto restar en el panel izquierdo. */
let calcAuxCount = 3;
function renderCalcAuxRows(){
  const wrap = document.getElementById('calcAuxRows');
  wrap.innerHTML = '';
  for(let i=0;i<calcAuxCount;i++){
    const row = document.createElement('div');
    row.className = 'calc-aux-row';
    row.innerHTML = `
      <input class="w-num" type="number" placeholder="${currentEj.divisor}">
      <span class="op">×</span>
      <input class="w-num" type="number" placeholder="?">
      <span class="op">=</span>
      <input class="w-res" type="number" placeholder="resultado">
    `;
    wrap.appendChild(row);
  }
}
function addCalcRow(){
  calcAuxCount++;
  const wrap = document.getElementById('calcAuxRows');
  const row = document.createElement('div');
  row.className = 'calc-aux-row';
  row.innerHTML = `
    <input class="w-num" type="number" placeholder="${currentEj.divisor}">
    <span class="op">×</span>
    <input class="w-num" type="number" placeholder="?">
    <span class="op">=</span>
    <input class="w-res" type="number" placeholder="resultado">
  `;
  wrap.appendChild(row);
}

function renderEjercicio(){
  document.getElementById('ejFeedback').textContent = '';
  document.getElementById('ejFeedback').style.color = 'var(--ink)';
  resetEjDiv();
  calcAuxCount = 3;
  renderCalcAuxRows();
}

function startEjercicios(){
  generarEjercicio();
  renderEjercicio();
  updateProgressUI();
  showScreen('ejercicios');
}
function nuevoEjercicio(){
  generarEjercicio();
  renderEjercicio();
}
function showHint(){
  const rem = ejDiv.remaining;
  if(ejDiv.phase === 'summing'){
    document.getElementById('ejFeedback').style.color = 'var(--purple)';
    document.getElementById('ejFeedback').textContent = '💡 Sumá todos los números que fuiste anotando en la columna del cociente.';
    return;
  }
  let potencia = 1;
  while(potencia * 10 <= rem) potencia *= 10;
  const factor = Math.floor(rem / (currentEj.divisor * potencia)) * potencia;
  const hintTxt = factor > 0
    ? `💡 Con lo que queda (${rem}), probá con el cociente parcial ${factor}: ${currentEj.divisor} × ${factor} = ${currentEj.divisor*factor}.`
    : `💡 Pensá: ¿cuántas veces entra ${currentEj.divisor} en ${rem}?`;
  document.getElementById('ejFeedback').style.color = 'var(--purple)';
  document.getElementById('ejFeedback').textContent = hintTxt;
}
function verificar(){
  const fb = document.getElementById('ejFeedback');
  if(ejDiv.phase !== 'summing'){
    fb.style.color = 'var(--red)';
    fb.textContent = 'Primero terminá de restar hasta que el resto sea menor que el divisor. ✏️';
    return;
  }
  const val = parseInt(document.getElementById('ejFinalCociente').value, 10);
  if(isNaN(val)){
    fb.style.color = 'var(--red)';
    fb.textContent = '✍️ Sumá los números del cociente y escribí el resultado.';
    return;
  }
  if(val === currentEj.cociente){
    fb.style.color = 'var(--green)';
    fb.textContent = `¡Correcto! 🎉 ${currentEj.dividendo} ÷ ${currentEj.divisor} = ${currentEj.cociente}`;
    registerCorrect();
    launchConfetti();
    setTimeout(nuevoEjercicio, 1800);
  } else {
    fb.style.color = 'var(--red)';
    fb.textContent = '¡Casi! Revisá la suma de los números del cociente. 💪';
  }
}

updateProgressUI();

/* ================= EJERCICIOS 2 (divisor de 2 cifras, dividendo 4-5 cifras) ================= */
let currentEj2 = { dividendo:1260, divisor:12, cociente:105 };
let ejDiv2 = { remaining:0, cocienteAcum:0, steps:[], phase:'subtracting' };
let calcAuxCount2 = 3;

function generarEjercicio2(){
  const divisor = Math.floor(Math.random()*90)+10; // 10..99
  let cociente, dividendo;
  do{
    cociente = Math.floor(Math.random()*950)+11; // rango variado
    dividendo = divisor * cociente;
  } while(dividendo < 1000 || dividendo > 99999);
  currentEj2 = { dividendo, divisor, cociente };
}

function resetEjDiv2(){
  ejDiv2 = { remaining: currentEj2.dividendo, cocienteAcum: 0, steps: [], phase: 'subtracting' };
  renderEjDivCol2();
}

function renderEjDivCol2(){
  const col = document.getElementById('ejDivCol2');
  let html = `<div class="div-header"><span class="tag">DIVIDENDO</span></div>`;
  html += `<div class="div-row"><span class="dividendo">${currentEj2.dividendo}</span></div>`;
  ejDiv2.steps.forEach(s=>{
    html += `<div class="div-row"><span class="resta">− ${s.subtract}</span></div><hr>`;
    html += `<div class="div-row"><span class="dividendo">${s.result}</span></div>`;
  });
  if(ejDiv2.phase === 'subtracting'){
    html += `<div class="div-row div-row-pending">
      <span class="resta">−</span>
      <input type="number" id="pendSubtract2" class="pending-box subtract-box" placeholder="?" onkeydown="if(event.key==='Enter') confirmarPaso2()">
    </div>`;
    html += `<hr>`;
    html += `<div class="div-row div-row-pending">
      <input type="number" id="pendResult2" class="pending-box" placeholder="?" onkeydown="if(event.key==='Enter') confirmarPaso2()">
    </div>`;
  } else {
    html += `<div class="div-row"><span class="dividendo resto-cero">${ejDiv2.remaining}</span></div>`;
  }
  col.innerHTML = html;
  const wrap = document.querySelector('#screen-ejercicios2 .ej-scroll-wrap');
  if(wrap) wrap.scrollTop = wrap.scrollHeight;

  const dcol = document.getElementById('ejDivisorCol2');
  let dhtml = `<div class="div-header"><span class="tag">DIVISOR</span></div>`;
  dhtml += `<div class="divisor-num-display">${currentEj2.divisor} <span class="check-mark">✔</span></div>`;
  ejDiv2.steps.forEach(s=>{
    dhtml += `<div class="factor-box">${s.factor}</div>`;
    dhtml += `<div class="plus-sign">+</div>`;
  });
  if(ejDiv2.phase === 'subtracting'){
    dhtml += `<div class="factor-row">
      <div class="factor-box pending"><input type="number" id="pendFactor2" placeholder="?" onkeydown="if(event.key==='Enter') confirmarPaso2()"></div>
      <button class="ok-inline-btn" onclick="confirmarPaso2()">OK ✅</button>
    </div>`;
  } else {
    dhtml += `<hr class="sum-hr">`;
    dhtml += `<div class="factor-box final"><input type="number" id="ejFinalCociente2" placeholder="?"></div>`;
  }
  dcol.innerHTML = dhtml;

  const focusTarget = document.getElementById('pendSubtract2');
  if(focusTarget) setTimeout(()=> focusTarget.focus(), 30);
}

function confirmarPaso2(){
  const fb = document.getElementById('ejFeedback2');
  const sub = parseInt(document.getElementById('pendSubtract2').value, 10);
  const res = parseInt(document.getElementById('pendResult2').value, 10);
  const fac = parseInt(document.getElementById('pendFactor2').value, 10);

  if(isNaN(sub) || isNaN(res) || isNaN(fac) || sub <= 0 || fac <= 0){
    fb.style.color = 'var(--red)';
    fb.textContent = '✍️ Completá los tres casilleros (resta, resultado y cociente parcial) antes de tocar OK.';
    return;
  }
  if(fac * currentEj2.divisor !== sub){
    fb.style.color = 'var(--red)';
    fb.textContent = `Revisá: ${currentEj2.divisor} × ${fac} no da ${sub}. Usá los cálculos auxiliares de la derecha. 🤔`;
    return;
  }
  if(sub > ejDiv2.remaining){
    fb.style.color = 'var(--red)';
    fb.textContent = `Eso es más de lo que queda (quedan ${ejDiv2.remaining}). Probá un múltiplo más chico. 💡`;
    return;
  }
  if(ejDiv2.remaining - sub !== res){
    fb.style.color = 'var(--red)';
    fb.textContent = `${ejDiv2.remaining} − ${sub} no es ${res}. Revisá esa resta. ✏️`;
    return;
  }

  ejDiv2.steps.push({ subtract: sub, factor: fac, result: res });
  ejDiv2.remaining = res;
  ejDiv2.cocienteAcum += fac;
  if(ejDiv2.remaining < currentEj2.divisor){
    ejDiv2.phase = 'summing';
  }
  renderEjDivCol2();

  fb.style.color = 'var(--green)';
  if(ejDiv2.phase === 'summing'){
    fb.textContent = res === 0
      ? '🎉 ¡Llegaste a resto 0! Ahora sumá los números del cociente.'
      : `Como ${res} es menor que ${currentEj2.divisor}, ya no se puede seguir restando. ¡Sumá los números del cociente!`;
  } else {
    fb.textContent = `¡Bien! Quedan ${res}.`;
  }
}

function renderCalcAuxRows2(){
  const wrap = document.getElementById('calcAuxRows2');
  wrap.innerHTML = '';
  for(let i=0;i<calcAuxCount2;i++){
    const row = document.createElement('div');
    row.className = 'calc-aux-row';
    row.innerHTML = `
      <input class="w-num" type="number" placeholder="${currentEj2.divisor}">
      <span class="op">×</span>
      <input class="w-num" type="number" placeholder="?">
      <span class="op">=</span>
      <input class="w-res" type="number" placeholder="resultado">
    `;
    wrap.appendChild(row);
  }
}
function addCalcRow2(){
  calcAuxCount2++;
  const wrap = document.getElementById('calcAuxRows2');
  const row = document.createElement('div');
  row.className = 'calc-aux-row';
  row.innerHTML = `
    <input class="w-num" type="number" placeholder="${currentEj2.divisor}">
    <span class="op">×</span>
    <input class="w-num" type="number" placeholder="?">
    <span class="op">=</span>
    <input class="w-res" type="number" placeholder="resultado">
  `;
  wrap.appendChild(row);
}

function renderEjercicio2(){
  document.getElementById('ejFeedback2').textContent = '';
  document.getElementById('ejFeedback2').style.color = 'var(--ink)';
  resetEjDiv2();
  calcAuxCount2 = 3;
  renderCalcAuxRows2();
}

function startEjercicios2(){
  generarEjercicio2();
  renderEjercicio2();
  updateProgressUI();
  showScreen('ejercicios2');
}
function nuevoEjercicio2(){
  generarEjercicio2();
  renderEjercicio2();
}
function showHint2(){
  const rem = ejDiv2.remaining;
  if(ejDiv2.phase === 'summing'){
    document.getElementById('ejFeedback2').style.color = 'var(--purple)';
    document.getElementById('ejFeedback2').textContent = '💡 Sumá todos los números que fuiste anotando en la columna del cociente.';
    return;
  }
  let potencia = 1;
  while(potencia * 10 <= rem) potencia *= 10;
  const factor = Math.floor(rem / (currentEj2.divisor * potencia)) * potencia;
  const hintTxt = factor > 0
    ? `💡 Con lo que queda (${rem}), probá con el cociente parcial ${factor}: ${currentEj2.divisor} × ${factor} = ${currentEj2.divisor*factor}.`
    : `💡 Pensá: ¿cuántas veces entra ${currentEj2.divisor} en ${rem}?`;
  document.getElementById('ejFeedback2').style.color = 'var(--purple)';
  document.getElementById('ejFeedback2').textContent = hintTxt;
}
function verificar2(){
  const fb = document.getElementById('ejFeedback2');
  if(ejDiv2.phase !== 'summing'){
    fb.style.color = 'var(--red)';
    fb.textContent = 'Primero terminá de restar hasta que el resto sea menor que el divisor. ✏️';
    return;
  }
  const val = parseInt(document.getElementById('ejFinalCociente2').value, 10);
  if(isNaN(val)){
    fb.style.color = 'var(--red)';
    fb.textContent = '✍️ Sumá los números del cociente y escribí el resultado.';
    return;
  }
  if(val === currentEj2.cociente){
    fb.style.color = 'var(--green)';
    fb.textContent = `¡Correcto! 🎉 ${currentEj2.dividendo} ÷ ${currentEj2.divisor} = ${currentEj2.cociente}`;
    registerCorrect();
    launchConfetti();
    setTimeout(nuevoEjercicio2, 1800);
  } else {
    fb.style.color = 'var(--red)';
    fb.textContent = '¡Casi! Revisá la suma de los números del cociente. 💪';
  }
}
