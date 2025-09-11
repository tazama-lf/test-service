// SPDX-License-Identifier: Apache-2.0
import handleExecuteSqlStatement from '../../src/database.logic.service';
import { AccountRepo } from '../../src/repositories/event_history/account.repository';

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

describe('AccountRepo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('returns mapped data + total when rows exist', async () => {
      dbCall.mockResolvedValue(ok([{ id: 'A1' }, { id: 'A2' }], 7));

      const res = await AccountRepo.list({
        limit: 10,
        offset: 0,
        sort: 'id',
        order: 'DESC',
      });

      expect(dbCall).toHaveBeenCalledTimes(1);
      expect(dbCall).toHaveBeenCalledWith(
        {
          text: expect.stringContaining('SELECT id FROM account ORDER BY'),
          values: [0, 10],
        },
        'event_history',
      );

      const calledSql = dbCall.mock.calls[0][0].text as string;
      expect(calledSql).toContain('ORDER BY id DESC');
      expect(calledSql).toContain('OFFSET $1 LIMIT $2');

      expect(res).toEqual({
        data: ['A1', 'A2'],
        total: 7, // uses rowCount, not rows.length
      });
    });

    it('uses default sort "id" when sort is undefined', async () => {
      dbCall.mockResolvedValue(ok([], 0));

      await AccountRepo.list({
        limit: 5,
        offset: 15,
        sort: undefined,
        order: 'ASC',
      });

      const [[cfg, dbName]] = dbCall.mock.calls;
      expect(dbName).toBe('event_history');
      expect(cfg.values).toEqual([15, 5]);
      expect(cfg.text).toContain('ORDER BY id ASC');
    });

    it('supports custom sort column', async () => {
      dbCall.mockResolvedValue(ok([], 0));

      await AccountRepo.list({
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

      const res = await AccountRepo.list({
        limit: 10,
        offset: 0,
        sort: 'id',
        order: 'ASC',
      });

      expect(res).toEqual({ data: [], total: 0 });
    });
  });

  describe('get', () => {
    it('returns account when found', async () => {
      dbCall.mockResolvedValue(ok([{ id: 'A1' }]));

      const res = await AccountRepo.get('A1');

      expect(dbCall).toHaveBeenCalledWith(
        {
          text: 'SELECT id FROM account WHERE id = $1;',
          values: ['A1'],
        },
        'event_history',
      );
      expect(res).toBe('A1');
    });

    it('returns null when not found (including undefined id)', async () => {
      dbCall.mockResolvedValue(ok([]));

      const res1 = await AccountRepo.get('missing');
      expect(res1).toBeNull();

      dbCall.mockResolvedValue(ok([]));
      const res2 = await AccountRepo.get(undefined as any);
      expect(res2).toBeNull();
    });
  });

  describe('create', () => {
    it('inserts and returns account', async () => {
      dbCall.mockResolvedValue(ok([{ id: 'NEW' }]));

      const payload = 'NEW' as any;
      const res = await AccountRepo.create(payload);

      expect(dbCall).toHaveBeenCalledWith(
        {
          text: 'INSERT INTO account (id) VALUES ($1) RETURNING id;',
          values: [payload],
        },
        'event_history',
      );
      expect(res).toBe('NEW');
    });
  });

  describe('update', () => {
    it('returns updated account when rowCount > 0', async () => {
      dbCall.mockResolvedValue({ rows: [{ id: 'UPD' }], rowCount: 1 });

      const res = await AccountRepo.update('OLD', 'UPD' as any);

      expect(dbCall).toHaveBeenCalledWith(
        {
          text: 'UPDATE account SET id = $1 WHERE id = $2 RETURNING id;',
          values: ['UPD', 'OLD'],
        },
        'event_history',
      );
      expect(res).toBe('UPD');
    });

    it('returns null when rowCount = 0', async () => {
      dbCall.mockResolvedValue({ rows: [], rowCount: 0 });

      const res = await AccountRepo.update('OLD', 'UPD' as any);
      expect(res).toBeNull();
    });
  });

  describe('remove', () => {
    it('returns true when a row was deleted', async () => {
      dbCall.mockResolvedValue({ rows: [], rowCount: 1 });

      const res = await AccountRepo.remove('A1');

      expect(dbCall).toHaveBeenCalledWith(
        {
          text: 'DELETE FROM account WHERE id = $1;',
          values: ['A1'],
        },
        'event_history',
      );
      expect(res).toBe(true);
    });

    it('returns false when nothing was deleted', async () => {
      dbCall.mockResolvedValue({ rows: [], rowCount: 0 });

      const res = await AccountRepo.remove('A1');
      expect(res).toBe(false);
    });
  });
});
