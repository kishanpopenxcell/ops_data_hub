/**
 * Inlined into <head> and run before hydration to avoid a flash of the wrong
 * theme. Reads a stored preference, falls back to OS preference, and stamps
 * data-theme on <html> -- the same attribute the CSS tokens in globals.css
 * key off (:root[data-theme="dark"] / :root[data-theme="light"]).
 */
export const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    var theme = stored === 'dark' || stored === 'light'
      ? stored
      : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {}
})();
`;
