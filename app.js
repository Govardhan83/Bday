// Basic slide control
const slides = Array.from(document.querySelectorAll('.slide'));
function showSlide(id){
  slides.forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo({top:0,behavior:'smooth'});
}

// music handling
const bgMusic = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');
let musicPlaying = false;
function tryPlayMusic(){
  bgMusic.volume = 0.18;
  bgMusic.play().then(()=>{ musicPlaying=true; musicToggle.textContent='🔊'; }).catch(()=>{ musicPlaying=false; musicToggle.textContent='🔈'; });
}
musicToggle.addEventListener('click', ()=>{
  if(bgMusic.paused){ bgMusic.play(); musicToggle.textContent='🔊'; } else { bgMusic.pause(); musicToggle.textContent='🔈'; }
});

// start button -> slide 2
document.getElementById('startBtn').addEventListener('click', ()=>{
  showSlide('slide-audio');
  tryPlayMusic();
});

document.getElementById('toChoiceFromAudio').addEventListener('click', ()=> showSlide('slide-choice'));

// path buttons
document.getElementById('path1').addEventListener('click', ()=> showSlide('slide-maze'));
document.getElementById('path2').addEventListener('click', ()=> showSlide('slide-mobiletask'));

// from mobile task to cake
document.getElementById('startCake').addEventListener('click', ()=> showSlide('slide-cake'));

// back buttons after messages
document.getElementById('backToChoice1').addEventListener('click', ()=> showSlide('slide-choice'));
document.getElementById('backToChoice2').addEventListener('click', ()=> showSlide('slide-choice'));

// skip maze
document.getElementById('skipMaze').addEventListener('click', ()=> showSlide('slide-message1'));

// Typewriter effect for warning (reads data-text)
document.querySelectorAll('.typewriter').forEach(el=>{
  const txt = el.dataset.text || el.textContent;
  el.textContent = '';
  let idx=0;
  function step(){ if(idx<=txt.length){ el.textContent = txt.slice(0, idx); idx++; setTimeout(step, 40); } }
  step();
});

// -------- Maze: mouse-controlled "no-escape" experience --------
const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 600; canvas.height = 480;

