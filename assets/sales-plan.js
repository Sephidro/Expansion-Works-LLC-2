(() => {
  'use strict';
  const plan=document.querySelector('[data-sales-plan]');
  if(!plan)return;
  const tabs=Array.from(plan.querySelectorAll('[data-plan-tab]'));
  const cards=Array.from(plan.querySelectorAll('[role="tabpanel"]'));
  const count=plan.querySelector('[data-plan-count]');
  let current=0;
  const show=(index,focus=false)=>{
    current=(index+tabs.length)%tabs.length;
    tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===current));tab.tabIndex=i===current?0:-1;cards[i].hidden=i!==current;});
    count.textContent=`${current+1} of ${tabs.length}`;
    if(focus)tabs[current].focus();
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
  // Keep the full plan readable when scripting is unavailable. Hide inactive cards only after setup.
  plan.classList.add('plan-ready');
  show(0);
})();
