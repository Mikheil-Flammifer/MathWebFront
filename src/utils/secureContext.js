// Warns when a production build is opened over plain HTTP.
// Real enforcement belongs on the server (redirect, HSTS, Secure cookies).
const LOCAL_HOSTS = ['localhost', '127.0.0.1', '[::1]']

export function checkSecureContext() {
  if (!import.meta.env.PROD) {
    return
  }
  if (window.location.protocol === 'https:') {
    return
  }
  if (LOCAL_HOSTS.includes(window.location.hostname)) {
    return
  }

  console.error(
    'MathWeb is running over HTTP. Login cookies are Secure and will not work. Use HTTPS.'
  )

  const banner = document.createElement('div')
  banner.setAttribute('role', 'alert')
  banner.style.cssText =
    'position:fixed;top:0;left:0;right:0;z-index:99999;padding:10px 16px;' +
    'background:#b91c1c;color:#fff;font:600 14px system-ui,sans-serif;text-align:center;'
  banner.textContent =
    'This connection is not secure (HTTP). Sign-in will not work. Please use the https:// address.'
  document.body.appendChild(banner)
}