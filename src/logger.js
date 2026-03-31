const MAX_LOG_ENTRIES = 500;
const logBuffer = [];

function pushLogEntry(level, message, details) {
  logBuffer.push({
    timestamp: new Date().toISOString(),
    level,
    message,
    details,
  });

  if (logBuffer.length > MAX_LOG_ENTRIES) {
    logBuffer.shift();
  }
}

export function getLogSnapshot() {
  return logBuffer.slice();
}

export function clearLogBuffer() {
  logBuffer.length = 0;
}

export function log(level, message, details = undefined) {
  pushLogEntry(level, message, details);

  if (level === "debug" || level === "info") {
    if (details === undefined) {
      console.log(`[nfc-normalizer] ${message}`);
      return;
    }

    console.log(`[nfc-normalizer] ${message}`, details);
    return;
  }

  if (details === undefined) {
    console.error(`[nfc-normalizer] ${message}`);
    return;
  }

  console.error(`[nfc-normalizer] ${message}`, details);
}
