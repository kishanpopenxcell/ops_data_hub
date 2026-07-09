/**
 * Inlined into <head> and run before hydration to avoid a flash of the wrong
 * theme. Reads a stored preference; new visitors with no stored preference
 * always start on light (the priority theme), regardless of OS/browser
 * color-scheme -- they can still switch to dark via the toggle, which is
 * then remembered. Stamps data-theme on <html>, the same attribute the CSS
 * tokens in globals.css key off (:root[data-theme="dark"] / [data-theme="light"]).
 */
export const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    var theme = stored === 'dark' || stored === 'light' ? stored : 'light';
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {}
})();
`;
