export function isWebMcpEnabled(
  nodeEnv: string | undefined,
  configured: string | undefined,
): boolean {
  return nodeEnv === 'development' || configured === 'true';
}

export function isWebMcpDebugEnabled(
  nodeEnv: string | undefined,
  configured: string | undefined,
): boolean {
  return nodeEnv === 'development' || configured === 'true';
}
