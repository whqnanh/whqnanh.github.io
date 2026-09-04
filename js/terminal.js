/**
 * POCKETMC // MINECRAFT SPIGOT/PAPER SERVER TERMINAL
 * Interactive Minecraft console emulator supporting Spigot/Paper commands.
 */

class AgentTerminal {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.history = this.container.querySelector('.terminal-history');
    this.input = this.container.querySelector('.terminal-input');
    this.badges = document.querySelectorAll('.cmd-badge');

    this.commandHistory = [];
    this.historyIndex = -1;

    this.init();
  }

  init() {
    if (!this.input) return;

    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const cmd = this.input.value.trim();
        if (cmd) {
          this.executeCommand(cmd);
          this.commandHistory.push(cmd);
          this.historyIndex = this.commandHistory.length;
          this.input.value = '';
        }
      } else if (e.key === 'ArrowUp') {
        if (this.historyIndex > 0) {
          this.historyIndex--;
          this.input.value = this.commandHistory[this.historyIndex];
        }
      } else if (e.key === 'ArrowDown') {
        if (this.historyIndex < this.commandHistory.length - 1) {
          this.historyIndex++;
          this.input.value = this.commandHistory[this.historyIndex];
        } else {
          this.historyIndex = this.commandHistory.length;
          this.input.value = '';
        }
      }
    });

    this.badges.forEach((badge) => {
      badge.addEventListener('click', () => {
        const cmd = badge.getAttribute('data-cmd') || badge.textContent.replace('$', '').trim();
        this.input.value = cmd;
        this.executeCommand(cmd);
        this.commandHistory.push(cmd);
        this.historyIndex = this.commandHistory.length;
        this.input.value = '';
      });
    });
  }

  printLine(text, className = '') {
    const line = document.createElement('div');
    line.className = `terminal-line ${className}`;
    line.innerHTML = text;
    this.history.appendChild(line);
    this.history.scrollTop = this.history.scrollHeight;
  }

  executeCommand(rawCmd) {
    const parts = rawCmd.trim().split(' ');
    const cmd = parts[0].toLowerCase();
    this.printLine(`<span class="term-prompt">&gt;</span> ${rawCmd}`);

    switch (cmd) {
      case 'help':
        this.printLine('PocketMC Minecraft Console Commands:', 'info');
        this.printLine('  <span class="info">pl</span> or <span class="info">plugins</span>   - List installed PocketMC plugins');
        this.printLine('  <span class="info">tps</span>                   - View server tick performance & memory');
        this.printLine('  <span class="info">levitate</span>            - Toggle floating server physics');
        this.printLine('  <span class="info">buy &lt;plugin&gt;</span>         - Simulate instant plugin license issuance');
        this.printLine('  <span class="info">reload</span>                - Hot-reload active plugin configurations');
        this.printLine('  <span class="info">clear</span>                 - Clear terminal screen');
        break;

      case 'pl':
      case 'plugins':
        this.printLine('Server Plugins (6):', 'dim');
        this.printLine('  <span class="success">AetherEconomy v2.4</span>, <span class="success">NexusPvP v3.1</span>, <span class="success">QuantumEnchants v1.9</span>,');
        this.printLine('  <span class="success">SpatialSpigot v4.0</span>, <span class="success">VoxelAntiCheat v5.2</span>, <span class="success">ObsidianKingdoms v2.0</span>');
        this.printLine('All plugins compiled against Paper/Purpur 1.20 - 1.21.x API.', 'info');
        break;

      case 'tps':
        this.printLine('[PAPER-SPIGOT ENGINE] Telemetry Report:', 'info');
        this.printLine('├─ TPS (1m, 5m, 15m): <span class="success">20.0, 20.0, 20.0 (Optimal 50.0ms tick)</span>');
        this.printLine('├─ Memory: <span class="success">1.82 GB / 8.00 GB (22% utilized)</span>');
        this.printLine('├─ Active Chunks: <span class="dim">1,420 chunks loaded async</span>');
        this.printLine('└─ Network Latency: <span class="success">0.12ms ping (Folia multi-thread)</span>');
        break;

      case 'levitate':
      case 'zero-weight':
        const app = window.PocketMCApp;
        if (app && typeof app.toggleLevitate === 'function') {
          app.toggleLevitate();
        }
        this.printLine('✨ [LEVITATE] Floating physics enabled! Plugins floating free.', 'info');
        break;

      case 'buy':
        const target = parts[1] || 'AetherEconomy';
        this.printLine(`[COMMERCE] Processing license for: <span class="info">${target}</span>...`, 'dim');
        setTimeout(() => this.printLine(`[KEY-GEN] Generating HMAC-SHA256 license key...`, 'dim'), 200);
        setTimeout(() => this.printLine(`[SUCCESS] License issued: <span class="success">BG-KEY-${Math.random().toString(36).substring(2, 9).toUpperCase()}</span>`, 'success'), 500);
        setTimeout(() => this.printLine(`Download ready in target server: <span class="info">plugins/${target}.jar</span>`, 'info'), 750);
        break;

      case 'reload':
        this.printLine('[SYS] Hot-reloading YAML configurations across 6 plugins...', 'dim');
        setTimeout(() => this.printLine('[OK] config.yml, messages.yml, rewards.yml reloaded in 4ms!', 'success'), 300);
        break;

      case 'clear':
        this.history.innerHTML = '';
        break;

      default:
        this.printLine(`Unknown command: '${rawCmd}'. Type '<span class="info">help</span>' for a list of server commands.`, 'dim');
        break;
    }
  }
}

window.AgentTerminal = AgentTerminal;
