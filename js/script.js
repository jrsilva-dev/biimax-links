/* ==========================================================================
   BIIMAX — script.js
   1) Cenário de caatinga/agreste em SVG (sol, árvores secas, cactos, chão),
      estático — como um desenho parado
   2) Folhas secas voando com o vento (GSAP): voam, caem no chão, voam de
      novo mais à frente, saem da tela e reiniciam em loop
   3) Timeline de entrada em GSAP (foto → nome → descrição → botões)
   4) Scroll reveal em GSAP + ScrollTrigger para os cards de lançamento
   5) Microinterações em Anime.js (ripple, ícones, feedback de clique)
   6) Toggle de tema claro/escuro — o sol nasce e fica no tema claro,
      e some ao entrar no tema escuro
   7) Botão de compartilhar (mantido / preservado)
   ========================================================================== */

const prefersReducedMotion = window.matchMedia("(prefers-reduce-motion: reduce), (prefers-reduced-motion: reduce)").matches;
const isSmallScreen = window.matchMedia("(max-width: 640px)").matches;

/* ==========================================================================
   1) FOLHAS SECAS — voam com o vento, caem no chão, voam de novo mais à
      frente, saem da tela e reiniciam em loop. É o único elemento do
      background em movimento contínuo; o resto do cenário fica parado.
   ========================================================================== */
function initLeaves() {
  const layer = document.getElementById("leaves-layer");
  if (!layer) return;

  const LEAF_COUNT = isSmallScreen ? 1 : 2;
  const LEAF_COLORS = ["#9c5a24", "#7a4318"];

  for (let i = 0; i < LEAF_COUNT; i++) {
    const size = 22 + i * 5;
    const leaf = document.createElement("div");
    leaf.className = "leaf";
    leaf.innerHTML = `
      <svg viewBox="0 0 40 40" width="${size}" height="${size}">
        <path d="M20 2 C32 8 34 24 20 38 C6 24 8 8 20 2 Z" fill="${LEAF_COLORS[i % LEAF_COLORS.length]}" opacity="0.78"/>
        <path d="M20 5 L20 33" stroke="rgba(30,15,0,0.35)" stroke-width="1.4" fill="none"/>
      </svg>`;
    layer.appendChild(leaf);

    if (prefersReducedMotion) {
      // Sem movimento contínuo: a folha fica parada perto do chão
      leaf.style.left = `${12 + i * 34}%`;
      leaf.style.bottom = "9%";
      leaf.style.transform = "rotate(24deg)";
      leaf.style.opacity = "0.7";
      continue;
    }

    animateLeaf(leaf, i);
  }
}

/**
 * Monta uma sequência de "pulos" para a folha: voa (sobe + avança + gira),
 * cai e pousa no chão, pausa, voa de novo mais à frente — repetindo até
 * sair da tela, quando reinicia do lado esquerdo, fora da viewport.
 */
function animateLeaf(leaf, index) {
  if (typeof gsap === "undefined") return;

  const groundLevel = 9;                 // % a partir da base — onde a folha "pousa"
  const hops = 3;                        // quantos voos até sair da tela
  const startDelay = index * 3.2;

  gsap.set(leaf, { left: "-8%", bottom: `${groundLevel + 4}%`, rotation: 0, opacity: 0 });

  const tl = gsap.timeline({ repeat: -1, delay: startDelay });

  tl.to(leaf, { opacity: 0.78, duration: 0.4, ease: "sine.out" });

  let left = -8;
  let rotation = 0;

  for (let h = 0; h < hops; h++) {
    const forward = 24 + Math.random() * 10;
    const riseHeight = 20 + Math.random() * 12;
    left += forward;
    rotation += 150 + Math.random() * 70;

    tl.to(leaf, {
      left: `${left}%`,
      bottom: `${riseHeight}%`,
      rotation,
      duration: 1.15 + Math.random() * 0.3,
      ease: "sine.inOut",
    });

    left += 3 + Math.random() * 3;
    rotation += 35;

    tl.to(leaf, {
      left: `${left}%`,
      bottom: `${groundLevel}%`,
      rotation,
      duration: 0.5 + Math.random() * 0.15,
      ease: "power2.in",
    });

    tl.to(leaf, { duration: 0.4 + Math.random() * 0.3 });
  }

  tl.to(leaf, {
    left: "112%",
    bottom: `${groundLevel + 18}%`,
    rotation: rotation + 140,
    opacity: 0,
    duration: 1.2,
    ease: "power1.in",
  });
}

