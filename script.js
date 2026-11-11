/* ==========================================================================
   Matchett Data Solutions
   1. Mobile menu (open, close, Escape key)
   2. Scroll animations (fade and rise into view)
   ========================================================================== */

/* "use strict" turns on stricter error checking, which helps catch typos. */
'use strict';


/* --------------------------------------------------------------------------
   1. MOBILE MENU
   -------------------------------------------------------------------------- */

// Grab the elements we need from the page.
const navToggle = document.querySelector('.nav-toggle'); // the hamburger button
const siteNav = document.getElementById('site-nav');     // the menu panel

// Opens or closes the menu. Pass true to open and false to close.
function setMenuOpen(isOpen) {
  // The CSS shows the menu when it has the "is-open" class.
  siteNav.classList.toggle('is-open', isOpen);
  // aria-expanded tells screen readers whether the menu is open.
  // The CSS also uses it to turn the hamburger into an X.
  navToggle.setAttribute('aria-expanded', String(isOpen));
}

// Clicking the hamburger flips the menu between open and closed.
navToggle.addEventListener('click', () => {
  const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
  setMenuOpen(!isOpen);
});

// Pressing Escape closes the menu and moves focus back to the button.
document.addEventListener('keydown', (event) => {
  const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
  if (event.key === 'Escape' && isOpen) {
    setMenuOpen(false);
    navToggle.focus();
  }
});

// Choosing any link inside the menu closes it, so it does not cover the page.
siteNav.addEventListener('click', (event) => {
  if (event.target.closest('a')) {
    setMenuOpen(false);
  }
});

// Clicking anywhere outside the header closes the menu too.
document.addEventListener('click', (event) => {
  if (!event.target.closest('.site-header')) {
    setMenuOpen(false);
  }
});

// If the window grows to desktop size, reset the menu to its closed state.
// (On desktop the CSS always shows the links, so the open state no longer matters.)
window.matchMedia('(min-width: 1120px)').addEventListener('change', (event) => {
  if (event.matches) {
    setMenuOpen(false);
  }
});


/* --------------------------------------------------------------------------
   2. SCROLL ANIMATIONS
   -------------------------------------------------------------------------- */

// Every element with the "reveal" class will fade and rise into view.
const revealElements = document.querySelectorAll('.reveal');

// Has the visitor asked their device to reduce motion?
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion || !('IntersectionObserver' in window)) {
  // No animation: just show everything right away.
  revealElements.forEach((element) => element.classList.add('is-visible'));
} else {
  // Stagger: inside each group (a grid of cards), delay every card by 80ms
  // more than the one before it. The first card gets 0ms, the second 80ms, and so on.
  document.querySelectorAll('[data-stagger]').forEach((group) => {
    const cards = group.querySelectorAll(':scope > .reveal');
    cards.forEach((card, index) => {
      card.style.setProperty('--reveal-delay', `${index * 80}ms`);
    });
  });

  // IntersectionObserver tells us when an element enters the visible part of the screen.
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Adding this class triggers the CSS transition.
          entry.target.classList.add('is-visible');
          // Each element only needs to animate once, so stop watching it.
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,                // fire when 15% of the element is visible
      rootMargin: '0px 0px -5% 0px'   // wait until it is slightly above the bottom edge
    }
  );

  revealElements.forEach((element) => observer.observe(element));
}
