/**
 * PocketMC Marketplace Controller
 * - GSAP ScrollTrigger & Flip animations matching main page
 * - 3D Card interactive tilt & perspective physics
 * - Smooth entrance choreography for hero, search & cards
 * - Real-time keyword search & category filter engine
 */

class MarketplaceApp {
  constructor() {
    this.registerPlugins();
    this.initSmoothScroll();
    this.initHeroAnimations();
    this.initCardGridEntrance();
    this.initSearchAndFilter();
    this.initSearchFocusEffects();
    this.initCardTilt();
    this.initNavbarScroll();
  }

  registerPlugins() {
    if (window.gsap) {
      const plugins = [];
      if (window.ScrollTrigger) plugins.push(ScrollTrigger);
      if (window.Flip) plugins.push(Flip);
      if (window.Draggable) plugins.push(Draggable);
      if (plugins.length) gsap.registerPlugin(...plugins);
    }
  }

  /* -------------------------------------------------------------------------- */
  /* 1. SMOOTH SCROLL (LENIS)                                                   */
  /* -------------------------------------------------------------------------- */
  initSmoothScroll() {
    if (window.Lenis) {
      this.lenis = new Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothTouch: false
      });

      const raf = (time) => {
        this.lenis.raf(time);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);

      if (window.ScrollTrigger) {
        this.lenis.on("scroll", ScrollTrigger.update);
      }
    }
  }

  /* -------------------------------------------------------------------------- */
  /* 2. HERO CHOREOGRAPHED ENTRANCE ANIMATION (Matching Main Page Quality)     */
  /* -------------------------------------------------------------------------- */
  initHeroAnimations() {
    if (!window.gsap) return;

    // Reduced-motion: skip animations
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(".site-header", { autoAlpha: 1, y: 0, clearProps: "all" });
      return;
    }

    const heroTL = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: () => {
        gsap.set(".site-header", { clearProps: "all" });
      }
    });

    heroTL
      // Navbar entrance — identical to homepage (y: -25, autoAlpha: 0 → y: 0, autoAlpha: 1)
      .fromTo(".site-header",
        { y: -25, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.7, clearProps: "all" }
      )
      .from(".marketplace-hero .section-tagline", {
        opacity: 0,
        y: 16,
        scale: 0.95,
        duration: 0.6,
        delay: 0.1
      })
      .from(".marketplace-hero .section-title", {
        opacity: 0,
        y: 28,
        duration: 0.7
      }, "-=0.4")
      .from(".marketplace-hero .section-desc", {
        opacity: 0,
        y: 18,
        duration: 0.6
      }, "-=0.45")
      .from(".marketplace-search-container", {
        opacity: 0,
        y: 22,
        scale: 0.97,
        duration: 0.65,
        ease: "back.out(1.2)"
      }, "-=0.35")
      .from(".marketplace-filter-tabs .filter-btn", {
        opacity: 0,
        y: 14,
        stagger: 0.04,
        duration: 0.45,
        ease: "power2.out",
        clearProps: "all"
      }, "-=0.3");
  }

  /* -------------------------------------------------------------------------- */
  /* 3. CARD GRID SCROLLTRIGGER ENTRANCE                                       */
  /* -------------------------------------------------------------------------- */
  initCardGridEntrance() {
    if (!window.gsap) return;

    const cards = document.querySelectorAll(".plugin-grid .plugin-card");
    if (!cards.length) return;

    if (window.ScrollTrigger) {
      gsap.from(cards, {
        scrollTrigger: {
          trigger: ".shop-section",
          start: "top 88%",
          toggleActions: "play none none none"
        },
        opacity: 0,
        y: 36,
        scale: 0.96,
        stagger: 0.04,
        duration: 0.55,
        ease: "power2.out",
        clearProps: "transform,opacity"
      });
    }
  }

  /* -------------------------------------------------------------------------- */
  /* 4. REAL-TIME SEARCH & CATEGORY FILTER ENGINE (Smooth Animated Wave)        */
  /* -------------------------------------------------------------------------- */
  initSearchAndFilter() {
    const searchInput = document.getElementById("plugin-search-input");
    const clearBtn = document.getElementById("btn-clear-search");
    const filterBtns = Array.from(document.querySelectorAll(".filter-btn"));
    const emptyState = document.getElementById("empty-search-state");
    const emptyDesc = document.getElementById("empty-desc-text");
    const resetBtn = document.getElementById("btn-reset-filters");
    const cards = Array.from(document.querySelectorAll(".plugin-card"));

    if (!cards.length) return;

    let currentFilter = "all";
    let currentQuery = "";

    const applySearchAndFilter = () => {
      let visibleCount = 0;
      const matchedCards = [];
      const hiddenCards = [];

      cards.forEach((card) => {
        const cat = (card.getAttribute("data-category") || "").toLowerCase();
        const title = (card.getAttribute("data-title") || card.querySelector(".plugin-title")?.textContent || "").toLowerCase();
        const tags = (card.getAttribute("data-tags") || "").toLowerCase();
        const desc = (card.querySelector(".plugin-desc")?.textContent || "").toLowerCase();

        const matchesCategory = currentFilter === "all" || cat.includes(currentFilter);
        const matchesSearch = !currentQuery || 
          title.includes(currentQuery) || 
          tags.includes(currentQuery) || 
          desc.includes(currentQuery);

        if (matchesCategory && matchesSearch) {
          matchedCards.push(card);
          visibleCount++;
        } else {
          hiddenCards.push(card);
        }
      });

      // Kill any running card tweens to prevent stacking
      if (window.gsap) gsap.killTweensOf(cards);

      const animateIn = () => {
        matchedCards.forEach(c => c.style.display = "flex");

        // Staggered wave entrance — identical to main page
        gsap.fromTo(matchedCards,
          { opacity: 0, scale: 0.94, y: 16 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.35,
            stagger: 0.05,
            ease: "power2.out",
            clearProps: "transform,opacity",
            onComplete: () => {
              if (window.ScrollTrigger) ScrollTrigger.refresh();
              if (this.lenis) this.lenis.resize();
            }
          }
        );
      };

      // Step 1: Smooth fade-out exit — identical to main page
      if (hiddenCards.length > 0 && window.gsap) {
        gsap.to(hiddenCards, {
          opacity: 0,
          scale: 0.94,
          y: -10,
          duration: 0.16,
          ease: "power2.in",
          onComplete: () => {
            hiddenCards.forEach(c => c.style.display = "none");
            animateIn();
          }
        });
      } else {
        animateIn();
      }

      // Toggle Empty State
      if (emptyState) {
        if (visibleCount === 0) {
          emptyState.style.display = "flex";
          if (emptyDesc) {
            emptyDesc.textContent = currentQuery 
              ? `We couldn't find any plugins matching "${currentQuery}". Try checking for typos or searching by category.`
              : "No plugins available in this category.";
          }
        } else {
          emptyState.style.display = "none";
        }
      }
    };

    // Live Search Input Listener
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        currentQuery = e.target.value.toLowerCase().trim();
        if (clearBtn) {
          clearBtn.classList.toggle("visible", currentQuery.length > 0);
        }
        applySearchAndFilter();
      });
    }

    // Clear Search Button
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        if (searchInput) {
          searchInput.value = "";
          searchInput.focus();
        }
        currentQuery = "";
        clearBtn.classList.remove("visible");
        applySearchAndFilter();
      });
    }

    // Category Filter Buttons Listener
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.classList.contains("active")) return;

        filterBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        if (window.gsap) {
          gsap.fromTo(btn, 
            { scale: 0.92 }, 
            { scale: 1, duration: 0.25, ease: "back.out(2)" }
          );
        }

        currentFilter = btn.getAttribute("data-filter") || "all";
        applySearchAndFilter();
      });
    });

    // Reset Filters Button
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        currentFilter = "all";
        currentQuery = "";

        if (searchInput) searchInput.value = "";
        if (clearBtn) clearBtn.classList.remove("visible");

        filterBtns.forEach((b) => {
          b.classList.toggle("active", b.getAttribute("data-filter") === "all");
        });

        applySearchAndFilter();
      });
    }
  }

  /* -------------------------------------------------------------------------- */
  /* 5. SEARCH BOX FOCUS EFFECTS                                                */
  /* -------------------------------------------------------------------------- */
  initSearchFocusEffects() {
    const searchInput = document.getElementById("plugin-search-input");
    const searchBox = document.querySelector(".marketplace-search-box");
    if (!searchInput || !searchBox || !window.gsap) return;

    searchInput.addEventListener("focus", () => {
      gsap.to(searchBox, {
        scale: 1.015,
        borderColor: "#111827",
        boxShadow: "0 12px 32px rgba(0, 0, 0, 0.09)",
        duration: 0.25,
        ease: "power2.out"
      });
    });

    searchInput.addEventListener("blur", () => {
      gsap.to(searchBox, {
        scale: 1,
        borderColor: "rgba(0, 0, 0, 0.12)",
        boxShadow: "none",
        duration: 0.25,
        ease: "power2.out"
      });
    });
  }

  /* -------------------------------------------------------------------------- */
  /* 6. 3D CARD TILT ON MOUSEMOVE (Matching Main Page)                          */
  /* -------------------------------------------------------------------------- */
  initCardTilt() {
    if (!window.gsap) return;
    const cards = Array.from(document.querySelectorAll(".plugin-card"));

    cards.forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const rotY = gsap.utils.mapRange(0, rect.width, -6, 6, x);
        const rotX = gsap.utils.mapRange(0, rect.height, 6, -6, y);

        gsap.to(card, {
          rotationX: rotX,
          rotationY: rotY,
          y: 0,
          duration: 0.25,
          ease: "power1.out",
          transformPerspective: 900
        });
      });

      card.addEventListener("mouseleave", () => {
        gsap.to(card, {
          rotationX: 0,
          rotationY: 0,
          y: 0,
          duration: 0.4,
          ease: "power2.out",
          onComplete: () => {
            gsap.set(card, { clearProps: "transform" });
          }
        });
      });
    });
  }

  /* -------------------------------------------------------------------------- */
  /* 7. NAVBAR BLUR & SCROLL POLISH                                             */
  /* -------------------------------------------------------------------------- */
  initNavbarScroll() {
    const header = document.querySelector(".site-header");
    if (!header) return;

    window.addEventListener("scroll", () => {
      if (window.scrollY > 30) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
    }, { passive: true });
  }
}

// Instantiate on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  window.marketplaceApp = new MarketplaceApp();
});
