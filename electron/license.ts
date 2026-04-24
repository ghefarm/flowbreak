import { verify, createPublicKey } from 'node:crypto'

const PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEAfq1C7w8EZDjrReSRBhsBFMJGk2hlrUhwWTUY8DweWfw=
-----END PUBLIC KEY-----`

const PUBLIC_KEY = createPublicKey(PUBLIC_KEY_PEM)

export const PRODUCT_ID = 'flowbreak-pro'
export const LICENSE_VERSION = 1

export type LicensePayload = {
  email: string
  issued: number
  product: string
  version: number
}

export type LicenseRecord = {
  key: string
  email: string
  activatedAt: number
}

function b64urlDecode(s: string): Buffer {
  return Buffer.from(s, 'base64url')
}

export function verifyLicenseKey(key: string): LicensePayload | null {
  const parts = key.trim().split('.')
  if (parts.length !== 2) return null
  const [payloadB64, sigB64] = parts
  let sig: Buffer
  try {
    sig = b64urlDecode(sigB64)
  } catch {
    return null
  }
  const payloadBytes = Buffer.from(payloadB64, 'utf8')
  let ok = false
  try {
    ok = verify(null, payloadBytes, PUBLIC_KEY, sig)
  } catch {
    return null
  }
  if (!ok) return null
  let payload: LicensePayload
  try {
    payload = JSON.parse(b64urlDecode(payloadB64).toString('utf8'))
  } catch {
    return null
  }
  if (payload.product !== PRODUCT_ID) return null
  if (payload.version !== LICENSE_VERSION) return null
  if (typeof payload.email !== 'string' || !payload.email) return null
  if (typeof payload.issued !== 'number') return null
  return payload
}

export function isLicenseRecordValid(record: LicenseRecord | null): boolean {
  if (!record) return false
  return verifyLicenseKey(record.key) !== null
}
