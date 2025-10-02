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
function onScroll(){if(!heroWrap||!logoBig)return;const r=heroWrap.getBoundingClientRect();const total=Math.max(1,r.height-window.innerHeight);const prog=Math.min(1,Math.max(0,(window.innerHeight-r.bottom)/total));const sc = 1 - prog * 0.06;         // 살짝만 축소
const ty = prog * 24;
// 스크롤될수록 완전히 사라지게(=0까지)
let op = 1 - prog * 1.15;           
if (op < 0) op = 0;
logoBig.style.transform = `translate(-50%, ${-ty}%) scale(${sc})`;
logoBig.style.opacity   = op;
if (eyes) { eyes.style.opacity = op; positionEyesByIndex(); }
}

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

// ===== 공통 메뉴 초기화 (partials 주입 이후 1회만 바인딩) =====
(function(){
  let bound = false;

  function initNav(){
    if (bound) return;
    const body = document.body;
    const burger = document.querySelector('.burger');
    const overlay = document.getElementById('nav-overlay');
    if (!burger || !overlay) return; // 아직 파셜 미주입

    // 중복 바인딩 방지
    if (overlay.dataset.bound === '1') return;
    overlay.dataset.bound = '1';
    bound = true;

    // 원형 커서 엘리먼트 자동 생성(없으면)
    let oCursor = document.getElementById('overlay-cursor');
    if (!oCursor){
      oCursor = document.createElement('div');
      oCursor.id = 'overlay-cursor';
      oCursor.className = 'overlay-cursor';
      document.body.appendChild(oCursor);
    }
    let lastMX = null, lastMY = null;

    function openNav(){
      body.classList.add('nav-open');
      overlay.hidden = false;
      requestAnimationFrame(()=>overlay.classList.add('is-open'));
      burger.setAttribute('aria-expanded','true');

      // 커서 초기 위치(버거 중심)
      const r = burger.getBoundingClientRect();
      const x = (lastMX ?? (r.left + r.width/2));
      const y = (lastMY ?? (r.top  + r.height/2));
      oCursor.style.left = x + 'px';
      oCursor.style.top  = y + 'px';
    }
    function closeNav(){
      overlay.classList.remove('is-open');
      burger.setAttribute('aria-expanded','false');
      body.classList.remove('nav-open');
      setTimeout(()=>overlay.hidden = true, 280);
    }

    burger.addEventListener('click', (e)=>{
      if(e){ lastMX = e.clientX; lastMY = e.clientY; }
      const expanded = burger.getAttribute('aria-expanded')==='true';
      expanded ? closeNav() : openNav();
    });
    window.addEventListener('keydown', (e)=>{
      if(e.key==='Escape' && overlay.classList.contains('is-open')) closeNav();
    });

    // 커서 위치/축소
    window.addEventListener('mousemove',(e)=>{
      lastMX = e.clientX; lastMY = e.clientY;
      if(!body.classList.contains('nav-open')) return;
      oCursor.style.left = lastMX + 'px';
      oCursor.style.top  = lastMY + 'px';
    });
    const hoverTargets = document.querySelectorAll('#nav-overlay a, .burger');
    hoverTargets.forEach(el=>{
      el.addEventListener('mouseenter', ()=> oCursor.classList.add('shrink'));
      el.addEventListener('mouseleave', ()=> oCursor.classList.remove('shrink'));
    });

    // 링크 동작: #섹션이면 스무스 스크롤, 아니면 기본 이동
    function basePath(){ return window.location.pathname.split('#')[0]; }
    document.querySelectorAll('#nav-overlay a').forEach(a=>{
      a.addEventListener('click',(e)=>{
        const href = a.getAttribute('href') || '';
        const m = href.match(/#([A-Za-z0-9_-]+)/);
        if(!m){ closeNav(); return; } // 일반 링크는 기본 이동
        const id = m[1];
        e.preventDefault();
        closeNav();

        const el = (id==='top') ? document.body : document.getElementById(id);
        if (el){
          setTimeout(()=>{
            if(id==='top') window.scrollTo({top:0,behavior:'smooth'});
            else el.scrollIntoView({behavior:'smooth',block:'start'});
            history.replaceState(null,'',basePath());
          },220);
        }else{
          // 서브 → 홈#섹션 이동(프리로더 생략)
          try { sessionStorage.setItem('skipPreloader','1'); } catch {}
          window.location.href = `index.html#${id}`;
        }
      });
    });

    // 로고 클릭: 홈이면 스크롤, 서브면 홈으로
    document.querySelectorAll('.brand').forEach(b=>{
      b.addEventListener('click',(e)=>{
        e.preventDefault();
        closeNav();
        const isHome = !!document.querySelector('.hero-wrap');
        if (isHome){
          setTimeout(()=>{ window.scrollTo({top:0,behavior:'smooth'}); history.replaceState(null,'',basePath()); }, 120);
        }else{
          try { sessionStorage.setItem('skipPreloader','1'); } catch {}
          window.location.href = 'index.html';
        }
      });
    });
  }

  // 파셜 주입 후/ DOM 준비 후 초기화
  document.addEventListener('partials:loaded', initNav);
  document.addEventListener('DOMContentLoaded', initNav);
})();


// --- 메뉴 링크 공통 처리: #about/#services 포함 링크 전부 처리 ---
function basePath(){ return window.location.pathname.split('#')[0]; }


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

// === Tilt on hover: Our services (SNS/WEB/VIDEO/PACKAGE) ===
(function(){
  const wrap = document.querySelector('.services');
  if (!wrap) return;                 // 홈에만 존재

  const MAX = 8;                     // 최대 회전 각도(도)
  const Z   = 8;                     // 살짝 띄우기(px)
  const mql = window.matchMedia('(hover:hover)'); // 터치 기기 제외

  wrap.querySelectorAll('.svc').forEach(card=>{
    if (!mql.matches) return;

    let raf = null;

    function onMove(e){
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;   // 0~1
      const y = (e.clientY - r.top)  / r.height;  // 0~1
      // 회전 각 계산
      const rotY = (x - 0.5) * (MAX * 2);         // 좌우 기울기
      const rotX = -(y - 0.5) * (MAX * 2);        // 위아래 기울기

      // 하이라이트 위치 전달(선택 사항)
      card.style.setProperty('--mx', (x*100)+'%');
      card.style.setProperty('--my', (y*100)+'%');

      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(()=>{
        card.style.transform = `rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateZ(${Z}px)`;
      });
    }

    function onLeave(){
      if (raf) cancelAnimationFrame(raf);
      card.style.transform = 'translateZ(0) rotateX(0) rotateY(0)';
      card.classList.remove('is-tilting');
    }

    function onEnter(){
      card.classList.add('is-tilting');
    }

    card.addEventListener('pointerenter', onEnter);
    card.addEventListener('pointermove',  onMove);
    card.addEventListener('pointerleave', onLeave);
  });
})();