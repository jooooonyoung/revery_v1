// Preloader gauge
const pre=document.getElementById('preloader');const fill=document.getElementById('fill');const pct=document.getElementById('pct');let v=0;

/* === 프리로더 스킵 (서브페이지→메뉴로 홈 올 때 로딩창 생략) === */
if (pre && sessionStorage.getItem('skipPreloader') === '1') {
  pre.style.display = 'none';               // 프리로더 즉시 숨김
  try { sessionStorage.removeItem('skipPreloader'); } catch {}
}
/* =========================================================== */

if (pre && pre.style.display !== 'none') {
  const ease = t => 1 - Math.pow(1 - t, 3);
  function tick(){
    v = Math.min(100, v + (Math.random()*2 + 1.5));
    const p = ease(v/100);
    fill.style.width = (p*100).toFixed(2) + '%';
    pct.textContent  = Math.round(v) + '%';
    if (v < 100) requestAnimationFrame(tick);
    else setTimeout(() => pre.classList.add('is-hidden'), 300);
  }
  requestAnimationFrame(tick);
}

// Reveal (간단)
const io=new IntersectionObserver((e)=>{e.forEach(x=>{if(x.isIntersecting){x.target.classList.add('is-shown');io.unobserve(x.target)}})},{threshold:0.18});
document.querySelectorAll('.left-title,.desc,.svc').forEach(el=>{el.classList.add('reveal');io.observe(el)});

// Hero eyes & parallax
const hero=document.querySelector('.hero');const heroWrap=document.querySelector('.hero-wrap');const logoBig=document.querySelector('.logo-big');const eyes=document.querySelector('.eyes');
function onScroll(){if(!heroWrap||!logoBig)return;const r=heroWrap.getBoundingClientRect();const total=Math.max(1,r.height-window.innerHeight);const prog=Math.min(1,Math.max(0,(window.innerHeight-r.bottom)/total));const sc=1-prog*0.07;const ty=prog*24;const op=1-prog*0.25;logoBig.style.transform=`translate(-50%, ${-ty}%) scale(${sc})`;logoBig.style.opacity=op;if(eyes){eyes.style.opacity=op;positionEyesByIndex();}}
window.addEventListener('scroll', onScroll, {passive:true});window.addEventListener('resize', onScroll);
function positionEyesByIndex(){if(!logoBig||!eyes||!hero)return;const lettersStr=(logoBig.dataset.letters||'revery');const N=Math.max(1,lettersStr.length);const idx=Math.max(0,Math.min(N-1,parseInt(logoBig.dataset.eyeIndex??(N-1),10)||0));const xbias=parseFloat(logoBig.dataset.eyeXbias||'0');const yPct=parseFloat(logoBig.dataset.eyeY||'0.35');const rect=logoBig.getBoundingClientRect();const hrect=hero.getBoundingClientRect();const slot=rect.width/N;const anchorX=(rect.left-hrect.left)+idx*slot+slot*(0.5+xbias);const anchorY=(rect.top-hrect.top)+rect.height*yPct;const ew=eyes.offsetWidth||86;const eh=eyes.offsetHeight||38;eyes.style.transform=`translate(${anchorX-ew/2}px, ${anchorY-eh/2}px)`;}
window.addEventListener('load', ()=>{positionEyesByIndex();onScroll();});
// === Eyes follow: 범위/속도 조절 ===
const FOLLOW_X = 5.5;   // 가로 이동 범위
const FOLLOW_Y = 1.8;   // 세로 이동 범위
const EASE     = 0.12;  // 0~1 (작을수록 느리게/부드럽게)

let tx = 0, ty = 0;     // 목표
let ex = 0, ey = 0;     // 현재(보간)

window.addEventListener('mousemove', (e)=>{
  if(!eyes) return;
  const cx = window.innerWidth/2, cy = window.innerHeight/2;
  const dx = (e.clientX - cx) / window.innerWidth;
  const dy = (e.clientY - cy) / window.innerHeight;
  tx = dx * FOLLOW_X;
  ty = dy * FOLLOW_Y;
});

