/**
 * Simple in-memory invite-code management.
 * Codes persist for the lifetime of the serverless function.
 * For production with multiple instances, use a database or Redis.
 */

import crypto from 'crypto';

interface CodeMeta {
  created_at: string;
  label: string;
  uses: number;
}

// Persist the in-memory collections on globalThis to share state across
// separately bundled Next.js route handlers and prevent hot-reloading resets.
const globalWithCodes = globalThis as typeof globalThis & {
  _validCodes?: Set<string>;
  _codeMetadata?: Map<string, CodeMeta>;
};

if (!globalWithCodes._validCodes) {
  globalWithCodes._validCodes = new Set<string>();
}
if (!globalWithCodes._codeMetadata) {
  globalWithCodes._codeMetadata = new Map<string, CodeMeta>();
}

const _validCodes = globalWithCodes._validCodes;
const _codeMetadata = globalWithCodes._codeMetadata;

function generateCode(length: number = 12): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = crypto.randomBytes(length);
  let code = '';
  for (let i = 0; i < length; i++) {
    code += alphabet[bytes[i] % alphabet.length];
  }
  return code;
}

export function createCode(label: string = ''): { code: string; expires_at?: string } {
  let code = generateCode();
  while (_validCodes.has(code)) {
    code = generateCode();
  }
  _validCodes.add(code);
  _codeMetadata.set(code, {
    created_at: new Date().toISOString(),
    label,
    uses: 0,
  });
  return { code };
}

export function revokeCode(code: string): boolean {
  const existed = _validCodes.has(code);
  _validCodes.delete(code);
  _codeMetadata.delete(code);
  return existed;
}

export function validateCode(code: string): boolean {
  const valid = _validCodes.has(code);
  if (valid) {
    const meta = _codeMetadata.get(code);
    if (meta) {
      meta.uses += 1;
      _codeMetadata.set(code, meta);
    }
  }
  return valid;
}

export function listCodes(): Record<string, CodeMeta> {
  const result: Record<string, CodeMeta> = {};
  for (const code of _validCodes) {
    result[code] = _codeMetadata.get(code) || { created_at: '', label: '', uses: 0 };
  }
  return result;
}
