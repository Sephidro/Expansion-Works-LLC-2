(() => {
  'use strict';
  const plan=document.querySelector('[data-sales-plan]');
  if(!plan)return;
  const tabs=Array.from(plan.querySelectorAll('[data-plan-tab]'));
  const cards=Array.from(plan.querySelectorAll('[role="tabpanel"]'));
  const count=plan.querySelector('[data-plan-count]');
  const toggle=plan.querySelector('[data-plan-toggle]');
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  let current=0, timer, hovered=false, visible=!('IntersectionObserver' in window), playing=!reduced.matches;
  const schedule=()=>{
    clearTimeout(timer);
    toggle.textContent=playing?'Pause':'Play';
    toggle.setAttribute('aria-label',playing?'Pause automatic plan cards':'Play automatic plan cards');
    if(playing&&!hovered&&visible&&!document.hidden)timer=setTimeout(()=>show(current+1,false,true),10000);
  };
  const show=(index,focus=false,automatic=false)=>{
    current=(index+tabs.length)%tabs.length;
    tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===current));tab.tabIndex=i===current?0:-1;cards[i].hidden=i!==current;});
    count.setAttribute('aria-live',automatic?'off':'polite');
    count.textContent=`${current+1} of ${tabs.length}`;
    if(focus)tabs[current].focus();
    schedule();
  };
  tabs.forEach((tab,i)=>{
    tab.addEventListener('click',()=>show(i));
    tab.addEventListener('keydown',event=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
      event.preventDefault();
      show(event.key==='Home'?0:event.key==='End'?tabs.length-1:current+(event.key==='ArrowRight'?1:-1),true);
    });
  });
  plan.querySelector('[data-plan-prev]').addEventListener('click',()=>show(current-1));
  plan.querySelector('[data-plan-next]').addEventListener('click',()=>show(current+1));
  toggle.addEventListener('click',()=>{playing=!playing;schedule();});
  plan.addEventListener('mouseenter',()=>{hovered=true;schedule();});
  plan.addEventListener('mouseleave',()=>{hovered=false;schedule();});
  // Keyboard interaction stops rotation until the reader explicitly selects Play.
  plan.addEventListener('focusin',event=>{if(event.target===toggle)return;playing=false;schedule();});
  document.addEventListener('visibilitychange',schedule);
  reduced.addEventListener('change',()=>{if(reduced.matches)playing=false;schedule();});
  if('IntersectionObserver' in window)new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule();},{threshold:.25}).observe(plan);
  // Without JavaScript, all cards remain readable and controls stay hidden.
  plan.classList.add('plan-ready');
  show(0);
})();