function eyeLoop(){
  if(eyes){
    ex += (tx - ex) * EASE;
    ey += (ty - ey) * EASE;
    document.querySelectorAll('.eye').forEach((eye,i)=>{
      eye.style.transform = `translate(${ex + (i?2:-2)}px, ${ey}px)`;
    });
  }
  requestAnimationFrame(eyeLoop);
}
eyeLoop();
// Fullscreen overlay menu

const body=document.body;const burger=document.querySelector('.burger');const overlay=document.getElementById('nav-overlay');
function openNav(){if(!overlay)return;body.classList.add('nav-open');overlay.hidden=false;requestAnimationFrame(()=>overlay.classList.add('is-open'));burger&&burger.setAttribute('aria-expanded','true');}
function closeNav(){if(!overlay)return;overlay.classList.remove('is-open');burger&&burger.setAttribute('aria-expanded','false');body.classList.remove('nav-open');setTimeout(()=>overlay.hidden=true,280);}
burger&&burger.addEventListener('click',()=>{const expanded=burger.getAttribute('aria-expanded')==='true';expanded?closeNav():openNav();});
window.addEventListener('keydown',(e)=>{if(e.key==='Escape' && overlay && overlay.classList.contains('is-open')) closeNav();});

// --- 메뉴 링크 공통 처리: #about/#services 포함 링크 전부 처리 ---
function basePath(){ return window.location.pathname.split('#')[0]; }

document.querySelectorAll('#nav-overlay a').forEach(a=>{
  a.addEventListener('click',(e)=>{
    const href = a.getAttribute('href') || '';
    const m = href.match(/#([A-Za-z0-9_-]+)/);
    if(!m){
      // works.html / contact.html 등 다른 페이지 이동 링크는 기본 동작
      if (typeof closeNav === 'function') closeNav();
      return;
    }

    const id = m[1];           // 'about' / 'services' / 'top'
    e.preventDefault();
    if (typeof closeNav === 'function') closeNav();

    // 현재 페이지(홈)에 섹션이 있으면 부드럽게 스크롤
    const el = (id==='top') ? document.body : document.getElementById(id);
    if (el){
      setTimeout(()=>{
        if(id==='top') window.scrollTo({top:0,behavior:'smooth'});
        else el.scrollIntoView({behavior:'smooth',block:'start'});
        history.replaceState(null,'',basePath());
      },220); // 닫힘 애니 끝난 후 이동
      return;
    }

    // 서브 → 홈 섹션으로 (프리로더 생략)
    try { sessionStorage.setItem('skipPreloader','1'); } catch {}
    window.location.href = `index.html#${id}`;
  });
});

// --- 로고(좌상단) 클릭: 홈이면 상단 스크롤, 서브면 홈으로 ---
document.querySelectorAll('.brand').forEach(b=>{
  b.addEventListener('click',(e)=>{
    e.preventDefault();
    if (typeof closeNav === 'function') closeNav();
    const isHome = !!document.querySelector('.hero-wrap');
    if (isHome){
      setTimeout(()=>{ window.scrollTo({top:0,behavior:'smooth'}); history.replaceState(null,'',basePath()); }, 120);
    }else{
      try { sessionStorage.setItem('skipPreloader','1'); } catch {}
      window.location.href = 'index.html';
    }
  });
});

// Works page category filters
document.querySelectorAll('.works-cats .cat').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.works-cats .cat').forEach(b=>b.classList.remove('is-active'));
    btn.classList.add('is-active');
    const f=btn.dataset.filter;
    document.querySelectorAll('.works-list .item').forEach(it=>{
      const ok=(f==='all')||it.dataset.cat===f;
      it.style.display=ok?'block':'none';
    });
  });
});
