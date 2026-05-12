export function textElement(tagName: string, className: string, text: string) {
  const element = document.createElement(tagName);

  element.className = className;
  element.textContent = text;

  return element;
}