/*ENTRADA — GSAP*/
function initEntranceAnimations() {
  if (typeof gsap === "undefined") return;

  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

  tl.to("nav", { opacity: 1, filter: "blur(0px)", duration: 0.6 })
    .to("[data-reveal='avatar']", { opacity: 1, y: 0, duration: 0.7 }, "-=0.2")
    .to("[data-reveal='name']", { opacity: 1, y: 0, duration: 0.6 }, "-=0.35")
    .to("[data-reveal='tag']", { opacity: 1, y: 0, duration: 0.5 }, "-=0.35")
    .to("[data-reveal='link']", { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 }, "-=0.25");
}


function initScrollReveals() {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray("[data-reveal='card']").forEach((card, i) => {
    gsap.fromTo(
      card,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
        delay: i * 0.05,
        scrollTrigger: {
          trigger: card,
          start: "top 88%",
          once: true,
        },
      }
    );
  });
}

function initMicroInteractions() {
  const buttons = document.querySelectorAll(".link-btn");

  buttons.forEach((btn) => {
    btn.addEventListener("pointerdown", (e) => {
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement("span");
      ripple.className = "ripple";
      const size = Math.max(rect.width, rect.height) * 1.4;
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
      btn.appendChild(ripple);

      if (typeof anime !== "undefined") {
        anime({
          targets: ripple,
          scale: [0, 1],
          opacity: [0.55, 0],
          duration: 650,
          easing: "easeOutQuad",
          complete: () => ripple.remove(),
        });

        anime({
          targets: btn,
          scale: [1, 0.965, 1],
          duration: 380,
          easing: "easeOutElastic(1, .6)",
        });
      } else {
        ripple.remove();
      }
    });


    const icon = btn.querySelector(".icon-wrap");
    if (icon && typeof anime !== "undefined") {
      btn.addEventListener("pointerenter", () => {
        anime({
          targets: icon,
          translateY: [0, -3, 0],
          duration: 500,
          easing: "easeInOutQuad",
        });
      });
    }
  });

  const shareButton = document.querySelector('button[aria-label="Compartilhar"]');
  if (shareButton && typeof anime !== "undefined") {
    shareButton.addEventListener("pointerdown", () => {
      anime({
        targets: shareButton,
        scale: [1, 0.85, 1],
        duration: 400,
        easing: "easeOutElastic(1, .6)",
      });
    });
  }
}

/*TEMA*/
function initThemeToggle() {
  const toggle = document.getElementById("theme-toggle");
  const root = document.documentElement;
  const sun = document.querySelector(".scenery-sun");
  if (!toggle) return;

  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (systemPrefersDark) {
    root.classList.remove("light");
    root.classList.add("dark");
  }

  const icon = toggle.querySelector(".material-symbols-outlined");
  const syncIcon = () => {
    if (icon) icon.textContent = root.classList.contains("dark") ? "light_mode" : "dark_mode";
  };
  syncIcon();

  if (sun && typeof gsap !== "undefined") {
    const startsDark = root.classList.contains("dark");
    gsap.set(sun, {
      opacity: startsDark ? 0 : 1,
      scale: startsDark ? 0.6 : 1,
      y: startsDark ? 34 : 0,
    });
  }

  toggle.addEventListener("click", () => {
    root.classList.toggle("dark");
    root.classList.toggle("light");
    syncIcon();

    if (!sun || typeof gsap === "undefined") return;

    if (root.classList.contains("dark")) {
      gsap.to(sun, { opacity: 0, scale: 0.6, y: 34, duration: 0.9, ease: "power2.in" });
    } else {
      gsap.fromTo(
        sun,
        { opacity: 0, scale: 0.6, y: 34 },
        { opacity: 1, scale: 1, y: 0, duration: 1.1, ease: "power2.out" }
      );
    }
  });
}

/*COMPARTILHAR*/
function initShareButton() {
  const shareButton = document.querySelector('button[aria-label="Compartilhar"]');

  if (shareButton) {
    shareButton.addEventListener("click", () => {
      if (navigator.share) {
        navigator.share({
          title: "Biimax",
          text: "Confira o som do Biimax",
          url: window.location.href
        });
      } else {
        alert("Compartilhamento não suportado neste navegador.");
      }
    });
  }
}

/*BOOT*/
document.addEventListener("DOMContentLoaded", () => {
  initThemeToggle();
  initShareButton();
  initEntranceAnimations();
  initScrollReveals();
  initMicroInteractions();
  initLeaves();
});
