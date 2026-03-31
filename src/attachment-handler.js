import { log } from "./logger.js";
import { describeName, needsNormalization, normalizeName } from "./normalize.js";

const processedAttachmentNames = new Map();

function getCacheKey(tabId, attachmentId) {
  return `${tabId}:${attachmentId}`;
}

function rememberProcessedName(tabId, attachmentId, name) {
  processedAttachmentNames.set(getCacheKey(tabId, attachmentId), name);
}

function getRememberedName(tabId, attachmentId) {
  return processedAttachmentNames.get(getCacheKey(tabId, attachmentId));
}

export function forgetProcessedName(tabId, attachmentId) {
  processedAttachmentNames.delete(getCacheKey(tabId, attachmentId));
}

export async function normalizeAttachment(tabId, attachment, reason) {
  const originalName = attachment?.name || "";
  const normalizedName = normalizeName(originalName);
  const cacheKey = getCacheKey(tabId, attachment.id);
  const rememberedName = getRememberedName(tabId, attachment.id);

  if (!originalName) {
    return { changed: false, skipped: "empty-name" };
  }

  log("debug", "Attachment normalization check started.", {
    reason,
    cacheKey,
    attachmentId: attachment.id,
    original: describeName(originalName),
    rememberedName,
  });

  if (rememberedName === originalName && !needsNormalization(originalName)) {
    return { changed: false, skipped: "already-normalized-cache-hit" };
  }

  if (originalName === normalizedName) {
    rememberProcessedName(tabId, attachment.id, originalName);
    return {
      changed: false,
      skipped: "already-normalized",
      original: describeName(originalName),
    };
  }

  log("info", "Normalizing attachment name.", {
    reason,
    cacheKey,
    attachmentId: attachment.id,
    original: describeName(originalName),
    normalized: describeName(normalizedName),
  });

  await browser.compose.updateAttachment(tabId, attachment.id, {
    name: normalizedName,
  });

  rememberProcessedName(tabId, attachment.id, normalizedName);

  return {
    changed: true,
    original: describeName(originalName),
    normalized: describeName(normalizedName),
  };
}
