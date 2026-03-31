import { forgetProcessedName, normalizeAttachment } from "./src/attachment-handler.js";
import { clearLogBuffer, getLogSnapshot, log } from "./src/logger.js";
import { describeName } from "./src/normalize.js";
import { getSettings } from "./src/settings.js";

const runtimeState = {
  isMacOS: false,
  initialized: false,
};

async function initialize() {
  if (runtimeState.initialized) {
    return;
  }

  try {
    const platformInfo = await browser.runtime.getPlatformInfo();
    runtimeState.isMacOS = platformInfo.os === "mac";
  } catch (error) {
    console.error("[nfc-normalizer] Failed to detect platform.", error);
    runtimeState.isMacOS = false;
  }

  runtimeState.initialized = true;
  log("info", "Extension initialized.", {
    isMacOS: runtimeState.isMacOS,
  });
}

async function handleAttachmentAdded(tab, attachment) {
  await initialize();
  const settings = await getSettings();

  if (!runtimeState.isMacOS) {
    log("info", "Skipping attachment normalization on non-macOS platform.");
    return;
  }

  if (!settings.autoNormalizeOnAttach) {
    log("debug", "Auto normalization on attach is disabled.");
    return;
  }

  try {
    const result = await normalizeAttachment(tab.id, attachment, "attachment-added");
    if (settings.debugLogging) {
      log("debug", "Attachment processed after add event.", result);
    }
  } catch (error) {
    log("error", "Failed to normalize attachment during add event.", {
      attachmentId: attachment?.id,
      attachmentName: attachment?.name,
      error: String(error),
    });
  }
}

async function handleBeforeSend(tab) {
  await initialize();
  const settings = await getSettings();

  if (!runtimeState.isMacOS) {
    return {};
  }

  if (!settings.checkBeforeSend) {
    log("debug", "Pre-send normalization is disabled.");
    return {};
  }

  try {
    const attachments = await browser.compose.listAttachments(tab.id);
    let failureCount = 0;

    if (settings.debugLogging) {
      log("debug", "Before-send attachment snapshot.", {
        tabId: tab.id,
        attachmentCount: attachments.length,
        attachments: attachments.map((attachment) => ({
          attachmentId: attachment.id,
          name: describeName(attachment.name || ""),
        })),
      });
    }

    for (const attachment of attachments) {
      try {
        const result = await normalizeAttachment(tab.id, attachment, "before-send");
        if (settings.debugLogging) {
          log("debug", "Attachment processed during before-send.", result);
        }
      } catch (error) {
        failureCount += 1;
        log("error", "Failed to normalize attachment during before-send.", {
          attachmentId: attachment?.id,
          attachmentName: attachment?.name,
          error: String(error),
        });
      }
    }

    if (failureCount > 0 && settings.cancelSendOnFailure) {
      return { cancel: true };
    }

    return {};
  } catch (error) {
    log("error", "Failed to inspect attachments during before-send.", {
      error: String(error),
    });

    if (settings.cancelSendOnFailure) {
      return { cancel: true };
    }

    return {};
  }
}

browser.compose.onAttachmentAdded.addListener((tab, attachment) => {
  return handleAttachmentAdded(tab, attachment);
});

browser.compose.onAttachmentRemoved.addListener((tab, attachmentId) => {
  forgetProcessedName(tab.id, attachmentId);
});

browser.compose.onBeforeSend.addListener((tab) => {
  return handleBeforeSend(tab);
});

browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!message || typeof message !== "object") {
    return false;
  }

  if (message.type === "export-logs") {
    Promise.resolve()
      .then(async () => {
        const settings = await getSettings();
        return {
          exportedAt: new Date().toISOString(),
          extensionVersion: browser.runtime.getManifest().version,
          platform: runtimeState.isMacOS ? "mac" : "other",
          settings,
          logs: getLogSnapshot(),
        };
      })
      .then((payload) => {
        sendResponse({ ok: true, payload });
      })
      .catch((error) => {
        log("error", "Failed to export logs.", {
          error: String(error),
        });
        sendResponse({
          ok: false,
          error: String(error),
        });
      });

    return true;
  }

  if (message.type === "clear-logs") {
    clearLogBuffer();
    log("info", "Log buffer cleared by user action.");
    sendResponse({ ok: true });
    return false;
  }

  return false;
});

initialize();
