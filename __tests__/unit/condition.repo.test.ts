// SPDX-License-Identifier: Apache-2.0
import handleExecuteSqlStatement from '../../src/database.logic.service';
import { ConditionRepo } from '../../src/repositories/event_history/condition.repository';

jest.mock('../../src/database.logic.service', () => ({
  __esModule: true,
  default: jest.fn(),
}));

const dbCall = handleExecuteSqlStatement as jest.Mock;

type Row = Record<string, unknown>;
const ok = <T extends Row>(rows: T[], rowCount?: number) => ({
  rows,
  rowCount: rowCount ?? rows.length,
});

describe('ConditionRepo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('returns mapped data + total when rows exist', async () => {
      dbCall.mockResolvedValue(ok([{ condition: { id: 'C1' } }, { condition: { id: 'C2' } }], 9));

      const res = await ConditionRepo.list({
        limit: 10,
        offset: 0,
        sort: 'creDtTm',
        order: 'DESC',
      });

      expect(dbCall).toHaveBeenCalledTimes(1);
      expect(dbCall).toHaveBeenCalledWith(
        {
          text: expect.stringContaining(
            'SELECT condition FROM condition WHERE tenantId = $4 ORDER BY condition->>$3 DESC OFFSET $1 LIMIT $2',
          ),
          values: [0, 10, 'creDtTm'],
        },
        'event_history',
      );

      const sql = dbCall.mock.calls[0][0].text as string;
      expect(sql).toContain('ORDER BY condition->>$3 DESC');
      expect(sql).toContain('OFFSET $1 LIMIT $2');

      expect(res).toEqual({
        data: [{ id: 'C1' }, { id: 'C2' }],
        total: 9,
      });
    });

    it('uses default sort "creDtTm" when sort is undefined', async () => {
      dbCall.mockResolvedValue(ok([], 0));

      await ConditionRepo.list({
        limit: 5,
        offset: 15,
        sort: undefined,
        order: 'ASC',
      });

      const [[cfg, dbName]] = dbCall.mock.calls;
      expect(dbName).toBe('event_history');
      expect(cfg.values).toEqual([15, 5, 'creDtTm']); // default applied into $3
      expect(cfg.text).toContain('ORDER BY condition->>$3 ASC');
    });

    it('supports custom sort value passed as $3', async () => {
      dbCall.mockResolvedValue(ok([], 0));

      await ConditionRepo.list({
        limit: 3,
        offset: 6,
        sort: 'condId',
        order: 'DESC',
      });

      const [[cfg]] = dbCall.mock.calls;
      expect(cfg.values).toEqual([6, 3, 'condId']);
      expect(cfg.text).toContain('ORDER BY condition->>$3 DESC');
    });

    it('returns empty data when no rows', async () => {
      dbCall.mockResolvedValue(ok([], 0));

      const res = await ConditionRepo.list({
        limit: 10,
        offset: 0,
        sort: 'creDtTm',
        order: 'ASC',
      });

      expect(res).toEqual({ data: [], total: 0 });
    });
  });

  describe('get', () => {
    it('returns condition when found', async () => {
      dbCall.mockResolvedValue(ok([{ condition: { id: 'C1', x: 1 } }]));

      const res = await ConditionRepo.get({ id: 'C1', tenantId: 'tenantA' });

      expect(dbCall).toHaveBeenCalledWith(
        {
          text: 'SELECT condition FROM condition WHERE id = $1 AND tenantid = $2;',
          values: ['C1', 'tenantA'],
        },
        'event_history',
      );
      expect(res).toEqual({ id: 'C1', x: 1 });
    });

    it('returns null when not found', async () => {
      dbCall.mockResolvedValue(ok([]));

      const res = await ConditionRepo.get({ id: 'missing', tenantId: 'tenantA' });
      expect(res).toBeNull();
    });
  });

  describe('create', () => {
    it('inserts and returns condition', async () => {
      dbCall.mockResolvedValue(ok([{ condition: { id: 'NEW' } }]));

      const payload = { id: 'NEW' } as any;
      const res = await ConditionRepo.create(payload);

      expect(dbCall).toHaveBeenCalledWith(
        {
          text: 'INSERT INTO condition (condition) VALUES ($1) RETURNING condition;',
          values: [payload],
        },
        'event_history',
      );
      expect(res).toEqual({ id: 'NEW' });
    });
  });

  describe('update', () => {
    it('returns updated condition when rowCount > 0', async () => {
      dbCall.mockResolvedValue({ rows: [{ condition: { id: 'UPD' } }], rowCount: 1 });

      const res = await ConditionRepo.update({ id: 'OLD', tenantId: 'tenantA' }, { id: 'UPD' } as any);

      expect(dbCall).toHaveBeenCalledWith(
        {
          text: 'UPDATE condition SET condition = $1 WHERE id = $2 AND tenantid = $3 RETURNING condition;',
          values: [{ id: 'UPD' }, 'OLD', 'tenantA'],
        },
        'event_history',
      );
      expect(res).toEqual({ id: 'UPD' });
    });

    it('returns null when rowCount = 0', async () => {
      dbCall.mockResolvedValue({ rows: [], rowCount: 0 });

      const res = await ConditionRepo.update({ id: 'OLD', tenantId: 'tenantA' }, { id: 'UPD' } as any);
      expect(res).toBeNull();
    });
  });

  describe('remove', () => {
    it('returns true when a row was deleted', async () => {
      dbCall.mockResolvedValue({ rows: [], rowCount: 1 });

      const res = await ConditionRepo.remove({ id: 'C1', tenantId: 'tenantA' });

      expect(dbCall).toHaveBeenCalledWith(
        {
          text: 'DELETE FROM condition WHERE id = $1 AND tenantid = $2;',
          values: ['C1', 'tenantA'],
        },
        'event_history',
      );
      expect(res).toBe(true);
    });

    it('returns false when nothing was deleted', async () => {
      dbCall.mockResolvedValue({ rows: [], rowCount: 0 });

      const res = await ConditionRepo.remove({ id: 'C1', tenantId: 'tenantA' });
      expect(res).toBe(false);
    });
  });
});
