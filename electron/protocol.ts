import { protocol, net, session } from 'electron'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

// Custom app scheme used in packaged builds instead of file://.
// A real, standard, secure origin (app://bundle) lets embedded content
// such as YouTube iframes load and play — file:// is a null origin and
// the YouTube player refuses to run there.
export const APP_SCHEME = 'app'
export const APP_HOST = 'bundle'
export const APP_ORIGIN = `${APP_SCHEME}://${APP_HOST}`

// Must run before app `ready`.
export function registerAppScheme(): void {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: APP_SCHEME,
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        corsEnabled: true,
      },
    },
  ])
}

// Must run after app `ready`. Serves files from the built renderer dir.
export function registerAppProtocol(rendererDist: string): void {
  protocol.handle(APP_SCHEME, (request) => {
    const { pathname } = new URL(request.url)
    const decoded = decodeURIComponent(pathname)
    const relative = decoded === '/' ? 'index.html' : decoded.replace(/^\/+/, '')

    // Resolve and confine to the renderer dir to block path traversal.
    const target = path.resolve(rendererDist, relative)
    const root = path.resolve(rendererDist)
    if (target !== root && !target.startsWith(root + path.sep)) {
      return new Response('Forbidden', { status: 403 })
    }

    return net.fetch(pathToFileURL(target).toString())
  })
}

export function appUrl(file: string): string {
  return `${APP_ORIGIN}/${file}`
}

// YouTube's embedded player needs a valid http(s) Referer to identify the
// embedder (enforced since ~Dec 2025). Our page runs on app:// (or file://),
// a non-web origin, so the player fails with "Error 153 / video player
// configuration". We present `localhost` as the referer — the exact origin
// the app uses in dev mode (http://localhost), where embeds have always
// worked. We do NOT forge youtube.com (the player then thinks it's embedded
// on YouTube itself → "video unavailable" / error 152) and we do NOT touch
// Origin (so the player's own CORS calls keep working).
// Must run after app `ready`.
const EMBED_REFERER = 'https://localhost/'

export function enableYoutubeEmbeds(): void {
  const filter = {
    urls: [
      '*://*.youtube.com/*',
      '*://*.youtube-nocookie.com/*',
      '*://*.googlevideo.com/*',
      '*://*.ytimg.com/*',
    ],
  }
  session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
    const headers = details.requestHeaders
    // Replace any non-http (app://, file://) referer with a valid web origin.
    if (!headers['Referer']?.startsWith('http')) {
      headers['Referer'] = EMBED_REFERER
    }
    callback({ requestHeaders: headers })
  })
}
