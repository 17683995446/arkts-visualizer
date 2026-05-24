// 📝 专业调试日志系统
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  metadata?: any;
}

class DebugLogger {
  private logs: LogEntry[] = [];
  private maxLogs: number = 500;
  private enabled: boolean = true;
  private enableConsole: boolean = true;
  
  constructor() {
    console.log('📝 [DebugLogger] Initialized');
  }
  
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    console.log(`📝 [DebugLogger] ${enabled ? 'Enabled' : 'Disabled'}`);
  }
  
  setConsoleOutput(enabled: boolean) {
    this.enableConsole = enabled;
  }
  
  private formatTimestamp(): string {
    return new Date().toISOString();
  }
  
  private getCallerInfo(): string {
    try {
      const stack = new Error().stack;
      if (stack) {
        const lines = stack.split('\n');
        if (lines[3]) {
          const match = lines[3].match(/at (.*?) \(/);
          if (match) return match[1];
        }
      }
    } catch (e) {
      // Ignore
    }
    return 'unknown';
  }
  
  private addLog(level: LogLevel, message: string, metadata?: any) {
    if (!this.enabled) return;
    
    const logEntry: LogEntry = {
      timestamp: this.formatTimestamp(),
      level,
      message,
      metadata,
    };
    
    this.logs.push(logEntry);
    
    // 保持日志列表在合理大小
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
    
    if (this.enableConsole) {
      const emoji = this.getLevelEmoji(level);
      const caller = this.getCallerInfo();
      console.log(`${emoji} [${level.toUpperCase()}] [${caller}] ${message}`);
      if (metadata) {
        console.log('  📊 Metadata:', metadata);
      }
    }
  }
  
  private getLevelEmoji(level: LogLevel): string {
    switch (level) {
      case 'debug': return '🔍';
      case 'info': return 'ℹ️';
      case 'warn': return '⚠️';
      case 'error': return '❌';
      default: return '📝';
    }
  }
  
  debug(message: string, metadata?: any) {
    this.addLog('debug', message, metadata);
  }
  
  info(message: string, metadata?: any) {
    this.addLog('info', message, metadata);
  }
  
  warn(message: string, metadata?: any) {
    this.addLog('warn', message, metadata);
  }
  
  error(message: string, metadata?: any) {
    this.addLog('error', message, metadata);
  }
  
  getLogs(): LogEntry[] {
    return [...this.logs];
  }
  
  getRecentLogs(count: number = 10): LogEntry[] {
    return this.logs.slice(-count);
  }
  
  clearLogs() {
    this.logs = [];
    this.info('Logs cleared');
  }
}

// 创建单例
export const logger = new DebugLogger();
export default logger;