// Draw a heart-shaped boundary path and some walls. We'll let the mouse control a dot.
// The dot can't reach an "exit" -- after some time we'll show popup.
const centerX = canvas.width/2;
const centerY = canvas.height/2;
function drawHeart(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  // background gradient
  const g = ctx.createLinearGradient(0,0,0,canvas.height);
  g.addColorStop(0,'rgba(255,94,168,0.06)');
  g.addColorStop(1,'rgba(161,108,255,0.03)');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // heart outline
  ctx.beginPath();
  const scale = 12;
  ctx.moveTo(centerX, centerY + 20);
  for(let t=0;t<Math.PI*2;t+=0.02){
    const x = 16*Math.pow(Math.sin(t),3);
    const y = - (13*Math.cos(t) - 5*Math.cos(2*t) - 2*Math.cos(3*t) - Math.cos(4*t));
    if(t===0) ctx.moveTo(centerX + x*scale, centerY + y*scale);
    else ctx.lineTo(centerX + x*scale, centerY + y*scale);
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(255,255,255,0.02)';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(255,94,168,0.6)';
  ctx.stroke();

  // random walls inside
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  for(let i=0;i<6;i++){
    ctx.save();
    const rx = 80 + i*60;
    const ry = 120 + ((i%2)*40);
    ctx.translate(rx, ry);
    ctx.rotate((i%2?0.2:-0.3));
    ctx.fillRect(-60, -6, 120, 12);
    ctx.restore();
  }
}
drawHeart();

// player dot follows mouse when inside canvas
let player = {x:50,y:50,r:12};
function drawPlayer(){
  ctx.beginPath();
  ctx.fillStyle = '#ff6ea8';
  ctx.shadowBlur = 14; ctx.shadowColor = 'rgba(255,110,160,0.6)';
  ctx.arc(player.x, player.y, player.r, 0, Math.PI*2);
  ctx.fill();
  ctx.shadowBlur = 0;
}
drawPlayer();

let mazeStarted = false;
let mazePopupShown = false;
let mazeTimer = null;
canvas.addEventListener('mousemove', (e)=>{
  const rect = canvas.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  player.x = Math.max(player.r, Math.min(canvas.width - player.r, mx));
  player.y = Math.max(player.r, Math.min(canvas.height - player.r, my));
  // redraw
  drawHeart();
  drawPlayer();
  if(!mazeStarted){
    mazeStarted = true;
    // after 13 seconds show popup
    mazeTimer = setTimeout(()=>{
      if(!mazePopupShown){
        mazePopupShown = true;
        setTimeout(()=>{
          alert("IDIOT 😤 Don't you know? Gov can never escape from your heart ❤️");
          showSlide('slide-message1');
        }, 150);
      }
    }, 13000);
  }
});

// If she doesn't move, start timer on entering slide
document.getElementById('path1').addEventListener('click', ()=>{
  mazeStarted = false; mazePopupShown = false; clearTimeout(mazeTimer);
  // reset player center
  player.x = canvas.width/2; player.y = canvas.height/2;
  drawHeart(); drawPlayer();
});

// -------- Cake & Candles game (hidden clickable candles + drag to cake) --------
const hiddenCandlesContainer = document.getElementById('hiddenCandles');
const inventory = document.getElementById('inventory');
const cakeSlots = document.getElementById('cakeSlots');

// create 5 hidden candles in random spots
const candleCount = 5;
for(let i=0;i<candleCount;i++){
  const c = document.createElement('img');
  c.src = 'assets/images/candle.png';
  c.className = 'candle';
  c.style.position = 'absolute';
  c.style.left = (20 + Math.random()*280) + 'px';
  c.style.top = (20 + Math.random()*200) + 'px';
  c.title = 'Click to collect';
  hiddenCandlesContainer.appendChild(c);
  c.addEventListener('click', ()=>{
    // move to inventory as draggable
    c.style.position = 'relative'; c.style.left=''; c.style.top='';
    inventory.appendChild(c);
    c.draggable = true;
    c.addEventListener('dragstart', (ev)=>{
      ev.dataTransfer.setData('text/plain', 'candle');
      ev.dataTransfer.setData('text/id', ''+Math.random());
    });
  }, {once:true});
}

// create cake slots for candle placement
const slotsPositions = [{left:120,top:80},{left:160,top:60},{left:200,top:80},{left:140,top:100},{left:180,top:100}];
slotsPositions.forEach((p,idx)=>{
  const s = document.createElement('div');
  s.className = 'slot';
  s.style.left = p.left + 'px';
  s.style.top = p.top + 'px';
  s.dataset.index = idx;
  cakeSlots.appendChild(s);
  // allow drop
  s.addEventListener('dragover',(e)=>{ e.preventDefault(); s.style.borderColor='rgba(255,255,255,0.6)'; });
  s.addEventListener('dragleave',()=>{ s.style.borderColor='rgba(255,255,255,0.12)'; });
  s.addEventListener('drop',(e)=>{
    e.preventDefault();
    const dragged = inventory.querySelector('.candle');
    if(!dragged) return;
    // place a clone at absolute position inside cakeArea
    const placed = dragged.cloneNode(true);
    placed.style.position='absolute';
    placed.style.left = p.left + 'px';
    placed.style.top = p.top + 'px';
    placed.style.width = '36px';
    placed.style.height = '72px';
    document.getElementById('cakeArea').appendChild(placed);
    dragged.remove();
    s.style.display='none';
  });
});

// toMessage2 button
document.getElementById('toMessage2').addEventListener('click', ()=> showSlide('slide-message2'));

// small helper: when slide becomes active try play bg music
const observer = new MutationObserver((mut)=>{
  mut.forEach(m=>{
    if(m.attributeName === 'class'){
      const el = m.target;
      if(el.classList.contains('active')){
        // try play music on slide show for desktop
        tryPlayMusic();
      }
    }
  });
});
slides.forEach(s=>observer.observe(s,{attributes:true}));

// small accessibility: allow keyboard Enter to advance on audio slide
document.addEventListener('keydown',(e)=>{
  if(e.key==='Enter'){
    const active = document.querySelector('.slide.active');
    if(active && active.id==='slide-audio') showSlide('slide-choice');
  }
});
