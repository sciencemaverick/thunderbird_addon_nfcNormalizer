export function normalizeName(name) {
  return (name || "").normalize("NFC");
}

export function needsNormalization(name) {
  return Boolean(name) && name !== normalizeName(name);
}

export function getCodePoints(value) {
  return Array.from(value || "", (character) => {
    return `U+${character.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`;
  }).join(" ");
}

export function describeName(name) {
  return {
    value: name,
    isNfc: name === normalizeName(name),
    codePoints: getCodePoints(name),
  };
}
