import { renderToString } from 'react-dom/server';

export function renderToFullHtml(element) {
  const html = renderToString(element);
  return `<!doctype html>${html}`;
}
