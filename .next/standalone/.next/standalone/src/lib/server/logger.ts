type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_RANK: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function minLevel(): LogLevel {
  const configured = process.env.LOG_LEVEL?.toLowerCase();
  if (configured === "debug" || configured === "info" || configured === "warn" || configured === "error") {
    return configured;
  }
  return process.env.NODE_ENV === "production" ? "warn" : "debug";
}

const threshold = LEVEL_RANK[minLevel()];

function write(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  if (LEVEL_RANK[level] < threshold) return;

  const entry = {
    ts: new Date().toISOString(),
    level,
    msg: message,
    ...(meta && Object.keys(meta).length ? { meta } : {}),
  };

  const line = JSON.stringify(entry);

  if (level === "error") {
    console.error(line);
    return;
  }
  if (level === "warn") {
    console.warn(line);
    return;
  }
  console.log(line);
}

export const logger = {
  debug: (message: string, meta?: Record<string, unknown>) => write("debug", message, meta),
  info: (message: string, meta?: Record<string, unknown>) => write("info", message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => write("warn", message, meta),
  error: (message: string, meta?: Record<string, unknown>) => write("error", message, meta),
};
