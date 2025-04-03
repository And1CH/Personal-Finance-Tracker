gsap.registerPlugin(ScrollTrigger);

// Smooth Background Color Transition
document.querySelectorAll('.slide').forEach((slide, index) => {
  gsap.to(slide, {
    backgroundColor: `rgb(${index * 50}, ${index * 50}, ${index * 50})`,
    scrollTrigger: {
      trigger: slide,
      start: 'top center',
      end: 'bottom center',
      scrub: true,
    },
  });
});

// Text and Element Animations
gsap.from(".hero-title", { duration: 1, y: -50, opacity: 0 });
gsap.from(".hero-subtitle", { duration: 1.2, y: 50, opacity: 0, delay: 0.5 });
gsap.from(".cta-buttons a", { duration: 1, scale: 0.8, opacity: 0, stagger: 0.2, delay: 1 });
