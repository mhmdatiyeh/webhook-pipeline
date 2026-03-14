export function filter(
  payload: Record<string, unknown>,
  actionConfig: Record<string, unknown>
): { passed: boolean; result: Record<string, unknown> } {
  const field = actionConfig['field'] as string | undefined;
  const operator = actionConfig['operator'] as string | undefined;
  const value = actionConfig['value'];

  if (!field || !operator || value === undefined) {
    // Invalid config, default to passing
    return { passed: true, result: { ...payload } };
  }

  const payloadValue = payload[field];

  let passed = false;

  switch (operator) {
    case 'eq':
      passed = payloadValue === value;
      break;
    case 'gt':
      if (typeof payloadValue === 'number' && typeof value === 'number') {
        passed = payloadValue > value;
      }
      break;
    case 'lt':
      if (typeof payloadValue === 'number' && typeof value === 'number') {
        passed = payloadValue < value;
      }
      break;
    case 'contains':
      if (typeof payloadValue === 'string' && typeof value === 'string') {
        passed = payloadValue.includes(value);
      } else if (Array.isArray(payloadValue)) {
        passed = payloadValue.includes(value);
      }
      break;
    default:
      // Unknown operator
      passed = false;
  }

  return { passed, result: { ...payload } };
}
