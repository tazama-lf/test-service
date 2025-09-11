// SPDX-License-Identifier: Apache-2.0
import handleExecuteSqlStatement from '../../src/database.logic.service';
import { EntityRepo } from '../../src/repositories/event_history/entity.repository';

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

describe('EntityRepo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('returns mapped data + total when rows exist', async () => {
      const rows = [
        { id: 'E1', creDtTm: '2025-01-01T00:00:00Z' },
        { id: 'E2', creDtTm: '2025-01-02T00:00:00Z' },
      ];
      dbCall.mockResolvedValue(ok(rows, 42));

      const res = await EntityRepo.list({
        limit: 10,
        offset: 0,
        sort: 'creDtTm',
        order: 'DESC',
      });

      expect(dbCall).toHaveBeenCalledTimes(1);
      expect(dbCall).toHaveBeenCalledWith(
        {
          text: expect.stringContaining('SELECT id, credttm as "creDtTm" FROM entity ORDER BY'),
          values: [0, 10],
        },
        'event_history',
      );

      const sql = dbCall.mock.calls[0][0].text as string;
      expect(sql).toContain('ORDER BY creDtTm DESC');
      expect(sql).toContain('OFFSET $1 LIMIT $2');

      expect(res).toEqual({
        data: rows,
        total: 42,
      });
    });

    it('uses default sort "creDtTm" when sort is undefined', async () => {
      dbCall.mockResolvedValue(ok([], 0));

      await EntityRepo.list({
        limit: 5,
        offset: 15,
        sort: undefined,
        order: 'ASC',
      });

      const [[cfg, dbName]] = dbCall.mock.calls;
      expect(dbName).toBe('event_history');
      expect(cfg.values).toEqual([15, 5]);
      expect(cfg.text).toContain('ORDER BY creDtTm ASC');
    });

    it('supports custom sort column', async () => {
      dbCall.mockResolvedValue(ok([], 0));

      await EntityRepo.list({
        limit: 3,
        offset: 9,
        sort: 'id',
        order: 'DESC',
      });

      const [[cfg]] = dbCall.mock.calls;
      expect(cfg.text).toContain('ORDER BY id DESC');
      expect(cfg.values).toEqual([9, 3]);
    });

    it('returns empty data when no rows', async () => {
      dbCall.mockResolvedValue(ok([], 0));

      const res = await EntityRepo.list({
        limit: 10,
        offset: 0,
        sort: 'creDtTm',
        order: 'ASC',
      });

      expect(res).toEqual({ data: [], total: 0 });
    });
  });

  describe('get', () => {
    it('returns entity when found', async () => {
      dbCall.mockResolvedValue(ok([{ id: 'E1', creDtTm: 'T' }]));

      const res = await EntityRepo.get('E1');

      expect(dbCall).toHaveBeenCalledWith(
        {
          text: 'SELECT id, credttm as "creDtTm" FROM entity WHERE id = $1;',
          values: ['E1'],
        },
        'event_history',
      );
      expect(res).toEqual({ id: 'E1', creDtTm: 'T' });
    });

    it('returns null when not found', async () => {
      dbCall.mockResolvedValue(ok([]));

      const res = await EntityRepo.get('missing');
      expect(res).toBeNull();
    });
  });

  describe('create', () => {
    it('inserts and returns entity', async () => {
      // Note: repo expects { entity: Entity } in rows for create
      dbCall.mockResolvedValue(ok([{ entity: { id: 'NEW', creDtTm: 'T0' } }]));

      const payload = { id: 'NEW', creDtTm: 'T0' } as any;
      const res = await EntityRepo.create(payload);

      expect(dbCall).toHaveBeenCalledWith(
        {
          text: 'INSERT INTO entity (id, creDtTm) VALUES ($1,$2) RETURNING id, credttm as "creDtTm";',
          values: ['NEW', 'T0'],
        },
        'event_history',
      );
      expect(res).toEqual({ id: 'NEW', creDtTm: 'T0' });
    });
  });

  describe('update', () => {
    it('returns updated entity when rowCount > 0', async () => {
      dbCall.mockResolvedValue({
        rows: [{ id: 'U', creDtTm: 'TU' }],
        rowCount: 1,
      });

      const res = await EntityRepo.update('OLD', { id: 'U', creDtTm: 'TU' } as any);

      expect(dbCall).toHaveBeenCalledWith(
        {
          text: 'UPDATE entity SET id = $1, creDtTm = $2 WHERE id = $3 RETURNING id, credttm AS "creDtTm";',
          values: ['U', 'TU', 'OLD'],
        },
        'event_history',
      );
      expect(res).toEqual({ id: 'U', creDtTm: 'TU' });
    });

    it('returns null when rowCount = 0', async () => {
      dbCall.mockResolvedValue({ rows: [], rowCount: 0 });

      const res = await EntityRepo.update('OLD', { id: 'U', creDtTm: 'TU' } as any);
      expect(res).toBeNull();
    });
  });

  describe('remove', () => {
    it('returns true when a row was deleted', async () => {
      dbCall.mockResolvedValue({ rows: [], rowCount: 1 });

      const res = await EntityRepo.remove('E1');

      expect(dbCall).toHaveBeenCalledWith(
        {
          text: 'DELETE FROM entity WHERE id = $1;',
          values: ['E1'],
        },
        'event_history',
      );
      expect(res).toBe(true);
    });

    it('returns false when nothing was deleted', async () => {
      dbCall.mockResolvedValue({ rows: [], rowCount: 0 });

      const res = await EntityRepo.remove('E1');
      expect(res).toBe(false);
    });
  });
});
