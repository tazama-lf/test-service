// SPDX-License-Identifier: Apache-2.0
import handlePostExecuteSqlStatement from '../../src/database.logic.service';
import { EvaluationRepo } from '../../src/repositories/evaluation/evaluation.repository';

jest.mock('../../src/database.logic.service', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const dbCall = handlePostExecuteSqlStatement as jest.Mock;

type AnyRow = Record<string, unknown>;
const ok = <T extends AnyRow>(rows: T[], rowCount?: number) => ({
  rows,
  rowCount: rowCount ?? rows.length,
});

describe('EvaluationRepo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('returns mapped data + total when rows exist', async () => {
      dbCall.mockResolvedValue(ok([{ evaluation: { id: '1', foo: 'bar' } }], 7));

      const result = await EvaluationRepo.list({
        limit: 10,
        offset: 0,
        sort: 'timestamp',
        order: 'DESC',
      });

      expect(dbCall).toHaveBeenCalledTimes(1);
      expect(dbCall).toHaveBeenCalledWith(
        {
          text: expect.stringContaining(
            'SELECT evaluation FROM evaluation WHERE tenantId = $4 ORDER BY evaluation->>$3 DESC OFFSET $1 LIMIT $2;',
          ),
          values: [0, 10, 'timestamp'],
        },
        'evaluation',
      );

      expect(dbCall.mock.calls[0][0].text).toContain('ORDER BY evaluation->>$3 DESC');

      expect(result).toEqual({
        data: [{ id: '1', foo: 'bar' }],
        total: 7,
      });
    });

    it('uses default sort "timestamp" when sort is undefined', async () => {
      dbCall.mockResolvedValue(ok([], 0));

      await EvaluationRepo.list({
        limit: 5,
        offset: 15,
        sort: undefined,
        order: 'ASC',
      });

      const [[cfg]] = dbCall.mock.calls;
      expect(cfg.values).toEqual([15, 5, 'timestamp']);
      expect(cfg.text).toContain('ORDER BY evaluation->>$3 ASC');
    });

    it('returns empty data when no rows', async () => {
      dbCall.mockResolvedValue(ok([], 0));

      const result = await EvaluationRepo.list({
        limit: 10,
        offset: 0,
        sort: 'timestamp',
        order: 'ASC',
      });

      expect(result).toEqual({ data: [], total: 0 });
    });
  });

  describe('get', () => {
    it('returns evaluation when found', async () => {
      dbCall.mockResolvedValue(ok([{ evaluation: { id: 'abc', x: 1 } }]));

      const res = await EvaluationRepo.get('abc');

      expect(dbCall).toHaveBeenCalledWith(
        {
          text: 'SELECT evaluation FROM evaluation WHERE messageid = $1;',
          values: ['abc'],
        },
        'evaluation',
      );
      expect(res).toEqual({ id: 'abc', x: 1 });
    });

    it('returns null when not found', async () => {
      dbCall.mockResolvedValue(ok([]));

      const res = await EvaluationRepo.get('nope');
      expect(res).toBeNull();
    });
  });

  describe('create', () => {
    it('inserts and returns evaluation', async () => {
      dbCall.mockResolvedValue(ok([{ evaluation: { id: 'new' } }]));

      const payload = { id: 'new', a: 1 } as any;
      const res = await EvaluationRepo.create(payload);

      expect(dbCall).toHaveBeenCalledWith(
        {
          text: 'INSERT INTO evaluation (evaluation) VALUES ($1) RETURNING evaluation;',
          values: [payload],
        },
        'evaluation',
      );
      expect(res).toEqual({ id: 'new' });
    });
  });

  describe('update', () => {
    it('returns updated evaluation when rowCount > 0', async () => {
      dbCall.mockResolvedValue({ rows: [{ evaluation: { id: 'u1' } }], rowCount: 1 });

      const res = await EvaluationRepo.update('msg-1', { id: 'u1' } as any);

      expect(dbCall).toHaveBeenCalledWith(
        {
          text: 'UPDATE evaluation SET evaluation = $1 WHERE messageid = $2 RETURNING evaluation;',
          values: [{ id: 'u1' }, 'msg-1'],
        },
        'evaluation',
      );
      expect(res).toEqual({ id: 'u1' });
    });

    it('returns null when rowCount = 0', async () => {
      dbCall.mockResolvedValue({ rows: [], rowCount: 0 });

      const res = await EvaluationRepo.update('msg-1', { id: 'u1' } as any);
      expect(res).toBeNull();
    });
  });

  describe('remove', () => {
    it('returns true when a row was deleted', async () => {
      dbCall.mockResolvedValue({ rows: [], rowCount: 1 });

      const res = await EvaluationRepo.remove('msg-1');

      expect(dbCall).toHaveBeenCalledWith(
        {
          text: 'DELETE FROM evaluation WHERE messageid = $1;',
          values: ['msg-1'],
        },
        'evaluation',
      );
      expect(res).toBe(true);
    });

    it('returns false when no rows were deleted', async () => {
      dbCall.mockResolvedValue({ rows: [], rowCount: 0 });

      const res = await EvaluationRepo.remove('msg-1');
      expect(res).toBe(false);
    });
  });
});
