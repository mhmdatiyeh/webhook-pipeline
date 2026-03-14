import { transform } from './transform';
import { filter } from './filter';
import { enrich } from './enrich';
import { JobStatus } from '../../types';

export function runAction(
  actionType: string,
  payload: Record<string, unknown>,
  actionConfig: Record<string, unknown>,
  pipelineId: string
): { status: JobStatus; result: Record<string, unknown> } {
  switch (actionType) {
    case 'transform': {
      const result = transform(payload, actionConfig);
      return { status: 'done', result };
    }
    case 'filter': {
      const { passed, result } = filter(payload, actionConfig);
      return {
        status: passed ? 'done' : 'skipped',
        result,
      };
    }
    case 'enrich': {
      const result = enrich(payload, actionConfig, pipelineId);
      return { status: 'done', result };
    }
    default:
      throw new Error(`Unknown action type: ${actionType}`);
  }
}
