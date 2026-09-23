import { DEFAULTS } from '../constants';

const COOKIE_NAME = 'photoflow-theme';
const COOKIE_MAX_AGE = 31536000;

export function getThemeCookie() {
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=(dark|light)`));
  return match?.[1] || DEFAULTS.theme;
}

export function setThemeCookie(theme) {
  document.cookie = `${COOKIE_NAME}=${theme}; Max-Age=${COOKIE_MAX_AGE}; Path=/; SameSite=Lax`;
}

export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}

export function toggleTheme(theme) {
  return theme === 'dark' ? 'light' : 'dark';
}
