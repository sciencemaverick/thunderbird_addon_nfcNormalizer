export const DEFAULT_SETTINGS = {
  autoNormalizeOnAttach: true,
  checkBeforeSend: true,
  cancelSendOnFailure: false,
  debugLogging: true,
};

export async function getSettings() {
  const stored = await browser.storage.local.get(DEFAULT_SETTINGS);
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
  };
}
