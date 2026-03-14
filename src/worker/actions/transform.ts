export function transform(
  payload: Record<string, unknown>,
  actionConfig: Record<string, unknown>
): Record<string, unknown> {
  const mapping = actionConfig['mapping'] as Record<string, string> | undefined;

  if (!mapping || typeof mapping !== 'object') {
    // If no valid mapping config is provided, return payload unchanged
    return { ...payload };
  }

  const result: Record<string, unknown> = {};

  for (const [newKey, oldKey] of Object.entries(mapping)) {
    if (oldKey in payload) {
      result[newKey] = payload[oldKey];
    }
  }

  return result;
}
