/* eslint-disable @typescript-eslint/no-explicit-any */
const RUNTIME_ENV_KEY = '__runtime_env__';

function readFromGlobal(key: string): string | undefined {
  if (typeof globalThis === 'undefined') {
    return undefined;
  }

  const globalValue = (globalThis as any)[key];
  if (typeof globalValue === 'string' && globalValue.length > 0) {
    return globalValue;
  }

  const runtimeBucket = (globalThis as any)[RUNTIME_ENV_KEY];
  if (runtimeBucket && typeof runtimeBucket === 'object' && key in runtimeBucket) {
    const value = runtimeBucket[key];
    if (typeof value === 'string' && value.length > 0) {
      return value;
    }
  }

  return undefined;
}

function readFromProcess(key: string): string | undefined {
  const env = (globalThis as { process?: { env?: Record<string, unknown> } }).process?.env;
  const value = env?.[key];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

export function readRuntimeEnvironment(key: string, fallback = ''): string {
  return readFromGlobal(key) ?? readFromProcess(key) ?? fallback;
}
