(function () {
  'use strict';
  var nav = document.getElementById('mainNav');
  if (nav) {
    window.addEventListener('scroll', function () {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });

    // Pages with a dark hero (.hero--dark) get a transparent, light-text nav
    // while that hero is on screen, then the nav flips solid once it scrolls past.
    var darkHero = document.querySelector('.hero--dark');
    if (darkHero && window.IntersectionObserver) {
      nav.classList.add('nav-on-hero');
      new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          nav.classList.toggle('nav-on-hero', entry.isIntersecting);
        });
      }, { rootMargin: '-77px 0px 0px 0px', threshold: 0 }).observe(darkHero);
    }
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
