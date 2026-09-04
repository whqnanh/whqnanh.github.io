/**
 * POCKETMC // MINECRAFT PLUGIN MARKETPLACE ANIMATION CONTROLLER
 * Leveraging official skills from .agents/skills:
 * - gsap-core (defaults, easing, fromTo, clearProps, autoAlpha, transforms)
 * - gsap-timeline (sequencing, position parameters, labels)
 * - gsap-scrolltrigger (scroll-driven reveals, counter animations, pinned benchmark)
 * - gsap-utils (clamp, mapRange, random, toArray)
 * - gsap-plugins (Flip, ScrollToPlugin, Draggable)
 * - gsap-performance (transforms over layout props, will-change)
 * - Web Audio API (Authentic Minecraft-like sound synthesis)
 */

// Force manual scroll restoration: reload will ALWAYS return to top main title
if (typeof history !== "undefined" && "scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}
try {
  window.scrollTo(0, 0);
  window.addEventListener("beforeunload", () => {
    window.scrollTo(0, 0);
  });
} catch(e) {}

class MinecraftSoundSystem {
  constructor() {
    this.ctx = null;
  }

  getAudioContext() {
    return null;
  }

  playClick() {}
  playPop() {}
  playChestOpen() {}
  playLevelUp() {}
  playTeleport() {}
  playError() {}
}

class PocketMCApp {
  constructor() {
    this.isZeroG = false;
    this.floatingTweens = [];
    this.sounds = new MinecraftSoundSystem();
    this.init();
  }

  init() {
    // Register official GSAP plugins (from .agents/skills/gsap-plugins)
    if (window.gsap) {
      gsap.defaults({
        duration: 0.6,
        ease: "power2.out"
      });

      const plugins = [];
      if (window.ScrollTrigger) plugins.push(ScrollTrigger);
      if (window.Flip) plugins.push(Flip);
      if (window.ScrollToPlugin) plugins.push(ScrollToPlugin);
      if (window.Draggable) plugins.push(Draggable);

      if (plugins.length > 0) {
        gsap.registerPlugin(...plugins);
      }
    }

    window.app = this;
    this.isNavigating = false;

    this.initSmoothScroll();
    this.initHeroEntrance();
    this.initFloatingTitleBlocks();
    this.initScrollToSmooth();
    this.initSectionTitleTypewriter();
    this.initResponsiveScrollTrigger();
    this.initShopFilterWithFlip();
    this.initCardTiltWithUtils();
    this.initMagneticButtons();
    this.initTestimonialRotation();
    this.initYamlStudio();
    this.initButtonEffects();
    this.initDynamicCursorInversion();
    this.initSmileCarousel();
    this.initSeeMorePlugins();
    this.initMysteryChest();

    // Recalculate ScrollTrigger start points after DOM is fully structured
    if (window.ScrollTrigger) {
      ScrollTrigger.refresh();
    }
  }

  /* -------------------------------------------------------------------------- */
  /* 2. HERO ENTRANCE (ROBUST fromTo with clearProps)                            */
  /* -------------------------------------------------------------------------- */
  initHeroEntrance() {
    if (!window.gsap) return;

    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(".site-header, .hero-headline, .hero-btn-group .btn-pill, .floating-block", {
        autoAlpha: 1,
        y: 0,
        clearProps: "all"
      });
      return;
    }

    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: () => {
        gsap.set(".site-header, .hero-headline, .hero-btn-group .btn-pill", {
          clearProps: "all"
        });
      }
    });

    tl.fromTo(".site-header", 
      { y: -25, autoAlpha: 0 }, 
      { y: 0, autoAlpha: 1, duration: 0.7, clearProps: "all" }
    )
    .fromTo(".hero-headline", 
      { y: 25, autoAlpha: 0 }, 
      { y: 0, autoAlpha: 1, duration: 0.8, clearProps: "all" }, 
      "-=0.35"
    )
    .fromTo(".hero-btn-group .btn-pill", 
      { y: 15, autoAlpha: 0 }, 
      { y: 0, autoAlpha: 1, stagger: 0.1, duration: 0.6, clearProps: "all" }, 
      "-=0.45"
    );
  }

  /* -------------------------------------------------------------------------- */
  /* ZERO-GRAVITY FREE SPACE FLOATING MINECRAFT 3D BLOCKS (BAY TRONG KHÔNG GIAN) */
  /* -------------------------------------------------------------------------- */
  initFloatingTitleBlocks() {
    const blocks = document.querySelectorAll(".floating-block");
    const hero = document.getElementById("hero");
    if (!blocks.length || !window.gsap || !hero) return;

    // Ensure all blocks are 100% visible and centered on coordinate
    gsap.set(blocks, { autoAlpha: 1, xPercent: -50, yPercent: -50 });

    let heroWidth = hero.offsetWidth || window.innerWidth;
    let heroHeight = hero.offsetHeight || window.innerHeight;

    // Desktop layout (5 blocks)
    const desktopConfigs = [
      { xRatio: 0.14, yRatio: 0.24, heading: 0.7, speed: 42, rotSpeed: 3.5 },   // Crafting Table (Top-Left)
      { xRatio: 0.86, yRatio: 0.24, heading: 2.4, speed: 40, rotSpeed: -3.8 },  // Enchanting Table (Top-Right)
      { xRatio: 0.14, yRatio: 0.76, heading: 5.4, speed: 44, rotSpeed: 3.2 },   // Grass Block (Bottom-Left)
      { xRatio: 0.86, yRatio: 0.76, heading: 3.8, speed: 42, rotSpeed: -3.4 },  // Bookshelf (Bottom-Right)
      { xRatio: 0.50, yRatio: 0.14, heading: 1.6, speed: 38, rotSpeed: 4.2 }    // Anvil (Top-Center)
    ];

    // Mobile layout (3 blocks: Top-Left, Top-Right, Bottom-Center - huge open breathing room)
    const mobileConfigs = [
      { xRatio: 0.18, yRatio: 0.16, heading: 0.8, speed: 28, rotSpeed: 3.0 },   // Crafting Table (Top-Left)
      { xRatio: 0.82, yRatio: 0.16, heading: 2.3, speed: 28, rotSpeed: -3.0 },  // Enchanting Table (Top-Right)
      { xRatio: 0.50, yRatio: 0.84, heading: 4.7, speed: 30, rotSpeed: 2.8 },   // Grass Block (Bottom-Center)
      { xRatio: 0.18, yRatio: 0.84, heading: 5.4, speed: 28, rotSpeed: -3.0 },  // Bookshelf
      { xRatio: 0.50, yRatio: 0.12, heading: 1.6, speed: 28, rotSpeed: 3.2 }    // Anvil
    ];

    const isMobInitial = heroWidth < 640;
    const initialConfigs = isMobInitial ? mobileConfigs : desktopConfigs;

    const updateBounds = () => {
      heroWidth = hero.offsetWidth || window.innerWidth;
      heroHeight = hero.offsetHeight || window.innerHeight;
      const isMob = heroWidth < 640;
      blockStates.forEach((state, i) => {
        const cfgs = isMob ? mobileConfigs : desktopConfigs;
        const cfg = cfgs[i % cfgs.length];
        if (!state.isDragging) {
          state.homeXRatio = cfg.xRatio;
          state.homeYRatio = cfg.yRatio;
        }
      });
    };
    window.addEventListener("resize", updateBounds);

    const blockStates = Array.from(blocks).map((el, i) => {
      const cfg = initialConfigs[i % initialConfigs.length];
      const img = el.querySelector(".floating-block-img") || el;

      const state = {
        el,
        img,
        x: heroWidth * cfg.xRatio,
        y: heroHeight * cfg.yRatio,
        homeXRatio: cfg.xRatio,
        homeYRatio: cfg.yRatio,
        heading: cfg.heading, // direction in radians
        speed: cfg.speed,     // pixels per second (gentle zero-g drift)
        rot: (i * 18) - 35,   // current rotation in degrees
        rotSpeed: cfg.rotSpeed,
        zPhase: i * 1.45,
        isHovered: false,
        isDragging: false,
        steerFreq: 0.3 + (i * 0.1),
        steerPhase: i * 2.2
      };

      // Set initial position immediately
      gsap.set(el, { x: state.x, y: state.y, rotation: state.rot });

      // Unified Touch & Pointer Dragging Controller with Instant Tooltip Support
      let startPointerX = 0;
      let startPointerY = 0;
      let startBlockX = 0;
      let startBlockY = 0;

      el.addEventListener("pointerdown", (e) => {
        // Prevent default mobile pinch/pan or browser ghost-drag
        e.preventDefault();
        e.stopPropagation();

        state.isDragging = true;
        startPointerX = e.clientX;
        startPointerY = e.clientY;
        startBlockX = state.x;
        startBlockY = state.y;

        // Dismiss all other tooltips and activate this block
        blockStates.forEach((s) => {
          if (s !== state) {
            s.el.classList.remove("is-active", "is-dragging");
            gsap.to(s.img, { scale: 1.0, duration: 0.2, overwrite: "auto" });
          }
        });

        // Show tooltip and scale up immediately on touch or click
        el.classList.add("is-active", "is-dragging");
        gsap.to(img, {
          scale: 1.28,
          duration: 0.2,
          ease: "back.out(2.2)",
          overwrite: "auto"
        });

        try {
          el.setPointerCapture(e.pointerId);
        } catch (_) {}
      });

      el.addEventListener("pointermove", (e) => {
        if (!state.isDragging) return;
        const dx = e.clientX - startPointerX;
        const dy = e.clientY - startPointerY;

        const pad = 35;
        state.x = Math.max(pad, Math.min(heroWidth - pad, startBlockX + dx));
        state.y = Math.max(pad, Math.min(heroHeight - pad, startBlockY + dy));

        // Direct position update during active drag
        gsap.set(el, { x: state.x, y: state.y, zIndex: 9999 });
      });

      const finishDragOrTap = (e) => {
        if (!state.isDragging) return;
        state.isDragging = false;
        el.classList.remove("is-dragging");

        try {
          if (e && e.pointerId) el.releasePointerCapture(e.pointerId);
        } catch (_) {}

        // Anchor updates to new position so it stays and floats around where the user dropped it
        state.homeXRatio = Math.max(0.08, Math.min(0.92, state.x / heroWidth));
        state.homeYRatio = Math.max(0.12, Math.min(0.88, state.y / heroHeight));
        state.heading = Math.random() * Math.PI * 2;

        // Keep tooltip visible for 2.2 seconds after tap or release, then gently fade unless hovered
        clearTimeout(state.hideTooltipTimer);
        state.hideTooltipTimer = setTimeout(() => {
          if (!state.isDragging && !state.isHovered) {
            el.classList.remove("is-active");
            gsap.to(img, {
              scale: 1.0,
              duration: 0.3,
              ease: "power2.out",
              overwrite: "auto"
            });
          }
        }, 2200);
      };

      el.addEventListener("pointerup", finishDragOrTap);
      el.addEventListener("pointercancel", finishDragOrTap);

      // Desktop Hover Interaction (mouse cursor)
      el.addEventListener("mouseenter", () => {
        state.isHovered = true;
        el.classList.add("is-active");
        gsap.to(img, {
          scale: 1.25,
          duration: 0.25,
          ease: "back.out(2)",
          overwrite: "auto"
        });
      });

      el.addEventListener("mouseleave", () => {
        state.isHovered = false;
        if (!state.isDragging) {
          el.classList.remove("is-active");
          gsap.to(img, {
            scale: 1.0,
            duration: 0.32,
            ease: "power2.out",
            overwrite: "auto"
          });
        }
      });

      return state;
    });

    const isReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isReduced) return;

    // Mouse coordinates for gentle space micro-deflection
    const mousePos = { x: -9999, y: -9999, active: false };
    hero.addEventListener("mousemove", (e) => {
      const rect = hero.getBoundingClientRect();
      mousePos.x = e.clientX - rect.left;
      mousePos.y = e.clientY - rect.top;
      mousePos.active = true;
    });
    hero.addEventListener("mouseleave", () => {
      mousePos.active = false;
    });
    // Dismiss tooltips when tapping or clicking anywhere outside the floating blocks
    document.addEventListener("pointerdown", (e) => {
      if (!e.target.closest(".floating-block")) {
        blockStates.forEach((s) => {
          s.el.classList.remove("is-active");
          if (!s.isHovered && !s.isDragging) {
            gsap.to(s.img, { scale: 1.0, duration: 0.25, overwrite: "auto" });
          }
        });
      }
    });

    // Master Zero-Gravity Space Drift Ticker Loop
    gsap.ticker.add((time, deltaTime) => {
      const dt = Math.min(deltaTime / 1000, 0.05);
      const isMob = heroWidth < 640;

      // Only simulate currently visible blocks (automatically filters out blocks hidden on mobile)
      const activeStates = blockStates.filter((state) => state.el.offsetParent !== null);
      if (!activeStates.length) return;

      const padX = isMob ? 26 : 70;
      const padY = isMob ? 30 : 70;
      const maxX = heroWidth - padX;
      const maxY = heroHeight - padY;

      // 1. Move each block inside its spacious territory with organic steering
      activeStates.forEach((state) => {
        if (state.isDragging) return;

        // Subtle organic space steering
        const steerNoise = Math.sin(time * state.steerFreq + state.steerPhase) * 0.65;
        state.heading += steerNoise * dt;

        // Strict Tether to home area
        const homeX = heroWidth * state.homeXRatio;
        const homeY = heroHeight * state.homeYRatio;
        const toHomeX = homeX - state.x;
        const toHomeY = homeY - state.y;
        const distFromHome = Math.hypot(toHomeX, toHomeY);
        const tetherThreshold = isMob ? 85 : 160;
        if (distFromHome > tetherThreshold) {
          const targetHeading = Math.atan2(toHomeY, toHomeX);
          let diff = targetHeading - state.heading;
          while (diff < -Math.PI) diff += Math.PI * 2;
          while (diff > Math.PI) diff -= Math.PI * 2;
          state.heading += diff * (isMob ? 3.2 : 2.5) * dt;
        }

        // Soft boundary bounce: smoothly steer away from outer walls
        if (state.x < padX) {
          state.heading = 0 + (Math.sin(time) * 0.3);
        } else if (state.x > maxX) {
          state.heading = Math.PI + (Math.sin(time) * 0.3);
        }
        if (state.y < padY) {
          state.heading = Math.PI / 2 + (Math.cos(time) * 0.3);
        } else if (state.y > maxY) {
          state.heading = -Math.PI / 2 + (Math.cos(time) * 0.3);
        }

        // Center headline avoidance (scaled ellipse so blocks are not shoved offscreen on narrow mobile)
        const centerX = heroWidth * 0.5;
        const centerY = heroHeight * 0.48;
        const avoidRx = isMob ? (heroWidth * 0.30) : 210;
        const avoidRy = isMob ? 100 : 150;
        const ndx = (state.x - centerX) / avoidRx;
        const ndy = (state.y - centerY) / avoidRy;
        const ellipDist = Math.hypot(ndx, ndy);
        if (ellipDist < 1.0 && ellipDist > 0.001) {
          const pushOut = (1.0 - ellipDist) * (isMob ? 80 : 140) * dt;
          state.x += (ndx / ellipDist) * pushOut * avoidRx * 0.01;
          state.y += (ndy / ellipDist) * pushOut * avoidRy * 0.01;
        }

        // Mouse micro-repulsion (PC only)
        if (mousePos.active && !state.isHovered && !isMob) {
          const mdx = state.x - mousePos.x;
          const mdy = state.y - mousePos.y;
          const mDist = Math.hypot(mdx, mdy);
          if (mDist < 160 && mDist > 1) {
            const mPush = ((160 - mDist) / 160) * 80 * dt;
            state.x += (mdx / mDist) * mPush;
            state.y += (mdy / mDist) * mPush;
          }
        }

        // Space drift translation
        const baseSpeed = isMob ? (state.speed * 0.68) : state.speed;
        const currentSpeed = state.isHovered ? (baseSpeed * 0.1) : baseSpeed;
        state.x += Math.cos(state.heading) * currentSpeed * dt;
        state.y += Math.sin(state.heading) * currentSpeed * dt;

        // Clamp to hero bounds
        state.x = Math.max(padX, Math.min(maxX, state.x));
        state.y = Math.max(padY, Math.min(maxY, state.y));

        // Tumbling rotation in space
        state.rot += state.rotSpeed * dt;
      });

      // 2. HARD DISTANCE ENFORCEMENT
      // Generous threshold on PC (200-320px); on mobile: 75px keeps 48px blocks nicely separated without any jamming
      const safeMinDist = isMob ? 75 : Math.max(200, Math.min(heroWidth * 0.32, 320));

      for (let iter = 0; iter < 2; iter++) {
        for (let i = 0; i < activeStates.length; i++) {
          for (let j = i + 1; j < activeStates.length; j++) {
            const b1 = activeStates[i];
            const b2 = activeStates[j];
            const dx = b2.x - b1.x;
            const dy = b2.y - b1.y;
            const dist = Math.hypot(dx, dy);

            if (dist < safeMinDist && dist > 0.001) {
              const overlap = safeMinDist - dist;
              const nx = dx / dist;
              const ny = dy / dist;

              // Rigid separation
              if (!b1.isDragging && !b2.isDragging) {
                b1.x -= nx * (overlap * 0.5);
                b1.y -= ny * (overlap * 0.5);
                b2.x += nx * (overlap * 0.5);
                b2.y += ny * (overlap * 0.5);
              } else if (!b1.isDragging) {
                b1.x -= nx * overlap;
                b1.y -= ny * overlap;
              } else if (!b2.isDragging) {
                b2.x += nx * overlap;
                b2.y += ny * overlap;
              }

              b1.heading = Math.atan2(-ny, -nx) + (Math.sin(time + i) * 0.2);
              b2.heading = Math.atan2(ny, nx) + (Math.sin(time + j) * 0.2);
            }
          }
        }
      }

      // 3. Render transforms with 3D space depth
      activeStates.forEach((state) => {
        // While user is dragging, do not overwrite coordinates or scale
        if (state.isDragging) {
          gsap.set(state.el, {
            x: state.x,
            y: state.y,
            zIndex: 9999
          });
          return;
        }

        const zSin = Math.sin(time * 0.45 + state.zPhase);
        const depthNorm = (zSin + 1) / 2;
        const depthScale = 0.88 + depthNorm * 0.24;
        const depthOpacity = 0.85 + depthNorm * 0.15;
        const isFocus = state.isHovered || state.el.classList.contains("is-active");
        const zIndex = isFocus ? 100 : (depthNorm > 0.55 ? 5 : 2);

        gsap.set(state.el, {
          x: state.x,
          y: state.y,
          scale: isFocus ? (depthScale * 1.22) : depthScale,
          opacity: depthOpacity,
          rotation: state.rot,
          zIndex: zIndex
        });
      });
    });
  }

  /* -------------------------------------------------------------------------- */
  /* 3. LENIS ULTRA-SMOOTH INERTIAL SCROLL & GSAP SYNC                          */
  /* -------------------------------------------------------------------------- */
  initSmoothScroll() {
    if (typeof Lenis !== "undefined") {
      const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

      this.lenis = new Lenis({
        duration: isTouch ? 0.75 : 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.0,
        syncTouch: false, // Giữ nguyên 100% gia tốc cuộn mượt gốc (120Hz/60Hz) của trình duyệt điện thoại
      });

      this.lenis.on("scroll", () => {
        if (window.ScrollTrigger) ScrollTrigger.update();
      });

      gsap.ticker.add((time) => {
        this.lenis.raf(time * 1000);
      });

      gsap.ticker.lagSmoothing(500, 33); // Tự động bù khung hình mượt mà, không bị khựng

      // Instantly ensure reload starts at the very top (main title)
      try {
        this.lenis.scrollTo(0, { immediate: true });
        window.scrollTo(0, 0);
      } catch (e) {}
    }
  }

  /* -------------------------------------------------------------------------- */
  /* 4. SMOOTH SCROLLTO NAVIGATION                                              */
  /* -------------------------------------------------------------------------- */
  initScrollToSmooth() {
    const scrollLinks = document.querySelectorAll(".scroll-link");
    scrollLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");
        if (href && href.startsWith("#")) {
          e.preventDefault();
          this.sounds.playClick();
          const target = document.querySelector(href);
          if (target) {
            if (this.lenis) {
              this.lenis.scrollTo(target, { offset: -70, duration: 0.85 });
            } else if (window.gsap && gsap.plugins && gsap.plugins.scrollTo) {
              gsap.to(window, {
                duration: 0.85,
                scrollTo: { y: target, offsetY: 70 },
                ease: "power2.inOut"
              });
            } else {
              target.scrollIntoView({ behavior: "smooth" });
            }
          }
        }
      });
    });
  }

  /* -------------------------------------------------------------------------- */
  /* 5. SCROLLTRIGGER: DYNAMIC SECTION ARRIVAL & RETURN ANIMATIONS              */
  /* -------------------------------------------------------------------------- */
  setupSectionArrival(sectionSelector, onEnterCb) {
    const section = document.querySelector(sectionSelector);
    if (!section) return;

    let hasEntered = false;

    ScrollTrigger.create({
      trigger: section,
      start: "top 82%",
      end: "bottom 18%",
      onEnter: () => {
        if (!hasEntered) {
          hasEntered = true;
          onEnterCb();
        }
      },
      onEnterBack: () => {
        if (!hasEntered) {
          hasEntered = true;
          onEnterCb();
        }
      },
      onLeave: () => {
        hasEntered = false;
      },
      onLeaveBack: () => {
        hasEntered = false;
      }
    });

    // Check if section is already in viewport on initial load / reload
    const checkSection = () => {
      const rect = section.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.85 && rect.bottom > 0) {
        hasEntered = true;
        onEnterCb();
      }
    };

    checkSection();
    window.addEventListener("load", checkSection);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(checkSection);
    }
  }

  /* Kích hoạt hiệu ứng: Ban đầu nhỏ một tí (scale: 0.93, y: 24), chỉ cần lướt tới vị trí vừa chạm khung nhìn (~72%) là bảng to lên (scale: 1, y: 0) */
  setupBoardFloatingAnimation({ trigger, onFloatUp, onRecede, start = "top 72%", end = "bottom 28%" }) {
    const el = typeof trigger === "string" ? document.querySelector(trigger) : trigger;
    if (!el) return;

    let isFloated = false;

    // Thiết lập trạng thái ban đầu: Nhỏ một tí (scale: 0.93) nhưng luôn hiển thị rõ ràng (opacity 100%)
    if (onRecede) {
      onRecede(true);
    }

    ScrollTrigger.create({
      trigger: el,
      start: start,
      end: end,
      onEnter: () => {
        if (!isFloated) {
          isFloated = true;
          onFloatUp();
        }
      },
      onEnterBack: () => {
        if (!isFloated) {
          isFloated = true;
          onFloatUp();
        }
      },
      onLeave: () => {
        isFloated = false;
        if (onRecede) onRecede(false);
      },
      onLeaveBack: () => {
        isFloated = false;
        if (onRecede) onRecede(false);
      }
    });

    // Nếu bảng đã nằm trong vùng hiển thị hoặc đã cuộn qua khi load/reload trang thì lập tức nổi to lên
    const checkViewport = () => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.74 && rect.bottom > 0) {
        isFloated = true;
        onFloatUp();
      }
    };

    checkViewport();
    window.addEventListener("load", checkViewport);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(checkViewport);
    }
  }

  initResponsiveScrollTrigger() {
    if (!window.gsap || !window.ScrollTrigger) return;

    // 1. SHOP SECTION
    const shopSection = document.getElementById("plugins-shop");
    if (shopSection) {
      const shopTitle = shopSection.querySelector(".section-title");
      const shopDesc = shopSection.querySelector(".section-desc");
      const shopTabs = shopSection.querySelector(".filter-tabs");
      const shopCards = shopSection.querySelectorAll(".plugin-card:not(.plugin-card-extra)");
      const seeMore = shopSection.querySelector(".see-more-container");

      // Tiêu đề & tabs chào đón tự nhiên khi chạm vào section (top 82%)
      const playShopArrival = () => {
        if (shopTitle) this.runTypewriter(shopTitle);
        if (shopDesc) {
          gsap.fromTo(shopDesc,
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.45, ease: "power2.out", clearProps: "all", overwrite: "auto" }
          );
        }
        if (shopTabs) {
          gsap.fromTo(shopTabs,
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 0.4, delay: 0.05, ease: "power2.out", clearProps: "all", overwrite: "auto" }
          );
        }
        if (seeMore) {
          gsap.fromTo(seeMore,
            { opacity: 0, y: 14 },
            { opacity: 1, y: 0, duration: 0.45, delay: 0.15, ease: "power2.out", clearProps: "all", overwrite: "auto" }
          );
        }
      };

      this.setupSectionArrival("#plugins-shop", playShopArrival);

      // BẢNG THẺ PLUGIN: Ban đầu nhỏ một tí (scale: 0.93), khi tới vị trí hiển thị (~72%) thì nổi lên to (scale: 1, y: 0)
      if (shopCards.length && !document.querySelector(".plugin-carousel-stage")) {
        this.setupBoardFloatingAnimation({
          trigger: "#plugins-container",
          start: "top 72%",
          end: "bottom 28%",
          onFloatUp: () => {
            gsap.to(shopCards, {
              scale: 1,
              y: 0,
              duration: 0.55,
              stagger: 0.05,
              ease: "back.out(1.3)",
              overwrite: "auto",
              onComplete: () => {
                gsap.set(shopCards, { clearProps: "transform" });
              }
            });
          },
          onRecede: (immediate) => {
            if (immediate) {
              gsap.set(shopCards, { scale: 0.93, y: 24, transformOrigin: "center center" });
            } else {
              gsap.to(shopCards, {
                scale: 0.93,
                y: 24,
                duration: 0.4,
                ease: "power2.out",
                overwrite: "auto"
              });
            }
          }
        });
      }
    }

    // 2. REVIEWS / TESTIMONIALS SECTION
    const configSection = document.getElementById("config-editor");
    if (configSection) {
      const configTitle = configSection.querySelector(".section-title");
      const configDesc = configSection.querySelector(".section-desc");
      const reviewsContainer = configSection.querySelector(".reviews-container-wrap") || configSection.querySelector("#config-cards-container");

      // Tiêu đề & mô tả tự nhiên khi vào section
      const playConfigArrival = () => {
        if (configTitle) this.runTypewriter(configTitle);
        if (configDesc) {
          gsap.fromTo(configDesc,
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.45, ease: "power2.out", clearProps: "all", overwrite: "auto" }
          );
        }
      };

      this.setupSectionArrival("#config-editor", playConfigArrival);

      // BẢNG ĐÁNH GIÁ: Nổi lên y hệt như terminal console (scale: 0.93, y: 28 -> scale: 1, y: 0)
      if (reviewsContainer) {
        this.setupBoardFloatingAnimation({
          trigger: reviewsContainer,
          start: "top 72%",
          end: "bottom 28%",
          onFloatUp: () => {
            gsap.to(reviewsContainer, {
              scale: 1,
              y: 0,
              duration: 0.65,
              ease: "back.out(1.2)",
              overwrite: "auto",
              onComplete: () => {
                gsap.set(reviewsContainer, { clearProps: "transform" });
              }
            });
          },
          onRecede: (immediate) => {
            if (immediate) {
              gsap.set(reviewsContainer, { scale: 0.93, y: 28, transformOrigin: "center center" });
            } else {
              gsap.to(reviewsContainer, {
                scale: 0.93,
                y: 28,
                duration: 0.4,
                ease: "power2.out",
                overwrite: "auto"
              });
            }
          }
        });
      }
    }

    // 3. LIVE YAML CONFIG STUDIO (FORMER TERMINAL CONSOLE)
    const terminalSection = document.getElementById("yaml-editor") || document.getElementById("terminal");
    if (terminalSection) {
      const termTitle = terminalSection.querySelector(".section-title");
      const termDesc = terminalSection.querySelector(".section-desc");
      const termBox = terminalSection.querySelector(".yaml-studio-box, .terminal-box");

      // Tiêu đề & mô tả tự nhiên khi vào section
      const playTerminalArrival = () => {
        if (termTitle) this.runTypewriter(termTitle);
        if (termDesc) {
          gsap.fromTo(termDesc,
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.45, ease: "power2.out", clearProps: "all", overwrite: "auto" }
          );
        }
      };

      this.setupSectionArrival("#yaml-editor, #terminal", playTerminalArrival);

      // BẢNG TERMINAL CONSOLE: Ban đầu nhỏ một tí (scale: 0.93), khi tới vị trí hiển thị (~72%) thì nổi to lên (scale: 1, y: 0)
      if (termBox) {
        this.setupBoardFloatingAnimation({
          trigger: termBox,
          start: "top 72%",
          end: "bottom 28%",
          onFloatUp: () => {
            gsap.to(termBox, {
              scale: 1,
              y: 0,
              duration: 0.65,
              ease: "back.out(1.2)",
              overwrite: "auto",
              onComplete: () => {
                gsap.set(termBox, { clearProps: "transform" });
              }
            });
          },
          onRecede: (immediate) => {
            if (immediate) {
              gsap.set(termBox, { scale: 0.93, y: 28, transformOrigin: "center center" });
            } else {
              gsap.to(termBox, {
                scale: 0.93,
                y: 28,
                duration: 0.4,
                ease: "power2.out",
                overwrite: "auto"
              });
            }
          }
        });
      }
    }

    // 4. METRICS SECTION
    const metricsSection = document.querySelector(".metrics-section");
    if (metricsSection) {
      const metricCards = metricsSection.querySelectorAll(".metric-card");

      // BẢNG METRICS: Ban đầu nhỏ một tí (scale: 0.93), khi tới vị trí hiển thị (~74%) thì nổi to lên (scale: 1, y: 0)
      if (metricCards.length) {
        this.setupBoardFloatingAnimation({
          trigger: ".metrics-grid",
          start: "top 74%",
          end: "bottom 26%",
          onFloatUp: () => {
            gsap.to(metricCards, {
              scale: 1,
              y: 0,
              duration: 0.55,
              stagger: 0.06,
              ease: "back.out(1.3)",
              overwrite: "auto",
              onComplete: () => {
                gsap.set(metricCards, { clearProps: "transform" });
              }
            });
            this.rollMetricsCounters();
          },
          onRecede: (immediate) => {
            if (immediate) {
              gsap.set(metricCards, { scale: 0.93, y: 20, transformOrigin: "center center" });
            } else {
              gsap.to(metricCards, {
                scale: 0.93,
                y: 20,
                duration: 0.4,
                ease: "power2.out",
                overwrite: "auto"
              });
            }
          }
        });
      }
    }
  }

  /* -------------------------------------------------------------------------- */
  /* 5. SCROLLTRIGGER NUMERIC COUNTERS                                          */
  /* -------------------------------------------------------------------------- */
  rollMetricsCounters() {
    const metrics = [
      { id: "#metric-tps", end: 20.0, decimals: 1, suffix: " TPS" },
      { id: "#metric-servers", end: 14.2, decimals: 1, suffix: "k+" },
      { id: "#metric-latency", end: 0.12, decimals: 2, suffix: "ms" },
      { id: "#metric-downloads", end: 2.8, decimals: 1, suffix: "M+" }
    ];

    metrics.forEach((m) => {
      const el = document.querySelector(m.id);
      if (!el) return;

      const obj = { val: 0 };
      gsap.to(obj, {
        val: m.end,
        duration: 1.8,
        ease: "power2.out",
        overwrite: "auto",
        onUpdate: () => {
          el.textContent = obj.val.toFixed(m.decimals) + m.suffix;
        }
      });
    });
  }

  /* -------------------------------------------------------------------------- */
  /* 6. SHOP FILTER TABS (Always-Active, Silky-Smooth Staggered Transition)      */
  /* -------------------------------------------------------------------------- */
  initShopFilterWithFlip() {
    const filterBtns = document.querySelectorAll(".filter-btn");
    const cards = Array.from(document.querySelectorAll(".plugin-card"));

    filterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (btn.classList.contains("active")) return;

        this.sounds.playClick();
        filterBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        const category = btn.getAttribute("data-filter");
        const btnSeeMore = document.getElementById("btn-see-more");
        const isSeeMoreExpanded = btnSeeMore && btnSeeMore.classList.contains("expanded");

        // Cancel any pending tweens on cards to prevent lockups
        gsap.killTweensOf(cards);

        const hidingCards = [];
        const showingCards = [];

        cards.forEach((card) => {
          const isExtra = card.classList.contains("plugin-card-extra");
          if (isExtra && !isSeeMoreExpanded) {
            if (card.style.display !== "none") {
              hidingCards.push(card);
            }
            return;
          }

          const cardCat = card.getAttribute("data-category") || "";
          const matches = category === "all" || cardCat.includes(category);

          if (matches) {
            showingCards.push(card);
          } else {
            hidingCards.push(card);
          }
        });

        const animateIn = () => {
          showingCards.forEach((c) => {
            c.style.display = "flex";
          });

          // ALWAYS trigger a full staggered wave entrance on all matching cards!
          gsap.fromTo(showingCards,
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
                if (window.ScrollTrigger) {
                  ScrollTrigger.refresh();
                }
              }
            }
          );
        };

        // Step 1: Smoothly fade out non-matching cards
        if (hidingCards.length > 0) {
          gsap.to(hidingCards, {
            opacity: 0,
            scale: 0.94,
            y: -10,
            duration: 0.16,
            ease: "power2.in",
            onComplete: () => {
              hidingCards.forEach((c) => {
                c.style.display = "none";
              });
              animateIn();
            }
          });
        } else {
          animateIn();
        }
      });
    });
  }

  /* -------------------------------------------------------------------------- */
  /* 7. GSAP UTILS: 3D CARD TILT                                               */
  /* -------------------------------------------------------------------------- */
  initCardTiltWithUtils() {
    const cards = gsap.utils.toArray(".plugin-grid .plugin-card, .marketplace-grid .plugin-card");

    cards.forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        if (this.isZeroG) return;

        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const rotY = gsap.utils.mapRange(0, rect.width, -6, 6, x);
        const rotX = gsap.utils.mapRange(0, rect.height, 6, -6, y);

        gsap.to(card, {
          rotationX: rotX,
          rotationY: rotY,
          y: 0,
          duration: 0.35,
          ease: "power1.out",
          transformPerspective: 900
        });
      });

      card.addEventListener("mouseleave", () => {
        if (this.isZeroG) return;
        gsap.to(card, {
          rotationX: 0,
          rotationY: 0,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
          onComplete: () => {
            gsap.set(card, { clearProps: "transform" });
          }
        });
      });
    });
  }

  /* -------------------------------------------------------------------------- */
  /* 8. GSAP UTILS: MAGNETIC BUTTONS (Disabled per user request)                */
  /* -------------------------------------------------------------------------- */
  initMagneticButtons() {
    // Disabled: removed sticky magnetic hover effect per user request
  }







  /* -------------------------------------------------------------------------- */
  /* 12. REAL-TIME CUSTOMER REVIEWS & TESTIMONIALS ROTATOR                      */
  /* -------------------------------------------------------------------------- */
  initTestimonialRotation() {
    const cards = Array.from(document.querySelectorAll(".review-card"));
    if (!cards.length) return;

    const testimonialPages = [
      // Page 0 (Gia Huy, Đăng Khoa, Lê Nguyễn - Vietnamese Community Reviews Preserved)
      [
        {
          author: "Gia Huy",
          role: "Admin @ VietMine SMP",
          initials: "GH",
          avatarClass: "avatar-cyan",
          plugin: "[AetherEconomy v1.21]",
          stars: "★★★★★",
          content: "“Tôi không thể tin được nó quá điên rồ”",
          date: "Vừa xong"
        },
        {
          author: "Đăng Khoa",
          role: "Lead Dev @ KhoaCraft SMP",
          initials: "ĐK",
          avatarClass: "avatar-purple",
          plugin: "[NexusPvP Arena]",
          stars: "★★★★★",
          content: "“Tôi đã khóc vì quá xúc động”",
          date: "1 giờ trước"
        },
        {
          author: "Lê Nguyễn",
          role: "Founder @ NguyenSMP Community",
          initials: "LN",
          avatarClass: "avatar-emerald",
          plugin: "[QuantumEnchants]",
          stars: "★★★★★",
          content: "“Bá đạo trên từng hạt gạo”",
          date: "3 giờ trước"
        }
      ],
      // Page 1
      [
        {
          author: "Alex_Vortex",
          role: "Owner @ AetherSMP",
          initials: "AV",
          avatarClass: "avatar-cyan",
          plugin: "[AetherEconomy v1.21]",
          stars: "★★★★★",
          content: "“Setting up AetherEconomy took literally two minutes. Our players love the bank interest and trading shops, and the server runs buttery smooth with zero lag!”",
          date: "2 days ago"
        },
        {
          author: "Kaelen_Dev",
          role: "PvP Host @ HorizonDuels",
          initials: "KD",
          avatarClass: "avatar-purple",
          plugin: "[NexusPvP Arena]",
          stars: "★★★★★",
          content: "“NexusPvP completely transformed our duels arena. Hit detection is super crisp, knockback feels natural, and our community loves the smooth combat!”",
          date: "4 days ago"
        },
        {
          author: "ShadowAdmin",
          role: "Host @ ZenithSMP",
          initials: "SA",
          avatarClass: "avatar-emerald",
          plugin: "[QuantumEnchants]",
          stars: "★★★★★",
          content: "“Super clean configs with instant live reload so we don't have to restart the server. The custom enchantment particles look incredible and our players are obsessed!”",
          date: "1 week ago"
        }
      ],
      // Page 2
      [
        {
          author: "FrostByte_MC",
          role: "Creator @ MythicSMP",
          initials: "FB",
          avatarClass: "avatar-amber",
          plugin: "[ChronosDungeons]",
          stars: "★★★★★",
          content: "“Our friend group has been exploring the custom dungeons every weekend. Epic boss fights, awesome loot, and zero server lag!”",
          date: "1 week ago"
        },
        {
          author: "Elysian_Craft",
          role: "Builder @ OasisSurvival",
          initials: "EC",
          avatarClass: "avatar-rose",
          plugin: "[VoxelCosmetics]",
          stars: "★★★★★",
          content: "“The custom hats and particle trails are adorable! Our players love unlocking them through survival quests, and it makes our server feel so alive.”",
          date: "2 weeks ago"
        },
        {
          author: "ViperRider",
          role: "Host @ NebulaCraft",
          initials: "VR",
          avatarClass: "avatar-indigo",
          plugin: "[NebulaFactions]",
          stars: "★★★★★",
          content: "“Super easy to claim land and start friendly faction wars. Simple menus, no confusing commands, and our Bedrock mobile friends join in effortlessly.”",
          date: "3 weeks ago"
        }
      ],
      // Page 3
      [
        {
          author: "LunarEclipse",
          role: "Admin @ StarboundSMP",
          initials: "LE",
          avatarClass: "avatar-purple",
          plugin: "[AuraSkills]",
          stars: "★★★★★",
          content: "“Grinding custom skills with our community has been an absolute blast. Smooth progression, great sound effects, and zero glitches!”",
          date: "1 month ago"
        },
        {
          author: "BaconKing_99",
          role: "Owner @ PorkCraft Survival",
          initials: "BK",
          avatarClass: "avatar-cyan",
          plugin: "[LoomBazaar]",
          stars: "★★★★★",
          content: "“Our players use the player marketplace every single day to sell their farmed crops and mined diamonds. Clean interface and super dependable!”",
          date: "1 month ago"
        },
        {
          author: "DungeonMasterX",
          role: "Admin @ TartarusSMP",
          initials: "DM",
          avatarClass: "avatar-emerald",
          plugin: "[ZenithAntiCheat]",
          stars: "★★★★★",
          content: "“Quietly protects our survival server in the background without false-banning our legitimate friends. Simple, lightweight, and gives us total peace of mind.”",
          date: "1 month ago"
        }
      ]
    ];

    let currentPage = 0;
    let rotationTimer = null;
    let isHovered = false;

    const dots = Array.from(document.querySelectorAll(".review-dot"));
    const btnPrev = document.getElementById("btn-prev-review");
    const btnNext = document.getElementById("btn-next-review");
    const container = document.querySelector(".reviews-container-wrap");

    const updateDots = (pageIndex) => {
      dots.forEach((d, i) => {
        if (i === pageIndex) {
          d.classList.add("active");
        } else {
          d.classList.remove("active");
        }
      });
    };

    let isTransitioning = false;

    const renderPage = (targetPage, direction = 1) => {
      if (!cards.length || isTransitioning) return;
      isTransitioning = true;

      currentPage = targetPage;
      updateDots(currentPage);

      const newReviews = testimonialPages[currentPage];

      // Cancel any active tweens on cards to prevent collision
      gsap.killTweensOf(cards);

      // Distinct slide offsets and directional wave stagger
      const exitX = direction > 0 ? -55 : 55;
      const enterX = direction > 0 ? 60 : -60;
      const exitStagger = direction > 0 ? 0.04 : -0.04;
      const enterStagger = direction > 0 ? 0.07 : -0.07;

      // Smooth directional slide-out
      gsap.to(cards, {
        opacity: 0,
        x: exitX,
        scale: 0.94,
        duration: 0.22,
        stagger: exitStagger,
        ease: "power2.in",
        onComplete: () => {
          cards.forEach((card, idx) => {
            const data = newReviews[idx];
            if (!data) return;

            const avatarEl = card.querySelector(".review-avatar");
            const avatarText = card.querySelector(".avatar-text");
            const authorEl = card.querySelector(".review-author");
            const roleEl = card.querySelector(".review-role");
            const tagEl = card.querySelector(".tag-badge");
            const contentEl = card.querySelector(".review-content");
            const dateEl = card.querySelector(".review-date");

            if (avatarEl) {
              avatarEl.className = `review-avatar ${data.avatarClass}`;
            }
            if (avatarText) avatarText.textContent = data.initials;
            if (authorEl) authorEl.textContent = data.author;
            if (roleEl) roleEl.textContent = data.role;
            if (tagEl) tagEl.textContent = data.plugin;
            if (contentEl) contentEl.textContent = data.content;
            if (dateEl) dateEl.textContent = data.date;
          });

          // Smooth directional slide-in with spring wave
          gsap.fromTo(cards,
            {
              opacity: 0,
              x: enterX,
              scale: 0.94
            },
            {
              opacity: 1,
              x: 0,
              scale: 1,
              stagger: enterStagger,
              duration: 0.42,
              ease: "back.out(1.25)",
              clearProps: "transform,opacity",
              onComplete: () => {
                isTransitioning = false;
              }
            }
          );
        }
      });
    };

    const nextReviewPage = () => {
      const nextPage = (currentPage + 1) % testimonialPages.length;
      renderPage(nextPage, 1);
    };

    const prevReviewPage = () => {
      const prevPage = (currentPage - 1 + testimonialPages.length) % testimonialPages.length;
      renderPage(prevPage, -1);
    };

    const startTimer = () => {
      stopTimer();
      rotationTimer = setInterval(() => {
        if (!isHovered) {
          nextReviewPage();
        }
      }, 5500);
    };

    const stopTimer = () => {
      if (rotationTimer) {
        clearInterval(rotationTimer);
        rotationTimer = null;
      }
    };

    // Pause on hover so user can read peacefully
    if (container) {
      container.addEventListener("mouseenter", () => {
        isHovered = true;
      });
      container.addEventListener("mouseleave", () => {
        isHovered = false;
      });
    }

    // Interactive buttons
    if (btnNext) {
      btnNext.addEventListener("click", () => {
        if (isTransitioning) return;
        this.sounds.playClick();
        nextReviewPage();
        startTimer();
      });
    }
    if (btnPrev) {
      btnPrev.addEventListener("click", () => {
        if (isTransitioning) return;
        this.sounds.playClick();
        prevReviewPage();
        startTimer();
      });
    }

    dots.forEach((dot, idx) => {
      dot.addEventListener("click", () => {
        if (idx === currentPage || isTransitioning) return;
        this.sounds.playClick();
        const dir = idx > currentPage ? 1 : -1;
        renderPage(idx, dir);
        startTimer();
      });
    });

    // Touch Swipe Gesture for Customer Reviews on Mobile
    if (container) {
      let touchStartX = 0;
      let touchStartY = 0;
      let hasSwiped = false;

      container.addEventListener(
        "touchstart",
        (e) => {
          if (e.touches && e.touches[0]) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            hasSwiped = false;
          }
        },
        { passive: true }
      );

      container.addEventListener(
        "touchmove",
        (e) => {
          if (!touchStartX || hasSwiped) return;
          if (e.touches && e.touches[0]) {
            const dx = e.touches[0].clientX - touchStartX;
            const dy = e.touches[0].clientY - touchStartY;

            // Kích hoạt ngay khi vuốt ngang > 30px và góc vuốt nằm ngang
            if (Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy) * 1.15) {
              hasSwiped = true;
              touchStartX = 0;
              if (isTransitioning) return;
              this.sounds.playClick();
              if (dx < 0) {
                nextReviewPage();
              } else {
                prevReviewPage();
              }
              startTimer();
            }
          }
        },
        { passive: true }
      );

      container.addEventListener(
        "touchend",
        (e) => {
          if (!touchStartX || hasSwiped) return;
          if (e.changedTouches && e.changedTouches[0]) {
            const dx = e.changedTouches[0].clientX - touchStartX;
            const dy = e.changedTouches[0].clientY - touchStartY;
            touchStartX = 0;

            // Threshold: 28px horizontal swipe
            if (Math.abs(dx) > 28 && Math.abs(dx) > Math.abs(dy)) {
              if (isTransitioning) return;
              this.sounds.playClick();
              if (dx < 0) {
                nextReviewPage();
              } else {
                prevReviewPage();
              }
              startTimer();
            }
          }
        },
        { passive: true }
      );
    }

    startTimer();
  }

  /* -------------------------------------------------------------------------- */
  /* 13. LIVE YAML CONFIG STUDIO                                                */
  /* -------------------------------------------------------------------------- */
  initYamlStudio() {
    const yamlStudio = document.getElementById("yaml-studio");
    if (!yamlStudio) return;

    const tabs = yamlStudio.querySelectorAll(".yaml-tab");
    const codeContent = document.getElementById("yaml-code-content");
    const lineNumbers = document.getElementById("yaml-line-numbers");

    const yamlPresets = {
      economy: `# PocketMC // AetherEconomy Production Configuration
version: "1.21.4-RELEASE"
cluster:
  redis-sync: true
  channel: "aether-nether-01"
  auto-reconnect: true

economy:
  currency-symbol: "💎"
  starting-balance: 5000.00
  interest-engine:
    enabled: true
    annual-rate: 0.045
    compound-interval-ticks: 1200 # Every 60s
  anti-inflation:
    burn-transaction-tax: 0.015
    max-vault-cap: 1000000000
  crypto-vault:
    enable-multithreading: true
    storage-driver: "POSTGRESQL_POOL"`,

      pvp: `# PocketMC // NexusPvP Arena Physics Engine
arena-engine:
  world: "arena_ranked"
  tick-rate: 20.0
  folia-thread-affinity: "REGIONAL_ASYNC"

combat-mechanics:
  knockback:
    multiplier: 1.15
    air-resistance: 0.94
    knockback-vector-y: 1.45
  hit-detection:
    sub-tick-packet-interpolation: true
    anti-desync-buffer-ms: 12
  particles:
    celestial-trail: true
    spark-density: "EXTREME"`,

      enchants: `# PocketMC // QuantumEnchants Spellbook Configuration
grimoire:
  max-custom-slots: 12
  fusing-dust-catalyst: "ANCIENT_DEBRIS"
  lore-animation-speed: 2 # ticks per frame

enchantments:
  void-walker:
    tier: "MYTHIC"
    max-level: 5
    trigger: "ON_VOID_FALL"
    sound: "BLOCK_BEACON_POWER_SELECT"
  thunder-strike:
    tier: "LEGENDARY"
    chance-per-hit: 0.24
    damage-multiplier: 2.2`,

      folia: `# PocketMC // Folia Multi-Threaded Cluster Core
folia-optimization:
  chunk-region-threading: true
  max-threads-per-world: 8
  entity-scheduler-budget-ms: 1.8
  packet-compression-threshold: 256

protection:
  memory-leak-sanitizer: true
  async-chunk-unloading: true
  metrics-telemetry: "LOCAL_ONLY"`
    };

    const highlightYaml = (rawYaml) => {
      const lines = rawYaml.split("\n");
      return lines.map((line) => {
        if (line.trim().startsWith("#")) {
          return `<span class="yaml-comment">${line}</span>`;
        }
        const match = line.match(/^(\s*)([^:#]+):(.*)$/);
        if (match) {
          const indent = match[1];
          const key = match[2];
          let val = match[3];

          let comment = "";
          const cIdx = val.indexOf("#");
          if (cIdx !== -1) {
            comment = ` <span class="yaml-comment">${val.slice(cIdx)}</span>`;
            val = val.slice(0, cIdx);
          }

          val = val.trim();
          let highlightedVal = val;
          if (val === "true" || val === "false") {
            highlightedVal = `<span class="yaml-bool">${val}</span>`;
          } else if (/^\d+(\.\d+)?$/.test(val)) {
            highlightedVal = `<span class="yaml-num">${val}</span>`;
          } else if (val.startsWith('"') && val.endsWith('"')) {
            highlightedVal = `<span class="yaml-str">${val}</span>`;
          }

          return `${indent}<span class="yaml-key">${key}</span>: ${highlightedVal}${comment}`;
        }
        return line;
      }).join("\n");
    };

    const loadTab = (tabName, animate = true) => {
      const raw = yamlPresets[tabName] || yamlPresets.economy;
      const html = highlightYaml(raw) + '<span class="yaml-cursor">▋</span>';

      if (lineNumbers) {
        const count = raw.split("\n").length;
        lineNumbers.innerHTML = Array.from({ length: count }, (_, i) => `<span>${i + 1}</span>`).join("<br>");
      }

      const editorBody = yamlStudio.querySelector(".yaml-editor-body");
      if (editorBody) {
        editorBody.scrollTop = 0;
        editorBody.scrollLeft = 0;
      }

      if (codeContent) {
        codeContent.innerHTML = html;
        if (animate && window.gsap) {
          gsap.fromTo(codeContent,
            { opacity: 0.2, y: 6 },
            { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
          );
          gsap.fromTo(lineNumbers,
            { opacity: 0.3 },
            { opacity: 1, duration: 0.35, ease: "power2.out" }
          );
        }
      }
    };

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        if (tab.classList.contains("active")) return;
        this.sounds.playClick();
        tabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        const tabKey = tab.getAttribute("data-tab");
        loadTab(tabKey, true);
      });
    });

    // Initial load
    loadTab("economy", false);
  }

  /* -------------------------------------------------------------------------- */
  /* 9. BUTTON EFFECTS & ACTIONS (Delegated to js/cart.js)                      */
  /* -------------------------------------------------------------------------- */
  initButtonEffects() {
    // Handled by PocketMCCart in js/cart.js
  }

  /* -------------------------------------------------------------------------- */
  /* HELPER: TOAST NOTIFICATION (Disabled as requested)                         */
  /* -------------------------------------------------------------------------- */
  showToast(message) {
    const toast = document.getElementById("pocket-toast");
    if (toast) toast.remove();
  }

  /* -------------------------------------------------------------------------- */
  /* 10. DYNAMIC CURSOR INVERSION (Switches cursor to white on black/dark areas) */
  /* -------------------------------------------------------------------------- */
  initDynamicCursorInversion() {
    // Không chạy trên mobile/cảm ứng để tiết kiệm 100% tài nguyên CPU
    if (window.matchMedia("(hover: none)").matches || window.innerWidth <= 768) {
      return;
    }

    const isDarkElement = (target) => {
      let curr = target;
      while (curr && curr !== document.body && curr !== document.documentElement) {
        if (curr.classList.contains("btn-black") || 
            curr.classList.contains("btn-get") || 
            curr.classList.contains("btn-card-buy") || 
            curr.classList.contains("terminal-box") ||
            curr.classList.contains("terminal-section") ||
            curr.classList.contains("yaml-studio-box") ||
            curr.classList.contains("yaml-section") ||
            curr.classList.contains("cmd-badge") ||
            (curr.classList.contains("filter-btn") && curr.classList.contains("active"))) {
          return true;
        }

        const style = window.getComputedStyle(curr);
        const bg = style.backgroundColor;
        const match = bg && bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (match) {
          const r = parseInt(match[1], 10);
          const g = parseInt(match[2], 10);
          const b = parseInt(match[3], 10);
          const a = match[0].includes("rgba") ? parseFloat(bg.split(",")[3]) : 1;
          if (a > 0.4) {
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            if (brightness < 120) return true;
            return false;
          }
        }
        curr = curr.parentElement;
      }
      return false;
    };

    document.addEventListener("mousemove", (e) => {
      if (isDarkElement(e.target)) {
        document.body.classList.add("cursor-white-mode");
      } else {
        document.body.classList.remove("cursor-white-mode");
      }
    }, { passive: true });
  }

  /* -------------------------------------------------------------------------- */
  /* 11. SEE MORE PLUGINS (Dynamically reveals curated plugins with GSAP)       */
  /* -------------------------------------------------------------------------- */
  initSeeMorePlugins() {
    const btnSeeMore = document.getElementById("btn-see-more");
    if (!btnSeeMore || btnSeeMore.tagName === "A") return;

    let isExpanded = false;

    btnSeeMore.addEventListener("click", () => {
      this.sounds.playClick();

      if (!isExpanded) {
        // Expand extra plugins
        btnSeeMore.classList.add("loading", "expanded");
        btnSeeMore.innerHTML = `<span>Loading plugins...</span>`;

        setTimeout(() => {
          const extraCards = Array.from(document.querySelectorAll(".plugin-card-extra"));
          const activeFilter = document.querySelector(".filter-btn.active");
          const activeCategory = activeFilter ? activeFilter.getAttribute("data-filter") : "all";

          const cardsToAnimate = [];

          extraCards.forEach((card) => {
            const cardCat = card.getAttribute("data-category") || "";
            const matches = activeCategory === "all" || cardCat.includes(activeCategory);

            if (matches) {
              card.style.display = "flex";
              card.style.visibility = "visible";
              cardsToAnimate.push(card);
            } else {
              card.style.display = "none";
            }
          });

          // Immediately notify Lenis & ScrollTrigger so new DOM elements are tracked
          if (this.lenis) this.lenis.resize();
          if (window.ScrollTrigger) ScrollTrigger.refresh();

          // GSAP Entrance
          gsap.fromTo(cardsToAnimate,
            { opacity: 0, y: 20, scale: 0.96 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.35,
              stagger: 0.04,
              ease: "power2.out",
              clearProps: "all",
              onComplete: () => {
                if (this.lenis) this.lenis.resize();
                if (window.ScrollTrigger) ScrollTrigger.refresh();
              }
            }
          );

          // Update counters
          const showingCountEl = document.getElementById("showing-count");
          if (showingCountEl) showingCountEl.textContent = "12";

          // Update filter button labels
          const filterBtns = document.querySelectorAll(".filter-btn");
          filterBtns.forEach((b) => {
            const f = b.getAttribute("data-filter");
            if (f === "all") b.textContent = "All Plugins (12)";
            if (f === "economy") b.textContent = "Economy & RPG (5)";
            if (f === "combat") b.textContent = "Combat & PvP (2)";
            if (f === "network") b.textContent = "Network & AntiCheat (5)";
          });

          // Re-bind button click effects for newly revealed cards
          this.initButtonEffects();

          // Update button state
          btnSeeMore.classList.remove("loading");
          btnSeeMore.innerHTML = `
            <span class="see-more-text">Collapse Extra Plugins</span>
            <svg class="see-more-icon" style="transform: rotate(180deg);" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M6 9l6 6 6-6"/>
            </svg>
          `;
          isExpanded = true;

          setTimeout(() => {
            if (this.lenis) this.lenis.resize();
            if (window.ScrollTrigger) ScrollTrigger.refresh();
          }, 400);
        }, 280);
      } else {
        // Collapse back to 6 and scroll viewport smoothly back to plugin section
        btnSeeMore.classList.remove("expanded");

        const shopSection = document.getElementById("plugins-shop");
        if (shopSection) {
          if (this.lenis) {
            this.lenis.scrollTo(shopSection, { offset: -70, duration: 0.95, immediate: false });
          } else if (window.gsap && gsap.plugins && gsap.plugins.scrollTo) {
            gsap.to(window, {
              duration: 0.9,
              scrollTo: { y: shopSection, offsetY: 70 },
              ease: "power2.inOut"
            });
          } else {
            shopSection.scrollIntoView({ behavior: "smooth" });
          }
        }

        const extraCards = Array.from(document.querySelectorAll(".plugin-card-extra"));
        gsap.to(extraCards, {
          opacity: 0,
          y: -15,
          scale: 0.96,
          duration: 0.22,
          ease: "power2.in",
          onComplete: () => {
            extraCards.forEach((c) => {
              c.style.display = "none";
            });

            const showingCountEl = document.getElementById("showing-count");
            if (showingCountEl) showingCountEl.textContent = "6";

            const filterBtns = document.querySelectorAll(".filter-btn");
            filterBtns.forEach((b) => {
              const f = b.getAttribute("data-filter");
              if (f === "all") b.textContent = "All Plugins (6)";
              if (f === "economy") b.textContent = "Economy & RPG (3)";
              if (f === "combat") b.textContent = "Combat & PvP (1)";
              if (f === "network") b.textContent = "Network & AntiCheat (2)";
            });

            if (this.lenis) this.lenis.resize();
            if (window.ScrollTrigger) ScrollTrigger.refresh();

            btnSeeMore.innerHTML = `
              <span class="see-more-text">See More Plugins (6+)</span>
              <svg class="see-more-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M6 9l6 6 6-6"/>
              </svg>
            `;
            isExpanded = false;

            setTimeout(() => {
              if (this.lenis) this.lenis.resize();
              if (window.ScrollTrigger) ScrollTrigger.refresh();
            }, 120);
          }
        });
      }
    });
  }

  /* -------------------------------------------------------------------------- */
  /* 12. DRAGGABLE CHEST SHOPPING CART (Handled by js/cart.js)                 */
  /* -------------------------------------------------------------------------- */
  initMysteryChest() {
    // Handled by PocketMCCart in js/cart.js
  }

  /* -------------------------------------------------------------------------- */
  /* 13. SECTION TITLE TYPEWRITER UTILITY                                       */
  /* -------------------------------------------------------------------------- */
  initSectionTitleTypewriter() {
    const titles = document.querySelectorAll(".section-title:not(.hero-headline)");
    titles.forEach((titleEl) => {
      const fullText = titleEl.getAttribute("data-full-text") || titleEl.textContent.trim();
      titleEl.setAttribute("data-full-text", fullText);
      titleEl.dataset.fullText = fullText;
      // Always initialize with the full text visible so titles NEVER vanish into empty space!
      titleEl.innerHTML = `<span class="type-text-visible">${fullText}</span><span class="type-text-ghost"></span>`;
    });
  }

  runTypewriter(titleEl) {
    if (!titleEl) return;
    const fullText = titleEl.getAttribute("data-full-text") || titleEl.textContent.trim();
    if (!fullText) return;

    let visibleSpan = titleEl.querySelector(".type-text-visible");
    let ghostSpan = titleEl.querySelector(".type-text-ghost");

    if (!visibleSpan || !ghostSpan) {
      titleEl.innerHTML = `<span class="type-text-visible">${fullText}</span><span class="type-text-ghost"></span>`;
      visibleSpan = titleEl.querySelector(".type-text-visible");
      ghostSpan = titleEl.querySelector(".type-text-ghost");
    }

    if (titleEl._typingTimer) {
      clearInterval(titleEl._typingTimer);
      titleEl._typingTimer = null;
    }

    visibleSpan.textContent = "";
    ghostSpan.textContent = fullText;

    let charIdx = 0;
    // Pacing: Chạy chậm lại vừa phải (~45ms mỗi ký tự) để người dùng thấy rõ chữ đang gõ từng nhịp
    const speed = Math.max(38, Math.min(52, Math.floor(1450 / fullText.length)));

    titleEl._typingTimer = setInterval(() => {
      if (charIdx <= fullText.length) {
        visibleSpan.textContent = fullText.slice(0, charIdx);
        ghostSpan.textContent = fullText.slice(charIdx);
        charIdx++;
      } else {
        clearInterval(titleEl._typingTimer);
        titleEl._typingTimer = null;
        visibleSpan.textContent = fullText;
        ghostSpan.textContent = "";
      }
    }, speed);
  }

  resetTypewriter(titleEl) {
    if (!titleEl) return;
    if (titleEl._typingTimer) {
      clearInterval(titleEl._typingTimer);
      titleEl._typingTimer = null;
    }
    const fullText = titleEl.getAttribute("data-full-text") || titleEl.textContent.trim();
    const visibleSpan = titleEl.querySelector(".type-text-visible");
    const ghostSpan = titleEl.querySelector(".type-text-ghost");
    // ALWAYS preserve full text so it NEVER disappears or leaves blank space!
    if (visibleSpan) {
      visibleSpan.textContent = fullText;
    }
    if (ghostSpan) {
      ghostSpan.textContent = "";
    }
  }

  /* -------------------------------------------------------------------------- */
  /* 14. SMILE ARC 3D CAROUSEL CONTROLLER (HOMEPAGE SHOWCASE)                   */
  /* -------------------------------------------------------------------------- */
  initSmileCarousel() {
    const stage = document.querySelector(".plugin-carousel-stage");
    if (!stage) return;

    const cards = Array.from(stage.querySelectorAll(".plugin-card"));
    if (!cards.length) return;

    const prevBtn = document.getElementById("carousel-prev");
    const nextBtn = document.getElementById("carousel-next");
    const dotsWrap = document.getElementById("carousel-dots");

    let activeIndex = 0;
    const total = cards.length;
    let idleFloatTween = null;

    // Fast, reliable tap handler for Mobile Touch & PC Click (khắc phục triệt để lỗi nuốt click trên điện thoại)
    const attachFastTap = (el, callback) => {
      if (!el) return;

      let touchStartX = 0;
      let touchStartY = 0;
      let touchStartTime = 0;
      let handledByTouch = false;

      el.addEventListener(
        "touchstart",
        (e) => {
          if (e.touches && e.touches[0]) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            touchStartTime = Date.now();
          }
        },
        { passive: true }
      );

      el.addEventListener("touchend", (e) => {
        if (!touchStartTime) return;
        const elapsed = Date.now() - touchStartTime;
        touchStartTime = 0;

        if (e.changedTouches && e.changedTouches[0]) {
          const dx = Math.abs(e.changedTouches[0].clientX - touchStartX);
          const dy = Math.abs(e.changedTouches[0].clientY - touchStartY);
          // Nếu người dùng đang vuốt cuộn trang (khoảng cách di chuyển ngón tay > 18px), bỏ qua không tính là tap
          if (dx > 18 || dy > 18) return;
        }

        if (elapsed < 750) {
          e.preventDefault();
          handledByTouch = true;
          setTimeout(() => {
            handledByTouch = false;
          }, 400);
          callback();
        }
      });

      el.addEventListener("click", (e) => {
        if (handledByTouch) {
          e.preventDefault();
          return;
        }
        callback();
      });
    };

    // Build pagination indicator dots
    if (dotsWrap) {
      dotsWrap.innerHTML = "";
      cards.forEach((_, idx) => {
        const dot = document.createElement("button");
        dot.className = `carousel-dot ${idx === 0 ? "active" : ""}`;
        dot.setAttribute("aria-label", `Slide ${idx + 1}`);
        attachFastTap(dot, () => {
          if (idx !== activeIndex) {
            this.sounds.playClick();
            goTo(idx);
          }
        });
        dotsWrap.appendChild(dot);
      });
    }

    const updateDots = () => {
      if (!dotsWrap) return;
      const dots = dotsWrap.querySelectorAll(".carousel-dot");
      dots.forEach((dot, idx) => {
        dot.classList.toggle("active", idx === activeIndex);
      });
    };

    // Responsive button positioning: On desktop (> 640px), arrows sit on wrapper sides. On mobile (<= 640px), arrows are hidden via CSS in favor of touch swipe + dots + swipe hint.
    const updateNavButtonPlacement = () => {
      const controlsBar = document.querySelector(".carousel-controls-bar");
      const wrapper = stage.closest(".plugin-carousel-wrapper");

      if (controlsBar && wrapper && dotsWrap) {
        wrapper.insertBefore(prevBtn, stage);
        wrapper.appendChild(nextBtn);
        controlsBar.parentNode.insertBefore(dotsWrap, controlsBar);
        controlsBar.remove();
      }
    };

    updateNavButtonPlacement();

    // 5-Card Smile Arc Geometry (Tối ưu hóa GPU: Không dùng filter blur, mobile chạy 2D mượt mà)
    const getGeometry = (diff, screenWidth) => {
      const isMobile = screenWidth <= 640;
      const isTablet = screenWidth <= 1024 && !isMobile;

      if (isMobile) {
        const sideOffset = screenWidth <= 380 ? 170 : 195;
        if (diff === 0) {
          return { x: 0, y: 12, scale: 1, rotZ: 0, rotY: 0, opacity: 1, zIndex: 30, pointerEvents: "auto" };
        } else if (diff === 1) {
          return { x: sideOffset, y: -6, scale: 0.84, rotZ: 3.5, rotY: -9, opacity: 0.78, zIndex: 20, pointerEvents: "auto" };
        } else if (diff === -1) {
          return { x: -sideOffset, y: -6, scale: 0.84, rotZ: -3.5, rotY: 9, opacity: 0.78, zIndex: 20, pointerEvents: "auto" };
        } else {
          const sign = diff > 0 ? 1 : -1;
          return { x: sign * 320, y: -30, scale: 0.65, rotZ: 0, rotY: 0, opacity: 0, zIndex: 1, pointerEvents: "none" };
        }
      }

      if (isTablet) {
        if (diff === 0) {
          return { x: 0, y: 22, scale: 1, rotZ: 0, rotY: 0, opacity: 1, zIndex: 30, pointerEvents: "auto" };
        } else if (diff === 1) {
          return { x: 290, y: -10, scale: 0.86, rotZ: 3.5, rotY: -6, opacity: 0.85, zIndex: 20, pointerEvents: "auto" };
        } else if (diff === -1) {
          return { x: -290, y: -10, scale: 0.86, rotZ: -3.5, rotY: 6, opacity: 0.85, zIndex: 20, pointerEvents: "auto" };
        } else if (diff === 2) {
          return { x: 520, y: -50, scale: 0.74, rotZ: 6.5, rotY: -12, opacity: 0.5, zIndex: 10, pointerEvents: "auto" };
        } else if (diff === -2) {
          return { x: -520, y: -50, scale: 0.74, rotZ: -6.5, rotY: 12, opacity: 0.5, zIndex: 10, pointerEvents: "auto" };
        } else {
          const sign = diff > 0 ? 1 : -1;
          return { x: sign * 680, y: -100, scale: 0.6, rotZ: 0, rotY: 0, opacity: 0, zIndex: 1, pointerEvents: "none" };
        }
      }

      // Desktop layout (Đúng 5 thẻ cung môi cười, siêu sắc nét, 0% blur)
      if (diff === 0) {
        return { x: 0, y: 28, scale: 1, rotZ: 0, rotY: 0, opacity: 1, zIndex: 30, pointerEvents: "auto" };
      } else if (diff === 1) {
        return { x: 365, y: -14, scale: 0.88, rotZ: 4.5, rotY: -10, opacity: 0.85, zIndex: 20, pointerEvents: "auto" };
      } else if (diff === -1) {
        return { x: -365, y: -14, scale: 0.88, rotZ: -4.5, rotY: 10, opacity: 0.85, zIndex: 20, pointerEvents: "auto" };
      } else if (diff === 2) {
        return { x: 675, y: -75, scale: 0.76, rotZ: 9, rotY: -18, opacity: 0.55, zIndex: 10, pointerEvents: "auto" };
      } else if (diff === -2) {
        return { x: -675, y: -75, scale: 0.76, rotZ: -9, rotY: 18, opacity: 0.55, zIndex: 10, pointerEvents: "auto" };
      } else {
        const sign = diff > 0 ? 1 : -1;
        return { x: sign * 880, y: -140, scale: 0.65, rotZ: 0, rotY: 0, opacity: 0, zIndex: 1, pointerEvents: "none" };
      }
    };

    // Active card stays completely still and steady (no swaying/bobbing)
    const restartIdleFloat = () => {
      if (idleFloatTween) {
        idleFloatTween.kill();
        idleFloatTween = null;
      }
    };

    // Micro-animation triggers on card entrance (disabled to keep logo & price completely stable)
    const triggerCardEffects = (card) => {};

    let isFannedOut = false;

    // Gathered state: Thẻ gọp lại thành 1 thẻ duy nhất ở giữa (thẻ chính diện hiển thị 100%, không biến mất)
    const setGathered = (immediate = false) => {
      isFannedOut = false;
      const screenWidth = window.innerWidth;
      const isMobile = screenWidth <= 640;
      const maxActiveCards = isMobile ? 1 : 2;

      cards.forEach((card, i) => {
        let diff = i - activeIndex;
        const half = total / 2;
        while (diff > half) diff -= total;
        while (diff < -half) diff += total;

        const absDiff = Math.abs(diff);
        const isActive = diff === 0;
        card.classList.toggle("is-active", isActive);

        // Tối ưu CPU/GPU: Ẩn bằng visibility (không gây DOM reflow / layout thrashing như display: none)
        if (absDiff > maxActiveCards) {
          gsap.set(card, { opacity: 0, pointerEvents: "none", visibility: "hidden" });
          return;
        }

        card.style.visibility = "visible";
        const targetX = 0;
        const targetY = isMobile ? 12 : 28;
        const targetScale = isActive ? 1 : 0.94;
        const targetOpacity = isActive ? 1 : 0;
        const targetZ = isActive ? 30 : 10;

        if (immediate) {
          gsap.set(card, {
            x: targetX,
            y: targetY,
            scale: targetScale,
            rotationZ: 0,
            rotationY: 0,
            rotationX: 0,
            opacity: targetOpacity,
            zIndex: targetZ,
            pointerEvents: isActive ? "auto" : "none"
          });
          if (isActive) card.style.filter = "none";
        } else {
          gsap.to(card, {
            x: targetX,
            y: targetY,
            scale: targetScale,
            rotationZ: 0,
            rotationY: 0,
            rotationX: 0,
            opacity: targetOpacity,
            zIndex: targetZ,
            pointerEvents: isActive ? "auto" : "none",
            force3D: true,
            duration: isMobile ? 0.30 : 0.42,
            ease: "power2.out",
            overwrite: "auto",
            onComplete: () => {
              if (isActive) card.style.filter = "none";
            }
          });
        }
      });
      updateDots();
    };

    // Fan-out animation: Cards burst out from center stack into the 3D smile arc
    const fanOut = (immediate = false) => {
      isFannedOut = true;
      const screenWidth = window.innerWidth;
      const isMobile = screenWidth <= 640;
      const maxActiveCards = isMobile ? 1 : 2;

      cards.forEach((card, i) => {
        let diff = i - activeIndex;
        const half = total / 2;
        while (diff > half) diff -= total;
        while (diff < -half) diff += total;

        const absDiff = Math.abs(diff);

        // Chỉ xử lý các thẻ nhìn thấy được. Các thẻ còn lại ẩn visibility không tốn 1ms GPU
        if (absDiff > maxActiveCards) {
          gsap.set(card, { opacity: 0, pointerEvents: "none", visibility: "hidden" });
          return;
        }

        card.style.visibility = "visible";
        const geo = getGeometry(diff, screenWidth);
        const isActive = diff === 0;

        card.classList.toggle("is-active", isActive);

        if (immediate) {
          gsap.set(card, {
            x: geo.x,
            y: geo.y,
            scale: geo.scale,
            rotationZ: geo.rotZ,
            rotationY: geo.rotY,
            rotationX: 0,
            opacity: geo.opacity,
            zIndex: geo.zIndex,
            pointerEvents: geo.pointerEvents
          });
          if (isActive) card.style.filter = "none";
          return;
        }

        // Bung thẻ từ giữa ra với lò xo 3D cực mượt (giống 100% PC trên cả Mobile)
        let delay = 0;
        let duration = 0.65;
        let ease = "back.out(1.25)";

        if (absDiff === 0) {
          delay = 0;
          duration = 0.55;
          ease = "power2.out";
        } else if (absDiff === 1) {
          delay = isMobile ? 0.05 : 0.07;
          duration = isMobile ? 0.70 : 0.75;
          ease = "back.out(1.25)";
        } else if (absDiff === 2) {
          delay = 0.14;
          duration = 0.85;
          ease = "back.out(1.3)";
        }

        // Đảm bảo các thẻ phụ luôn xuất phát từ giữa (x: 0) trước khi bung ra ngoài
        if (!immediate && absDiff > 0) {
          gsap.set(card, {
            x: 0,
            y: isMobile ? 12 : 28,
            scale: 0.94,
            rotationZ: 0,
            rotationY: 0,
            opacity: 0
          });
        }

        gsap.to(card, {
          x: geo.x,
          y: geo.y,
          scale: geo.scale,
          rotationZ: geo.rotZ,
          rotationY: geo.rotY,
          rotationX: 0,
          opacity: geo.opacity,
          zIndex: geo.zIndex,
          pointerEvents: geo.pointerEvents,
          force3D: true,
          duration: duration,
          delay: delay,
          ease: ease,
          overwrite: "auto",
          onComplete: () => {
            if (isActive) {
              card.style.filter = "none";
            }
          }
        });
      });

      updateDots();
    };

    const renderCarousel = (immediate = false) => {
      isFannedOut = true;
      const screenWidth = window.innerWidth;
      const isMobile = screenWidth <= 640;
      const maxActiveCards = isMobile ? 1 : 2;
      const duration = isMobile ? 0.46 : 0.62;
      const ease = "power3.out";

      if (idleFloatTween) {
        idleFloatTween.kill();
        idleFloatTween = null;
      }

      cards.forEach((card, i) => {
        let diff = i - activeIndex;
        const half = total / 2;
        while (diff > half) diff -= total;
        while (diff < -half) diff += total;

        const absDiff = Math.abs(diff);
        const geo = getGeometry(diff, screenWidth);
        const isActive = diff === 0;

        card.classList.toggle("is-active", isActive);

        if (immediate) {
          if (absDiff > maxActiveCards) {
            gsap.set(card, { opacity: 0, pointerEvents: "none", visibility: "hidden" });
            return;
          }
          card.style.visibility = "visible";
          card.style.zIndex = geo.zIndex;
          gsap.set(card, {
            x: geo.x,
            y: geo.y,
            scale: geo.scale,
            rotationZ: geo.rotZ,
            rotationY: geo.rotY,
            rotationX: 0,
            opacity: geo.opacity,
            pointerEvents: geo.pointerEvents
          });
          if (isActive) card.style.filter = "none";
          return;
        }

        // 1. Thẻ trượt ra ngoài tầm nhìn (absDiff > maxActiveCards)
        if (absDiff > maxActiveCards) {
          // Animate mượt mà thẻ vừa rời khỏi mép (absDiff === maxActiveCards + 1) để trượt ra ngoài êm ái, không biến mất đột ngột
          if (absDiff === maxActiveCards + 1 && card.style.visibility !== "hidden") {
            const sign = diff > 0 ? 1 : -1;
            const exitX = geo.x || (sign * (isMobile ? 320 : 880));
            card.style.pointerEvents = "none";
            card.style.zIndex = "5";

            gsap.to(card, {
              x: exitX,
              y: geo.y,
              scale: 0.68,
              rotationZ: geo.rotZ,
              rotationY: geo.rotY,
              rotationX: 0,
              opacity: 0,
              force3D: true,
              duration: duration * 0.85,
              ease: ease,
              overwrite: "auto",
              onComplete: () => {
                card.style.visibility = "hidden";
              }
            });
          } else {
            gsap.set(card, { opacity: 0, pointerEvents: "none", visibility: "hidden" });
          }
          return;
        }

        // 2. Thẻ bước vào tầm nhìn từ bên ngoài (absDiff <= maxActiveCards)
        // Nếu thẻ trước đó đang ẩn, khởi tạo vị trí xuất phát từ mép ngoài để trượt vào tự nhiên
        if (card.style.visibility === "hidden" || Number(card.style.opacity || 0) === 0) {
          const sign = diff > 0 ? 1 : -1;
          const enterStartX = geo.x + (sign * (isMobile ? 70 : 140));
          gsap.set(card, {
            x: enterStartX,
            y: geo.y,
            scale: geo.scale * 0.94,
            rotationZ: geo.rotZ,
            rotationY: geo.rotY,
            rotationX: 0,
            opacity: 0,
            visibility: "visible",
            zIndex: geo.zIndex
          });
        }

        // Thứ tự lớp (Z-index): thẻ chính diện luôn nổi lên trên cùng xuyên suốt animation
        if (isActive) {
          card.style.zIndex = "30";
        } else if (absDiff === 1) {
          card.style.zIndex = "20";
        } else {
          card.style.zIndex = "10";
        }

        card.style.visibility = "visible";

        gsap.to(card, {
          x: geo.x,
          y: geo.y,
          scale: geo.scale,
          rotationZ: geo.rotZ,
          rotationY: geo.rotY,
          rotationX: 0,
          opacity: geo.opacity,
          pointerEvents: geo.pointerEvents,
          force3D: true,
          duration: duration,
          ease: ease,
          overwrite: "auto",
          onComplete: () => {
            if (isActive) {
              card.style.filter = "none";
            }
          }
        });
      });

      updateDots();
    };

    const goTo = (index) => {
      activeIndex = (index + total) % total;
      renderCarousel(false);
    };

    const prev = () => {
      this.sounds.playClick();
      goTo(activeIndex - 1);
    };

    const next = () => {
      this.sounds.playClick();
      goTo(activeIndex + 1);
    };

    if (prevBtn) attachFastTap(prevBtn, prev);
    if (nextBtn) attachFastTap(nextBtn, next);

    // Interactive Hover: Chỉ kích hoạt trên thiết bị có chuột thực tế (tránh lag giật trên cảm ứng mobile)
    if (window.matchMedia("(hover: hover)").matches) {
      cards.forEach((card, idx) => {
        card.addEventListener("mouseenter", () => {
          if (idx !== activeIndex) {
            card.style.zIndex = "35";
            gsap.to(card, {
              scale: "+=0.03",
              y: "-=8",
              opacity: 1,
              duration: 0.25,
              ease: "power2.out",
              overwrite: "auto"
            });
          } else {
            const geo = getGeometry(0, window.innerWidth);
            gsap.to(card, {
              y: geo.y - 8,
              duration: 0.25,
              ease: "power2.out",
              overwrite: "auto"
            });
            const icon = card.querySelector(".mc-item-icon");
            if (icon) {
              gsap.to(icon, { scale: 1.18, rotation: 5, duration: 0.22, ease: "back.out(2)", overwrite: "auto" });
            }
          }
        });

        card.addEventListener("mouseleave", () => {
          if (idx !== activeIndex) {
            let diff = idx - activeIndex;
            const half = total / 2;
            while (diff > half) diff -= total;
            while (diff < -half) diff += total;
            const geo = getGeometry(diff, window.innerWidth);
            card.style.zIndex = geo.zIndex;
            gsap.to(card, {
              scale: geo.scale,
              y: geo.y,
              opacity: geo.opacity,
              duration: 0.3,
              ease: "power2.out",
              overwrite: "auto"
            });
          } else {
            const geo = getGeometry(0, window.innerWidth);
            gsap.to(card, {
              y: geo.y,
              duration: 0.3,
              ease: "power2.out",
              overwrite: "auto"
            });
            const icon = card.querySelector(".mc-item-icon");
            if (icon) {
              gsap.to(icon, { scale: 1, rotation: 0, duration: 0.22, ease: "power2.out", overwrite: "auto" });
            }
          }
        });
      });
    }

    // Clicking a side card focuses it (ignore clicks on action buttons or after dragging)
    cards.forEach((card, idx) => {
      card.addEventListener("click", (e) => {
        if (justDragged) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        if (e.target.closest(".btn-card-action")) return;
        if (idx !== activeIndex) {
          e.preventDefault();
          e.stopPropagation();
          this.sounds.playClick();
          goTo(idx);
        }
      });
    });

    // Smart Proximity Gap-Click Handler:
    // If user clicks in the narrow space between cards, navigate to the closest card
    stage.addEventListener("click", (e) => {
      if (justDragged) return;
      if (e.target.closest(".btn-card-action, .carousel-nav-btn, .carousel-dots-wrap, a")) return;
      if (!e.target.closest(".plugin-card")) {
        const stageRect = stage.getBoundingClientRect();
        const clickX = e.clientX - (stageRect.left + stageRect.width / 2);
        let closestIdx = activeIndex;
        let minDistance = Infinity;

        cards.forEach((card, i) => {
          let diff = i - activeIndex;
          const half = total / 2;
          while (diff > half) diff -= total;
          while (diff < -half) diff += total;

          if (Math.abs(diff) <= 2) {
            const geo = getGeometry(diff, window.innerWidth);
            const dist = Math.abs(clickX - geo.x);
            if (dist < minDistance) {
              minDistance = dist;
              closestIdx = i;
            }
          }
        });

        if (closestIdx !== activeIndex) {
          this.sounds.playClick();
          goTo(closestIdx);
        }
      }
    });

    // Universal Mouse (PC) & Touch (Mobile) Drag Swipe
    let startX = 0;
    let startY = 0;
    let isPointerDown = false;
    let hasDragged = false;
    let justDragged = false;

    // Prevent default browser ghost dragging on cards & images
    stage.addEventListener("dragstart", (e) => e.preventDefault());

    const onPointerDown = (e) => {
      // Don't drag if clicking buttons, links, or navigation arrows
      if (e.target.closest(".btn-card-action, .carousel-nav-btn, .carousel-dots-wrap, a")) return;
      if (e.pointerType === "mouse" && e.button !== 0) return; // Only primary mouse button

      isPointerDown = true;
      hasDragged = false;
      startX = e.clientX;
      startY = e.clientY;
    };

    const onPointerMove = (e) => {
      if (!isPointerDown) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      // Threshold check: 8px horizontal drag
      if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
        hasDragged = true;
        stage.classList.add("is-dragging");
      }
    };

    const onPointerUp = (e) => {
      if (!isPointerDown) return;
      isPointerDown = false;
      stage.classList.remove("is-dragging");

      if (hasDragged) {
        const dx = e.clientX - startX;
        justDragged = true;
        setTimeout(() => { justDragged = false; }, 120);

        if (Math.abs(dx) > 30) {
          if (dx < 0) next();
          else prev();
        }
      }
    };

    stage.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    // Keyboard Arrow navigation
    window.addEventListener("keydown", (e) => {
      const rect = stage.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;

      if (e.key === "ArrowLeft") {
        prev();
      } else if (e.key === "ArrowRight") {
        next();
      }
    });

    // Scroll Detection & Trigger: Cuộn từ trên xuống HOẶC từ dưới lên tới gần nửa màn hình thì mới xuất hiện
    let hasFannedOut = false;

    const checkScrollState = (immediate = false) => {
      const rect = stage.getBoundingClientRect();
      const vh = window.innerHeight;
      const triggerStart = vh * 0.50;

      // In view: Đỉnh thẻ chạm nửa màn hình và đáy thẻ chưa cuộn khỏi màn hình
      const inView = (rect.top <= triggerStart && rect.bottom >= 20);

      if (inView) {
        if (!hasFannedOut) {
          hasFannedOut = true;
          fanOut(immediate);
        }
      } else {
        // Khi cuộn ra khỏi vùng kích hoạt:
        const isFarAbove = rect.top > triggerStart + 40;
        const isFarBelow = rect.bottom < -20;

        if (hasFannedOut && (isFarAbove || isFarBelow)) {
          hasFannedOut = false;
          setGathered(false);
        }
      }
    };

    // 1. Đồng bộ 2 chiều (Top & Bottom) qua GSAP ScrollTrigger
    if (window.ScrollTrigger) {
      ScrollTrigger.create({
        trigger: stage,
        start: "top 50%",
        end: "bottom top",
        onEnter: () => {
          if (!hasFannedOut) {
            hasFannedOut = true;
            fanOut(false);
          }
        },
        onLeave: () => {
          if (hasFannedOut) {
            hasFannedOut = false;
            setGathered(false);
          }
        },
        onEnterBack: () => {
          if (!hasFannedOut) {
            hasFannedOut = true;
            fanOut(false);
          }
        },
        onLeaveBack: () => {
          if (hasFannedOut) {
            hasFannedOut = false;
            setGathered(false);
          }
        }
      });
    }

    // 2. Fallback scroll listener nếu không có ScrollTrigger (tránh xung đột gọi đè tween gây giật)
    if (!window.ScrollTrigger) {
      let isScrollTicking = false;
      const onScrollTick = () => {
        if (!isScrollTicking) {
          isScrollTicking = true;
          requestAnimationFrame(() => {
            checkScrollState(false);
            isScrollTicking = false;
          });
        }
      };

      if (this.lenis) {
        this.lenis.on("scroll", onScrollTick);
      }
      window.addEventListener("scroll", onScrollTick, { passive: true });
    }

    // 4. Initial check on load: Kiểm tra ngay khi tải trang
    const checkInitialView = () => {
      const rect = stage.getBoundingClientRect();
      const vh = window.innerHeight;
      const triggerStart = vh * 0.50;

      const inView = (rect.top <= triggerStart && rect.bottom >= 20);

      if (inView) {
        hasFannedOut = true;
        fanOut(true);
      } else {
        hasFannedOut = false;
        setGathered(true);
      }
    };

    checkInitialView();
    window.addEventListener("load", checkInitialView);

    // Responsive resize handler
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        updateNavButtonPlacement();
        renderCarousel(false);
      }, 120);
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.PocketMCApp = new PocketMCApp();
});

window.addEventListener("load", () => {
  if (window.ScrollTrigger) ScrollTrigger.refresh();
});

if (document.fonts && document.fonts.ready) {
  document.fonts.ready.then(() => {
    if (window.ScrollTrigger) ScrollTrigger.refresh();
  });
}
