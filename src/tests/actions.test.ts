import { describe, it, expect } from 'vitest';
import { runAction } from '../worker/actions';

describe('Action Tests', () => {
  describe('enrich', () => {
    it('should add processed_at and pipeline_id to payload', () => {
      const payload = { amount: 100, userId: '123' } as Record<string, unknown>;
      const config = {};
      const pipelineId = 'test-pipe-1';
      const result = runAction('enrich', payload, config, pipelineId);

      expect(result.status).toBe('done');
      expect(result.result.processed_at).toBeDefined();
      expect(result.result.pipeline_id).toBe(pipelineId);
      expect(result.result.amount).toBe(100);
      expect(result.result.userId).toBe('123');
    });

    it('should keep original payload fields unchanged', () => {
      const payload = { amount: 100, userId: '123' } as Record<string, unknown>;
      const config = {};
      const pipelineId = 'test-pipe-1';
      const result = runAction('enrich', payload, config, pipelineId);

      expect(result.result.amount).toBe(100);
      expect(result.result.userId).toBe('123');
    });

    it('should merge extra fields from config', () => {
      const payload = { amount: 100 } as Record<string, unknown>;
      const config = { extra: { source: 'webhook', priority: 'high' } };
      const pipelineId = 'test-pipe-1';
      const result = runAction('enrich', payload, config, pipelineId);

      expect(result.result.source).toBe('webhook');
      expect(result.result.priority).toBe('high');
    });
  });

  describe('filter', () => {
    it('should return status done when condition met (gt)', () => {
      const payload = { amount: 150 } as Record<string, unknown>;
      const config = { field: 'amount', operator: 'gt', value: 100 };
      const result = runAction('filter', payload, config, 'test-pipe');

      expect(result.status).toBe('done');
    });

    it('should return status skipped when condition not met (gt)', () => {
      const payload = { amount: 50 } as Record<string, unknown>;
      const config = { field: 'amount', operator: 'gt', value: 100 };
      const result = runAction('filter', payload, config, 'test-pipe');

      expect(result.status).toBe('skipped');
    });

    it('eq operator works', () => {
      const payload = { status: 'active' } as Record<string, unknown>;
      const config = { field: 'status', operator: 'eq', value: 'active' };
      const result = runAction('filter', payload, config, 'test-pipe');

      expect(result.status).toBe('done');
    });

    it('lt operator works', () => {
      const payload = { amount: 90 } as Record<string, unknown>;
      const config = { field: 'amount', operator: 'lt', value: 100 };
      const result = runAction('filter', payload, config, 'test-pipe');

      expect(result.status).toBe('done');
    });

    it('contains operator works (string)', () => {
      const payload = { email: 'user@example.com' } as Record<string, unknown>;
      const config = { field: 'email', operator: 'contains', value: 'example' };
      const result = runAction('filter', payload, config, 'test-pipe');

      expect(result.status).toBe('done');
    });

    it('contains operator works (array)', () => {
      const payload = { tags: ['webhook', 'pipeline'] } as Record<
        string,
        unknown
      >;
      const config = { field: 'tags', operator: 'contains', value: 'webhook' };
      const result = runAction('filter', payload, config, 'test-pipe');

      expect(result.status).toBe('done');
    });
  });

  describe('transform', () => {
    it('should remap keys according to mapping config', () => {
      const payload = {
        old_amount: 100,
        old_user: '123',
        unused: 'ignore',
      } as Record<string, unknown>;
      const config = { mapping: { amount: 'old_amount', user: 'old_user' } };
      const result = runAction('transform', payload, config, 'test-pipe');

      expect(result.status).toBe('done');
      expect(result.result).toEqual({ amount: 100, user: '123' });
    });

    it('should only include mapped keys in result', () => {
      const payload = { old_amount: 100, extra: 'ignored' } as Record<
        string,
        unknown
      >;
      const config = { mapping: { amount: 'old_amount' } };
      const result = runAction('transform', payload, config, 'test-pipe');

      expect(result.status).toBe('done');
      expect(result.result).toEqual({ amount: 100 });
      expect('extra' in result.result).toBe(false);
    });

    it('should return payload unchanged if no mapping', () => {
      const payload = { amount: 100 } as Record<string, unknown>;
      const config = {};
      const result = runAction('transform', payload, config, 'test-pipe');

      expect(result.status).toBe('done');
      expect(result.result).toEqual(payload);
    });
  });
});
