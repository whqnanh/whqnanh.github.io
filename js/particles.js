/**
 * POCKETMC // MINIMALIST ZEN PARTICLE ENGINE
 * Features fewer, well-spaced particles that drift very slowly, calmly, and gracefully.
 * When the mouse approaches, particles are smoothly and cleanly chased away.
 */

class PocketMCParticles {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.particleCount = 175; // Minimalist, clean, and airy (ít hạt, thanh thoát)
    this.time = 0;

    this.mouse = {
      x: -1000,
      y: -1000,
      prevX: -1000,
      prevY: -1000,
      vx: 0,
      vy: 0,
      speed: 0,
      radius: 180
    };

    // PocketMC & Minecraft Gem Color Spectrum
    this.colors = [
      '#ea4335', // Redstone Red
      '#f25c05', // Fire Orange
      '#fa7b17', // Lava Orange
      '#fbbc04', // Gold Ingot
      '#10b981', // Emerald Green
      '#e52592', // Magenta Pink
      '#a855f7', // Amethyst Purple
      '#4285f4', // Lapis Lazuli Blue
      '#00d2ff', // Diamond Cyan
      '#bdc1c6'  // Ambient Silver Dust
    ];

    this.init();
  }

  init() {
    this.resize();

    window.addEventListener('resize', () => {
      this.resize();
      this.createParticles();
    });

    window.addEventListener('mousemove', (e) => {
      const curX = e.clientX;
      const curY = e.clientY;

      if (this.mouse.prevX !== -1000) {
        this.mouse.vx = (curX - this.mouse.prevX) * 0.55;
        this.mouse.vy = (curY - this.mouse.prevY) * 0.55;
        this.mouse.speed = Math.sqrt(this.mouse.vx * this.mouse.vx + this.mouse.vy * this.mouse.vy);
      }

      this.mouse.prevX = curX;
      this.mouse.prevY = curY;
      this.mouse.x = curX;
      this.mouse.y = curY;
    });

    window.addEventListener('mouseleave', () => {
      this.mouse.x = -1000;
      this.mouse.y = -1000;
      this.mouse.vx = 0;
      this.mouse.vy = 0;
      this.mouse.speed = 0;
    });

    this.createParticles();
    this.animate();
  }

  resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
  }

  createParticles() {
    this.particles = [];
    const isMobile = this.width < 768;

    // Origin center of the orbital vortex (left-aligned)
    const centerX = this.width * 0.04;
    const centerY = this.height * 0.48;

    const ringCount = isMobile ? 8 : 16; // Tinh gọn số vòng hạt trên mobile để chống lag
    const minRadius = 90;
    const maxRadius = Math.max(this.width, this.height) * 1.2;

    // 1. Concentric orbital wave particles (airy, clean spacing)
    for (let r = 0; r < ringCount; r++) {
      const ringRatio = r / (ringCount - 1);
      const radius = minRadius + Math.pow(ringRatio, 1.3) * (maxRadius - minRadius);
      const particlesInRing = Math.floor(6 + r * 1.8);

      let color;
      if (ringRatio < 0.12) color = '#ea4335';
      else if (ringRatio < 0.22) color = '#fa7b17';
      else if (ringRatio < 0.35) color = '#fbbc04';
      else if (ringRatio < 0.48) color = '#10b981';
      else if (ringRatio < 0.62) color = '#e52592';
      else if (ringRatio < 0.76) color = '#a855f7';
      else if (ringRatio < 0.88) color = '#4285f4';
      else color = '#00d2ff';

      for (let i = 0; i < particlesInRing; i++) {
        const angle = -1.2 + (i / particlesInRing) * 2.4 + (Math.random() - 0.5) * 0.06;
        const radialJitter = (Math.random() - 0.5) * 24;
        const actualRadius = radius + radialJitter;

        const bx = centerX + Math.cos(angle) * actualRadius;
        const by = centerY + Math.sin(angle) * actualRadius;

        const tangentAngle = angle + Math.PI / 2;
        const isDash = Math.random() > 0.35;
        const length = isDash ? Math.random() * 7 + 5 : Math.random() * 3 + 2;
        const thickness = Math.random() * 2 + 1.6;

        // EXTRA SLOW & CALM FLIGHT SPEED (Chậm rãi, êm đềm, thanh lịch)
        const flightSpeed = Math.random() * 0.045 + 0.025;
        const flightAngle = tangentAngle + (Math.random() - 0.5) * 0.2;

        this.particles.push({
          x: bx,
          y: by,
          homeX: bx,
          homeY: by,
          vx: Math.cos(flightAngle) * flightSpeed,
          vy: Math.sin(flightAngle) * flightSpeed,
          baseVx: Math.cos(flightAngle) * flightSpeed,
          baseVy: Math.sin(flightAngle) * flightSpeed,
          angle: tangentAngle,
          baseAngle: tangentAngle,
          length: length,
          thickness: thickness,
          color: color,
          alpha: Math.random() * 0.4 + 0.5,
          phase: Math.random() * Math.PI * 2,
          swaySpeed: Math.random() * 0.007 + 0.004,
          swayAmp: Math.random() * 5 + 2
        });
      }
    }

    // 2. Light ambient wandering particles
    const dustCount = isMobile ? 18 : 35;
    for (let d = 0; d < dustCount; d++) {
      const x = Math.random() * this.width;
      const y = Math.random() * this.height;
      const color = this.colors[Math.floor(Math.random() * this.colors.length)];

      const speed = Math.random() * 0.05 + 0.025;
      const driftAngle = Math.random() * Math.PI * 2;

      this.particles.push({
        x: x,
        y: y,
        homeX: x,
        homeY: y,
        vx: Math.cos(driftAngle) * speed,
        vy: Math.sin(driftAngle) * speed,
        baseVx: Math.cos(driftAngle) * speed,
        baseVy: Math.sin(driftAngle) * speed,
        angle: driftAngle,
        baseAngle: driftAngle,
        length: Math.random() * 3.5 + 1.8,
        thickness: Math.random() * 1.8 + 1.1,
        color: color,
        alpha: Math.random() * 0.3 + 0.2,
        phase: Math.random() * Math.PI * 2,
        swaySpeed: Math.random() * 0.006 + 0.003,
        swayAmp: Math.random() * 6 + 3
      });
    }
  }

  animate() {
    // Tối ưu hóa GPU: Nếu người dùng đã cuộn qua khỏi phần Hero (xuống xem Plugins), tạm dừng vẽ canvas
    if (window.scrollY > this.height + 60) {
      requestAnimationFrame(() => this.animate());
      return;
    }

    this.ctx.clearRect(0, 0, this.width, this.height);
    this.time += 0.010; // Extra slow time step for calm breathing

    const mouseX = this.mouse.x;
    const mouseY = this.mouse.y;
    const mouseRadius = this.mouse.radius;
    const mouseRadiusSq = mouseRadius * mouseRadius;

    // Decay mouse drag velocity
    this.mouse.vx *= 0.88;
    this.mouse.vy *= 0.88;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      // GENTLE HARMONIC SWAY (Đung đưa cực chậm và êm ái)
      const swayX = Math.cos(this.time * p.swaySpeed + p.phase) * (p.swayAmp * 0.025);
      const swayY = Math.sin(this.time * p.swaySpeed + p.phase) * (p.swayAmp * 0.025);

      p.vx += swayX;
      p.vy += swayY;

      // ACTIVE MOUSE CHASE / REPULSION ("Di chuột vào sẽ đuổi hạt đi")
      const dx = p.x - mouseX;
      const dy = p.y - mouseY;
      const distSq = dx * dx + dy * dy;

      if (distSq < mouseRadiusSq && distSq > 0) {
        const dist = Math.sqrt(distSq);
        const force = Math.pow(1 - dist / mouseRadius, 1.5);
        const chasePower = force * 18;

        const escapeAngle = Math.atan2(dy, dx);

        // Flee away with burst acceleration + directional push from cursor movement
        p.vx += Math.cos(escapeAngle) * chasePower + this.mouse.vx * force * 0.75;
        p.vy += Math.sin(escapeAngle) * chasePower + this.mouse.vy * force * 0.75;

        // Particle turns immediately in the escape direction
        p.angle = escapeAngle + Math.PI / 2;
      }

      // Air resistance smoothly decelerates the flee burst
      p.vx *= 0.93;
      p.vy *= 0.93;

      // Smoothly steer back towards slow base speed
      p.vx += (p.baseVx - p.vx) * 0.03;
      p.vy += (p.baseVy - p.vy) * 0.03;

      // Apply displacement
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around screen boundaries for infinite continuous flight
      const margin = 40;
      if (p.x < -margin) p.x = this.width + margin;
      else if (p.x > this.width + margin) p.x = -margin;
      if (p.y < -margin) p.y = this.height + margin;
      else if (p.y > this.height + margin) p.y = -margin;

      // Smoothly align angle with movement trajectory
      const moveAngle = Math.atan2(p.vy, p.vx) + Math.PI / 2;
      p.angle += (moveAngle - p.angle) * 0.04;

      // DRAW CAPSULE DASH / VOXEL STAR
      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.angle);
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;

      const halfLen = p.length / 2;
      const halfThick = p.thickness / 2;
      this.ctx.beginPath();
      if (this.ctx.roundRect) {
        this.ctx.roundRect(-halfLen, -halfThick, p.length, p.thickness, halfThick);
      } else {
        this.ctx.arc(0, 0, halfThick, 0, Math.PI * 2);
      }
      this.ctx.fill();
      this.ctx.restore();
    }

    requestAnimationFrame(() => this.animate());
  }
}

window.PocketMCParticles = PocketMCParticles;
