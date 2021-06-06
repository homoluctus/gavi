import chalk from 'chalk';
import { LogLevel } from './interfaces';

export const ERROR: LogLevel = 0;
export const WARN: LogLevel = 1;
export const INFO: LogLevel = 2;
export const DEBUG: LogLevel = 3;

export const nameToNum: { [name: string]: LogLevel } = {
  ERROR,
  WARN,
  INFO,
  DEBUG
};
const numToName = ['ERROR', 'WARN', 'INFO', 'DEBUG'];
const numToColor = ['red', 'yellow', 'green', 'blue'];

class Logger {
  level: LogLevel;
  silent: boolean;
  newline: string = '\n';

  constructor(level: LogLevel = INFO, silent: boolean = false) {
    this.level = level;
    this.silent = silent;
  }

  private isEnabled(level: LogLevel): boolean {
    return !this.silent && this.level >= level;
  }

  private log(level: LogLevel, message: string): void {
    const stream = process[level < INFO ? 'stderr' : 'stdout'];
    const prefix = chalk`{${[numToColor[level]]} ${numToName[level]}}`;
    message = `${prefix} ${message}${this.newline}`;
    stream.write(message);
  }

  debug(message: string): void {
    if (this.isEnabled(DEBUG)) {
      this.log(DEBUG, message);
    }
  }

  info(message: string): void {
    if (this.isEnabled(INFO)) {
      this.log(INFO, message);
    }
  }

  warn(message: string): void {
    if (this.isEnabled(WARN)) {
      this.log(WARN, message);
    }
  }

  error(message: string): void {
    if (this.isEnabled(ERROR)) {
      this.log(ERROR, message);
    }
  }
}

export const logger = new Logger();
