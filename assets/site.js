(function () {
  'use strict';
  var nav = document.getElementById('mainNav');
  if (nav) {
    window.addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    document.querySelectorAll('.reveal').forEach(function (el) {
      ScrollTrigger.create({
        trigger: el, start: 'top 88%', once: true,
        onEnter: function () { el.classList.add('visible'); }
      });
    });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('visible'); });
  }
})();
