import { PADDLE_ENV, PADDLE_TOKEN } from './paddleConfig'

const SCRIPT_URL = 'https://cdn.paddle.com/paddle/v2/paddle.js'

let paddlePromise = null
const listeners = new Set()

// Subscribe to Paddle checkout events (e.g. 'checkout.completed').
// Returns an unsubscribe function.
export function onPaddleEvent(handler) {
  listeners.add(handler)
  return () => listeners.delete(handler)
}

function loadScript() {
  return new Promise((resolve, reject) => {
    if (window.Paddle) {
      resolve(window.Paddle)
      return
    }
    const script = document.createElement('script')
    script.src = SCRIPT_URL
    script.async = true
    script.onload = () => {
      if (window.Paddle) {
        resolve(window.Paddle)
      } else {
        reject(new Error('Paddle.js loaded but window.Paddle is missing'))
      }
    }
    script.onerror = () => reject(new Error('Could not load Paddle.js'))
    document.head.appendChild(script)
  })
}

// Loads and initializes Paddle.js once. Safe to call many times.
export function getPaddle() {
  if (!paddlePromise) {
    paddlePromise = loadScript()
      .then((Paddle) => {
        if (!PADDLE_TOKEN) {
          throw new Error('Missing VITE_PADDLE_CLIENT_TOKEN')
        }
        if (PADDLE_ENV === 'sandbox') {
          Paddle.Environment.set('sandbox')
        }
        Paddle.Initialize({
          token: PADDLE_TOKEN,
          eventCallback: (event) => {
            listeners.forEach((handler) => {
              try {
                handler(event)
              } catch (e) {
                console.error('Paddle event handler failed', e)
              }
            })
          },
        })
        return Paddle
      })
      .catch((error) => {
        paddlePromise = null // allow a retry
        throw error
      })
  }
  return paddlePromise
}