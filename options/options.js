import { DEFAULT_SETTINGS } from "../src/settings.js";

const form = document.querySelector("#settings-form");
const status = document.querySelector("#status");
const resetButton = document.querySelector("#reset-button");
const exportLogsButton = document.querySelector("#export-logs-button");
const clearLogsButton = document.querySelector("#clear-logs-button");

function setStatus(message) {
  status.textContent = message;
}

function readForm() {
  return {
    autoNormalizeOnAttach: document.querySelector("#autoNormalizeOnAttach").checked,
    checkBeforeSend: document.querySelector("#checkBeforeSend").checked,
    cancelSendOnFailure: document.querySelector("#cancelSendOnFailure").checked,
    debugLogging: document.querySelector("#debugLogging").checked,
  };
}

function writeForm(settings) {
  document.querySelector("#autoNormalizeOnAttach").checked = settings.autoNormalizeOnAttach;
  document.querySelector("#checkBeforeSend").checked = settings.checkBeforeSend;
  document.querySelector("#cancelSendOnFailure").checked = settings.cancelSendOnFailure;
  document.querySelector("#debugLogging").checked = settings.debugLogging;
}

async function loadSettings() {
  const stored = await browser.storage.local.get(DEFAULT_SETTINGS);
  writeForm({
    ...DEFAULT_SETTINGS,
    ...stored,
  });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const nextSettings = readForm();
  await browser.storage.local.set(nextSettings);
  setStatus("설정을 저장했습니다.");
});

resetButton.addEventListener("click", async () => {
  await browser.storage.local.set(DEFAULT_SETTINGS);
  writeForm(DEFAULT_SETTINGS);
  setStatus("기본 설정으로 되돌렸습니다.");
});

exportLogsButton.addEventListener("click", async () => {
  setStatus("진단 로그 파일을 준비하고 있습니다...");

  try {
    const response = await browser.runtime.sendMessage({ type: "export-logs" });
    if (!response?.ok) {
      throw new Error(response?.error || "Unknown export error");
    }

    const payload = response.payload;
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const objectUrl = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    await browser.downloads.download({
      url: objectUrl,
      filename: `thunderbird-nfc-normalizer-logs-${timestamp}.json`,
      saveAs: true,
      conflictAction: "uniquify",
    });

    URL.revokeObjectURL(objectUrl);
    setStatus("진단 로그 저장 창을 열었습니다.");
  } catch (error) {
    console.error("[nfc-normalizer] Failed to export log file.", error);
    setStatus("진단 로그 저장에 실패했습니다.");
  }
});

clearLogsButton.addEventListener("click", async () => {
  try {
    await browser.runtime.sendMessage({ type: "clear-logs" });
    setStatus("로그 버퍼를 비웠습니다.");
  } catch (error) {
    console.error("[nfc-normalizer] Failed to clear log buffer.", error);
    setStatus("로그 버퍼를 비우지 못했습니다.");
  }
});

loadSettings()
  .then(() => {
    setStatus("현재 설정을 불러왔습니다.");
  })
  .catch((error) => {
    console.error("[nfc-normalizer] Failed to load options.", error);
    setStatus("설정을 불러오지 못했습니다.");
  });
