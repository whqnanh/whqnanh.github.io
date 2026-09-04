/**
 * PocketMC Shared Shopping Cart & 360° Draggable Chest Controller
 * - Universal PointerEvent dragging: Full-screen mobility on Desktop & Mobile touch
 * - Smart Dynamic Orientation: Automatically flips above/below, left/right to prevent screen cut-offs
 * - Minimalist "Empty" state (pure text, no icons)
 * - Persistent cart across pages via localStorage
 */

class PocketMCCart {
  constructor() {
    this.storageKey = "pocketmc_cart_items";
    this.items = this.loadCart();
    this.isOpen = false;
    this.isDragging = false;
    this.hasMoved = false;
    this.verticalOrientation = "above";

    this.init();
  }

  loadCart() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (_) {
      return [];
    }
  }

  saveCart() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items));
    } catch (_) {}
  }

  init() {
    this.setupDraggable();
    this.setupEventListeners();
    this.render();
  }

  setupDraggable() {
    const chestWidget = document.getElementById("chest-widget");
    const chestButton = document.getElementById("chest-button");
    if (!chestWidget || !chestButton) return;

    let startX = 0;
    let startY = 0;
    let initLeft = 0;
    let initTop = 0;
    let hasMoved = false;

    const onPointerDown = (e) => {
      // Don't initiate drag if clicking inside the open cart modal
      if (e.target.closest("#chest-modal")) return;

      const rect = chestWidget.getBoundingClientRect();
      initLeft = rect.left;
      initTop = rect.top;
      startX = e.clientX;
      startY = e.clientY;
      hasMoved = false;

      const onPointerMove = (moveEvt) => {
        const dx = moveEvt.clientX - startX;
        const dy = moveEvt.clientY - startY;

        // Threshold check: 10px prevents normal clicks from being treated as drag
        if (Math.hypot(dx, dy) > 10) {
          if (!hasMoved) {
            hasMoved = true;
            this.isDragging = true;
            chestWidget.classList.add("is-dragging");

            // Lock to left/top positioning only when actual drag starts
            chestWidget.style.left = `${initLeft}px`;
            chestWidget.style.top = `${initTop}px`;
            chestWidget.style.bottom = "auto";
            chestWidget.style.right = "auto";

            try {
              chestButton.setPointerCapture(e.pointerId);
            } catch (_) {}
          }

          const chestW = chestWidget.offsetWidth || 80;
          const chestH = chestWidget.offsetHeight || 80;
          const maxX = window.innerWidth - chestW - 8;
          const maxY = window.innerHeight - chestH - 8;

          const newX = Math.max(8, Math.min(maxX, initLeft + dx));
          const newY = Math.max(8, Math.min(maxY, initTop + dy));

          chestWidget.style.left = `${newX}px`;
          chestWidget.style.top = `${newY}px`;

          if (this.isOpen) {
            this.updateModalOrientation(newX, newY, chestW, chestH);
          }
        }
      };

      const onPointerUp = (upEvt) => {
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
        window.removeEventListener("pointercancel", onPointerUp);
        chestWidget.classList.remove("is-dragging");

        if (hasMoved) {
          try {
            chestButton.releasePointerCapture(upEvt.pointerId);
          } catch (_) {}

          setTimeout(() => {
            this.isDragging = false;
            hasMoved = false;
          }, 120);

          if (this.isOpen) {
            this.updateModalOrientation();
          }
        } else {
          this.isDragging = false;
          hasMoved = false;
        }
      };

      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
      window.addEventListener("pointercancel", onPointerUp);
    };

    chestButton.addEventListener("pointerdown", onPointerDown);

    // Keep within bounds on window resize
    window.addEventListener("resize", () => {
      const rect = chestWidget.getBoundingClientRect();
      const chestW = chestWidget.offsetWidth || 80;
      const chestH = chestWidget.offsetHeight || 80;
      const maxX = window.innerWidth - chestW - 8;
      const maxY = window.innerHeight - chestH - 8;

      if (rect.left > maxX || rect.top > maxY) {
        chestWidget.style.left = `${Math.max(8, Math.min(maxX, rect.left))}px`;
        chestWidget.style.top = `${Math.max(8, Math.min(maxY, rect.top))}px`;
      }

      if (this.isOpen) {
        this.updateModalOrientation();
      }
    });
  }

  setupEventListeners() {
    const chestBtn = document.getElementById("chest-button");
    const closeBtn = document.getElementById("chest-modal-close");
    const clearBtn = document.getElementById("btn-cart-clear");
    const checkoutBtn = document.getElementById("btn-cart-checkout");

    if (chestBtn) {
      chestBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.isDragging) return;
        this.toggleCart();
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.closeCart();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.clearCart();
      });
    }

    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.items.length === 0) return;

        checkoutBtn.classList.add("success");
        checkoutBtn.innerHTML = `<span>Order Confirmed!</span>`;
        setTimeout(() => {
          this.clearCart();
          this.closeCart();
          checkoutBtn.classList.remove("success");
          checkoutBtn.innerHTML = `<span>Checkout</span> <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
        }, 1800);
      });
    }

    // Close when clicking outside chest widget
    document.addEventListener("click", (e) => {
      const chestWidget = document.getElementById("chest-widget");
      if (this.isOpen && chestWidget && !chestWidget.contains(e.target)) {
        this.closeCart();
      }
    });

    // Delegate remove item clicks inside cart & isolate scrolling
    const cartList = document.getElementById("cart-items-list");
    if (cartList) {
      cartList.setAttribute("data-lenis-prevent", "true");

      cartList.addEventListener("click", (e) => {
        const removeBtn = e.target.closest(".btn-cart-remove");
        if (removeBtn) {
          e.preventDefault();
          e.stopPropagation();
          const pluginId = removeBtn.getAttribute("data-id");
          if (pluginId) this.removeItem(pluginId);
        }
      });

      // Stop wheel event bubbling so Lenis cannot intercept or hijack scrolling
      cartList.addEventListener("wheel", (e) => {
        e.stopPropagation();
      }, { passive: true });

      // Stop touchmove bubbling for smooth native touch scrolling on mobile
      cartList.addEventListener("touchmove", (e) => {
        e.stopPropagation();
      }, { passive: true });
    }

    // Universal event delegation for all Add to Cart, Buy Now, and Like buttons
    document.addEventListener("click", (e) => {
      const cartBtn = e.target.closest(".btn-card-cart");
      if (cartBtn) {
        e.preventDefault();
        e.stopPropagation();
        const card = cartBtn.closest(".plugin-card");
        const title = cartBtn.getAttribute("data-plugin") || card?.querySelector(".plugin-title")?.textContent.trim() || "Plugin";
        const priceText = card?.querySelector(".price-pill")?.textContent.trim() || "$0.00";
        const isFree = priceText.toUpperCase().includes("FREE");
        const price = isFree ? 0 : parseFloat(priceText.replace(/[^0.0-9]/g, "")) || 0;
        const icon = card?.querySelector(".mc-item-icon")?.textContent.trim() || "📦";

        this.addItem({
          id: title,
          name: title,
          price: price,
          priceText: isFree ? "FREE" : `$${price.toFixed(2)}`,
          icon: icon
        }, true);

        // Fly item into the open chest!
        this.flyItemToChest(cartBtn, card);

        // Micro-animation on button
        const origHTML = cartBtn.innerHTML;
        cartBtn.classList.add("added");
        cartBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        setTimeout(() => {
          cartBtn.innerHTML = origHTML;
          cartBtn.classList.remove("added");
        }, 1500);
        return;
      }

      const buyBtn = e.target.closest(".btn-card-buy, .btn-get");
      if (buyBtn) {
        e.preventDefault();
        e.stopPropagation();
        const card = buyBtn.closest(".plugin-card");
        const title = buyBtn.getAttribute("data-plugin") || card?.querySelector(".plugin-title")?.textContent.trim() || "Plugin";
        const priceText = card?.querySelector(".price-pill")?.textContent.trim() || "$0.00";
        const isFree = priceText.toUpperCase().includes("FREE");
        const price = isFree ? 0 : parseFloat(priceText.replace(/[^0.0-9]/g, "")) || 0;
        const icon = card?.querySelector(".mc-item-icon")?.textContent.trim() || "📦";

        this.addItem({
          id: title,
          name: title,
          price: price,
          priceText: isFree ? "FREE" : `$${price.toFixed(2)}`,
          icon: icon
        });

        this.openCart();
        return;
      }

      const likeBtn = e.target.closest(".btn-card-like");
      if (likeBtn) {
        e.preventDefault();
        e.stopPropagation();
        likeBtn.classList.toggle("liked");
        if (window.gsap) {
          gsap.fromTo(likeBtn.querySelector(".heart-icon") || likeBtn,
            { scale: 0.7 },
            { scale: 1.25, duration: 0.2, yoyo: true, repeat: 1, ease: "power2.out" }
          );
        }
        return;
      }
    });
  }

  addItem(item, skipBounce = false) {
    const existing = this.items.find(i => i.id === item.id);
    if (!existing) {
      this.items.push(item);
      this.saveCart();
      this.render();
      if (!skipBounce) this.animateBadgeBounce();
    } else {
      if (!skipBounce) this.animateBadgeBounce();
    }
  }

  removeItem(id) {
    this.items = this.items.filter(i => i.id !== id);
    this.saveCart();
    this.render();
  }

  clearCart() {
    this.items = [];
    this.saveCart();
    this.render();
  }

  animateBadgeBounce() {
    const badge = document.getElementById("chest-cart-badge");
    if (badge && window.gsap) {
      gsap.killTweensOf(badge);
      gsap.timeline()
        .to(badge, { scale: 1.45, duration: 0.16, ease: "power2.out" })
        .to(badge, { scale: 1, duration: 0.28, ease: "back.out(2.5)", clearProps: "transform" });
    }
  }

  /**
   * Magical loot arc trajectory flying from clicked card directly into the chest,
   * featuring Gold Ingot, Emerald, Iron Ingot & Diamond with vibrant glow,
   * lid opening, elastic catch absorption, and authentic Minecraft loot burst!
   */
  flyItemToChest(sourceBtn, card) {
    if (!sourceBtn || !window.gsap) return;
    const chest = document.getElementById("chest-widget");
    const chestImg = document.getElementById("chest-icon-img");
    if (!chest || !chestImg) return;

    // 1. Calculate live coordinates on viewport
    const btnRect = sourceBtn.getBoundingClientRect();
    const startX = btnRect.left + btnRect.width / 2;
    const startY = btnRect.top + btnRect.height / 2;

    const chestRect = chest.getBoundingClientRect();
    const destX = chestRect.left + chestRect.width / 2;
    const destY = chestRect.top + chestRect.height / 2 - 8; // aim into chest opening

    // Available Minecraft treasure loot items (Gold, Emerald, Diamond, Iron)
    const LOOT_ITEMS = [
      {
        name: "Gold Ingot",
        src: "assets/gold-ingot.png",
        glow: "drop-shadow(0 0 14px rgba(251, 191, 36, 0.95)) drop-shadow(0 3px 12px rgba(245, 158, 11, 0.8))",
        trailColor: "#fbbf24"
      },
      {
        name: "Emerald",
        src: "assets/emerald.png",
        glow: "drop-shadow(0 0 14px rgba(16, 185, 129, 0.95)) drop-shadow(0 3px 12px rgba(5, 150, 105, 0.8))",
        trailColor: "#10b981"
      },
      {
        name: "Diamond",
        src: "assets/diamond.png",
        glow: "drop-shadow(0 0 14px rgba(0, 210, 255, 0.95)) drop-shadow(0 3px 12px rgba(14, 165, 233, 0.8))",
        trailColor: "#00d2ff"
      },
      {
        name: "Iron Ingot",
        src: "assets/iron-ingot.png",
        glow: "drop-shadow(0 0 14px rgba(226, 232, 240, 0.95)) drop-shadow(0 3px 12px rgba(148, 163, 184, 0.8))",
        trailColor: "#e2e8f0"
      }
    ];

    // Randomly pick exactly 1 loot item per click
    const item = LOOT_ITEMS[Math.floor(Math.random() * LOOT_ITEMS.length)];
    const flightDuration = 0.72;

    const flyingEl = document.createElement("div");
    flyingEl.className = "flying-loot-item";
    flyingEl.style.filter = item.glow;
    flyingEl.innerHTML = `<img src="${item.src}" alt="${item.name}" draggable="false">`;
    document.body.appendChild(flyingEl);

    gsap.set(flyingEl, {
      x: startX,
      y: startY,
      scale: 0.3,
      opacity: 0,
      rotation: 0
    });

    // Control point for arc trajectory (arcs gracefully into the air)
    const dx = destX - startX;
    const dy = destY - startY;
    const arcHeight = Math.max(70, Math.min(210, Math.sqrt(dx * dx + dy * dy) * 0.28));
    const midX = (startX + destX) / 2;
    const midY = Math.min(startY, destY) - arcHeight;

    const tl = gsap.timeline({
      onComplete: () => {
        flyingEl.remove();
      }
    });

    // Initial launch pop
    tl.to(flyingEl, {
      scale: 1,
      opacity: 1,
      duration: 0.14,
      ease: "back.out(2)"
    }, 0);

    // Quadratic Bezier Flight Path
    const tracker = { t: 0 };
    tl.to(tracker, {
      t: 1,
      duration: flightDuration,
      ease: "power2.inOut",
      onUpdate: () => {
        const t = tracker.t;
        const curX = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * midX + t * t * destX;
        const curY = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * midY + t * t * destY;
        const rot = t * 360;

        gsap.set(flyingEl, { x: curX, y: curY, rotation: rot });

        // Spawn sparkle trail along path matching item color
        if (Math.random() < 0.45 && t < 0.88) {
          const trail = document.createElement("div");
          trail.className = "flying-loot-trail";
          trail.style.background = item.trailColor;
          trail.style.boxShadow = `0 0 10px ${item.trailColor}`;
          const s = Math.random() * 8 + 4;
          trail.style.width = `${s}px`;
          trail.style.height = `${s}px`;
          document.body.appendChild(trail);
          gsap.set(trail, {
            x: curX + (Math.random() - 0.5) * 12,
            y: curY + (Math.random() - 0.5) * 12,
            opacity: 0.85
          });
          gsap.to(trail, {
            opacity: 0,
            scale: 0.2,
            duration: 0.35,
            ease: "power1.out",
            onComplete: () => trail.remove()
          });
        }
      }
    }, 0);

    // Chest anticipation & opening as loot nears (at 52% of flight)
    tl.add(() => {
      chest.classList.add("chest-receiving");
      chestImg.src = "assets/chest-open.png";
      gsap.fromTo(chestImg,
        { scaleY: 0.9, scaleX: 1.1 },
        { scaleY: 1.15, scaleX: 0.93, duration: 0.18, yoyo: true, repeat: 1, ease: "power1.out" }
      );
    }, flightDuration * 0.52);

    // Item plunges into chest opening
    tl.to(flyingEl, {
      scale: 0.15,
      opacity: 0,
      duration: 0.12,
      ease: "power2.in"
    }, flightDuration - 0.08);

    // Catch impact & snap shut!
    tl.add(() => {
      // 1. Particle burst from mouth of chest
      this.triggerChestBurst(destX, destY);

      // 2. Snap chest closed (unless user currently has cart modal open)
      if (!this.isOpen) {
        chestImg.src = "assets/chest-closed.png";
      }
      chest.classList.remove("chest-receiving");

      // 3. Punchy elastic impact snap
      gsap.fromTo(chestImg,
        { scaleY: 0.82, scaleX: 1.18 },
        { scaleY: 1, scaleX: 1, duration: 0.42, ease: "elastic.out(1.2, 0.4)" }
      );

      // 4. Pop badge at the moment of capture!
      this.animateBadgeBounce();
    }, flightDuration);
  }

  triggerChestBurst(x, y) {
    if (!window.gsap) return;

    // 1. Mini Minecraft Loot Items burst (Gold Ingot, Emerald, Iron Ingot, Diamond)
    const lootAssets = [
      "assets/gold-ingot.png",
      "assets/emerald.png",
      "assets/iron-ingot.png",
      "assets/diamond.png"
    ];

    lootAssets.forEach((src, idx) => {
      const lootIcon = document.createElement("div");
      lootIcon.className = "chest-burst-loot";
      lootIcon.innerHTML = `<img src="${src}" alt="loot" draggable="false">`;
      document.body.appendChild(lootIcon);

      const angle = -Math.PI / 2 + (idx - 1.5) * 0.5 + (Math.random() - 0.5) * 0.25;
      const dist = Math.random() * 45 + 38;
      const targetX = x + Math.cos(angle) * dist;
      const targetY = y + Math.sin(angle) * dist - 15;

      gsap.set(lootIcon, {
        x: x,
        y: y,
        scale: 0.3,
        opacity: 1,
        rotation: 0
      });

      gsap.to(lootIcon, {
        x: targetX,
        y: targetY,
        scale: 1,
        rotation: (Math.random() - 0.5) * 160,
        duration: 0.42,
        ease: "power2.out",
        onComplete: () => {
          gsap.to(lootIcon, {
            y: targetY + 22,
            opacity: 0,
            scale: 0.4,
            duration: 0.32,
            ease: "power1.in",
            onComplete: () => lootIcon.remove()
          });
        }
      });
    });

    // 2. Magical Minecraft sparkles
    const sparkles = ["✨", "⭐", "💫", "⚡", "✨", "⭐"];
    for (let i = 0; i < 8; i++) {
      const sp = document.createElement("div");
      sp.className = "chest-sparkle";
      sp.textContent = sparkles[Math.floor(Math.random() * sparkles.length)];
      document.body.appendChild(sp);

      const angle = (Math.PI * 2 * i) / 8 + (Math.random() - 0.5) * 0.4;
      const dist = Math.random() * 50 + 30;
      const targetX = x + Math.cos(angle) * dist;
      const targetY = y + Math.sin(angle) * dist - 15;

      gsap.set(sp, { x: x, y: y, scale: 0.4, opacity: 1 });
      gsap.to(sp, {
        x: targetX,
        y: targetY,
        scale: Math.random() * 0.6 + 0.8,
        opacity: 0,
        rotation: (Math.random() - 0.5) * 140,
        duration: 0.55,
        ease: "power2.out",
        onComplete: () => sp.remove()
      });
    }
  }

  /**
   * Smart directional placement:
   * Detects available screen space and opens modal above/below, left/right
   * with automatic viewport edge clamping so it NEVER cuts off!
   */
  updateModalOrientation(currentX, currentY, chestW, chestH) {
    const modal = document.getElementById("chest-modal");
    const chest = document.getElementById("chest-widget");
    if (!modal || !chest) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let posX = currentX;
    let posY = currentY;
    let w = chestW;
    let h = chestH;

    if (posX === undefined || posY === undefined) {
      const rect = chest.getBoundingClientRect();
      posX = rect.left;
      posY = rect.top;
      w = rect.width || 80;
      h = rect.height || 80;
    }

    // Modal width: perfectly constrained to viewport with at least 12px margin
    const modalWidth = Math.min(320, vw - 24);
    modal.style.width = `${modalWidth}px`;
    modal.style.transform = "none";

    // 1. DYNAMIC HORIZONTAL CONTINUOUS CLAMP:
    // Center the modal on the chest, but clamp so it NEVER cuts off the screen edge
    const chestCenterX = posX + (w / 2);
    const idealLeft = chestCenterX - (modalWidth / 2);
    const clampedLeft = Math.max(12, Math.min(vw - modalWidth - 12, idealLeft));

    // Convert screen position to local offset inside chestWidget
    modal.style.left = `${Math.round(clampedLeft - posX)}px`;
    modal.style.right = "auto";

    // 2. DYNAMIC VERTICAL FLIP (with buffer to prevent jitter):
    const modalHeight = modal.offsetHeight || 310;
    const spaceAbove = posY;
    const spaceBelow = vh - (posY + h);

    if (this.verticalOrientation === "above") {
      if (spaceAbove < modalHeight + 10 && spaceBelow > spaceAbove) {
        this.verticalOrientation = "below";
      }
    } else {
      if (spaceBelow < modalHeight + 10 && spaceAbove > spaceBelow) {
        this.verticalOrientation = "above";
      }
    }

    if (this.verticalOrientation === "below") {
      modal.style.top = `${Math.round(h + 10)}px`;
      modal.style.bottom = "auto";
    } else {
      modal.style.bottom = `${Math.round(h + 10)}px`;
      modal.style.top = "auto";
    }
  }

  toggleCart() {
    if (this.isOpen) this.closeCart();
    else this.openCart();
  }

  openCart() {
    if (this.isOpen) return;
    this.isOpen = true;
    const modal = document.getElementById("chest-modal");
    const chestImg = document.getElementById("chest-icon-img");
    const chestWidget = document.getElementById("chest-widget");

    if (modal) modal.classList.add("open");
    if (chestWidget) chestWidget.classList.add("open");

    this.updateModalOrientation();

    // 1. Elastic pop & creak open on the chest icon
    if (chestImg) {
      chestImg.src = "assets/chest-open.png";
      if (window.gsap) {
        gsap.killTweensOf(chestImg);
        gsap.timeline()
          .fromTo(chestImg,
            { scaleY: 0.82, scaleX: 1.16 },
            { scaleY: 1.14, scaleX: 0.92, duration: 0.15, ease: "power2.out" }
          )
          .to(chestImg, {
            scaleY: 1,
            scaleX: 1,
            duration: 0.4,
            ease: "elastic.out(1.2, 0.4)"
          });
      }
    }

    // 2. Spring popover entrance for the modal & item cascade
    if (modal) {
      modal.classList.add("open");
      if (window.gsap) {
        gsap.killTweensOf(modal);

        // Directional origin based on chest orientation
        const isBelow = this.verticalOrientation === "below";
        const startY = isBelow ? -16 : 16;
        const originY = isBelow ? "top" : "bottom";
        const isRight = this.horizontalOrientation === "right";
        const originX = isRight ? "left" : "right";

        gsap.set(modal, {
          opacity: 0,
          scale: 0.86,
          y: startY,
          transformOrigin: `${originX} ${originY}`
        });

        gsap.to(modal, {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.34,
          ease: "back.out(1.5)",
          clearProps: "transform"
        });

        // Micro-stagger for item rows
        const itemRows = modal.querySelectorAll(".cart-item-row");
        if (itemRows.length > 0) {
          gsap.fromTo(itemRows,
            { opacity: 0, x: -12, scale: 0.96 },
            { opacity: 1, x: 0, scale: 1, duration: 0.25, stagger: 0.04, delay: 0.08, ease: "power2.out" }
          );
        } else {
          const emptyState = modal.querySelector(".cart-empty-state");
          if (emptyState) {
            gsap.fromTo(emptyState,
              { opacity: 0, scale: 0.92, y: 8 },
              { opacity: 1, scale: 1, y: 0, duration: 0.3, delay: 0.06, ease: "back.out(1.4)" }
            );
          }
        }
      }
    }
  }

  closeCart() {
    if (!this.isOpen) return;
    this.isOpen = false;
    const modal = document.getElementById("chest-modal");
    const chestImg = document.getElementById("chest-icon-img");
    const chestWidget = document.getElementById("chest-widget");

    if (chestWidget) chestWidget.classList.remove("open");

    // Smooth modal shrink & fade
    if (modal) {
      if (window.gsap) {
        gsap.killTweensOf(modal);
        gsap.to(modal, {
          opacity: 0,
          scale: 0.9,
          y: 8,
          duration: 0.18,
          ease: "power2.in",
          onComplete: () => {
            modal.classList.remove("open");
            gsap.set(modal, { clearProps: "all" });
          }
        });
      } else {
        modal.classList.remove("open");
      }
    }

    // Chest snap shut elastic bounce
    if (chestImg) {
      chestImg.src = "assets/chest-closed.png";
      if (window.gsap) {
        gsap.killTweensOf(chestImg);
        gsap.timeline()
          .fromTo(chestImg,
            { scaleY: 0.88, scaleX: 1.14 },
            { scaleY: 1.06, scaleX: 0.96, duration: 0.12, ease: "power2.out" }
          )
          .to(chestImg, {
            scaleY: 1,
            scaleX: 1,
            duration: 0.35,
            ease: "elastic.out(1.2, 0.4)"
          });
      }
    }
  }

  render() {
    const count = this.items.length;
    const total = this.items.reduce((sum, item) => sum + (item.price || 0), 0);

    // Update Badge
    const badge = document.getElementById("chest-cart-badge");
    if (badge) {
      badge.textContent = count;
      if (count > 0) badge.classList.add("has-items");
      else badge.classList.remove("has-items");
    }

    // Update Modal Header Pill
    const pill = document.getElementById("cart-items-pill");
    if (pill) {
      pill.textContent = `${count} ${count === 1 ? "item" : "items"}`;
    }

    // Update Total
    const totalVal = document.getElementById("cart-total-val");
    if (totalVal) {
      totalVal.textContent = `$${total.toFixed(2)}`;
    }

    // Render Items List (Empty state with just "Empty", no icon or subtitle)
    const listContainer = document.getElementById("cart-items-list");
    if (listContainer) {
      if (count === 0) {
        listContainer.innerHTML = `
          <div class="cart-empty-state">
            <div class="cart-empty-title">Empty!</div>
          </div>
        `;
      } else {
        listContainer.innerHTML = this.items.map(item => `
          <div class="cart-item-row" data-id="${item.id}">
            <div class="cart-item-left">
              <div class="cart-item-icon">${item.icon || "📦"}</div>
              <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price ${item.price === 0 ? 'free' : ''}">${item.priceText}</div>
              </div>
            </div>
            <button class="btn-cart-remove" data-id="${item.id}" title="Remove item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                <line x1="10" y1="11" x2="10" y2="17"/>
                <line x1="14" y1="11" x2="14" y2="17"/>
              </svg>
            </button>
          </div>
        `).join("");
      }
    }
  }
}

// Immediate & DOMContentLoaded initialization safety guard
function initPocketMCCart() {
  if (!window.pocketMCCart) {
    window.pocketMCCart = new PocketMCCart();
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPocketMCCart);
} else {
  initPocketMCCart();
}
