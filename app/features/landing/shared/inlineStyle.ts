import type { CSSProperties } from "react";

export function inlineStyle(value: string): CSSProperties {
  return value
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((style, declaration) => {
      const separator = declaration.indexOf(":");

      if (separator === -1) {
        return style;
      }

      const property = declaration.slice(0, separator).trim();
      const cssValue = declaration.slice(separator + 1).trim();
      const reactProperty = property.replace(/-([a-z])/g, (_, letter: string) =>
        letter.toUpperCase(),
      );

      style[reactProperty] = cssValue;
      return style;
    }, {}) as CSSProperties;
}
