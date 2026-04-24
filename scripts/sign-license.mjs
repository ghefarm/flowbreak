#!/usr/bin/env node
// Mint a signed FlowBreak Pro license key.
// Usage: node scripts/sign-license.mjs <buyer-email>
// The private key path defaults to ~/.flowbreak-keys/license-private.pem; override with
// LICENSE_PRIVATE_KEY env var.

import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import path from 'node:path'
import { sign, createPrivateKey } from 'node:crypto'

const PRODUCT_ID = 'flowbreak-pro'
const LICENSE_VERSION = 1

const email = process.argv[2]
if (!email || !email.includes('@')) {
  console.error('Usage: node scripts/sign-license.mjs <buyer-email>')
  process.exit(1)
}

const keyPath = process.env.LICENSE_PRIVATE_KEY
  ?? path.join(homedir(), '.flowbreak-keys', 'license-private.pem')

let privateKey
try {
  privateKey = createPrivateKey(readFileSync(keyPath))
} catch (err) {
  console.error(`Could not load private key at ${keyPath}`)
  console.error(err.message)
  process.exit(1)
}

const payload = {
  email: email.trim().toLowerCase(),
  issued: Date.now(),
  product: PRODUCT_ID,
  version: LICENSE_VERSION,
}

const payloadBytes = Buffer.from(JSON.stringify(payload), 'utf8')
const payloadB64 = payloadBytes.toString('base64url')
const sigB64 = sign(null, Buffer.from(payloadB64, 'utf8'), privateKey).toString('base64url')

console.log(`${payloadB64}.${sigB64}`)
