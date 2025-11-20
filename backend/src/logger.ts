import winston from "winston";

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
      const base = `${timestamp} [${level}] ${message}`;
      const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
      return stack ? `${base}\n${stack}${extra}` : `${base}${extra}`;
    })
  ),
  transports: [new winston.transports.Console()]
});


