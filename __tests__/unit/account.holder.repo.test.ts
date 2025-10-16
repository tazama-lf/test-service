// SPDX-License-Identifier: Apache-2.0
import handleExecuteSqlStatement from '../../src/database.logic.service';
import { AccountHolderRepo } from '../../src/repositories/event_history/account.holder.repository';

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

describe('AccountHolderRepo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('returns mapped data + total when rows exist', async () => {
      dbCall.mockResolvedValue(ok([{ evaluation: { source: 'S', destination: 'D', credttm: 'T' } }], 5));

      const res = await AccountHolderRepo.list({
        limit: 10,
        offset: 0,
        sort: 'credttm',
        order: 'DESC',
      });

      expect(dbCall).toHaveBeenCalledTimes(1);
      expect(dbCall).toHaveBeenCalledWith(
        {
          text: expect.stringContaining('SELECT * FROM account_holder WHERE tenantId = $3 ORDER BY credttm DESC OFFSET $1 LIMIT $2;'),
          values: [0, 10],
        },
        'event_history',
      );

      const calledSql = dbCall.mock.calls[0][0].text as string;
      expect(calledSql).toContain('ORDER BY credttm DESC');
      expect(calledSql).toContain('OFFSET $1 LIMIT $2');

      expect(res).toEqual({
        data: [{ source: 'S', destination: 'D', credttm: 'T' }],
        total: 5,
      });
    });

    it('uses default sort "credttm" when sort is undefined', async () => {
      dbCall.mockResolvedValue(ok([], 0));

      await AccountHolderRepo.list({
        limit: 5,
        offset: 15,
        sort: undefined,
        order: 'ASC',
      });

      const [[cfg, dbName]] = dbCall.mock.calls;
      expect(dbName).toBe('event_history');
      expect(cfg.values).toEqual([15, 5]);
      expect(cfg.text).toContain('ORDER BY credttm ASC');
    });

    it('supports custom sort column', async () => {
      dbCall.mockResolvedValue(ok([], 0));

      await AccountHolderRepo.list({
        limit: 3,
        offset: 9,
        sort: 'destination',
        order: 'DESC',
      });

      const [[cfg]] = dbCall.mock.calls;
      expect(cfg.text).toContain('ORDER BY destination DESC');
      expect(cfg.values).toEqual([9, 3]);
    });

    it('returns empty data when no rows', async () => {
      dbCall.mockResolvedValue(ok([], 0));

      const res = await AccountHolderRepo.list({
        limit: 10,
        offset: 0,
        sort: 'credttm',
        order: 'ASC',
      });

      expect(res).toEqual({ data: [], total: 0 });
    });
  });

  describe('get', () => {
    it('returns account holder when found', async () => {
      dbCall.mockResolvedValue(ok([{ evaluation: { source: 'S', destination: 'D', credttm: 'T' } }]));

      const res = await AccountHolderRepo.get({ source: 'S', destination: 'D' });

      expect(dbCall).toHaveBeenCalledWith(
        {
          text: 'SELECT * FROM account_holder WHERE source = $1 AND destination = $2;',
          values: ['S', 'D'],
        },
        'event_history',
      );
      expect(res).toEqual({ source: 'S', destination: 'D', credttm: 'T' });
    });

    it('returns null when not found', async () => {
      dbCall.mockResolvedValue(ok([]));

      const res = await AccountHolderRepo.get({ source: 'S', destination: 'D' });
      expect(res).toBeNull();
    });
  });

  describe('create', () => {
    it('inserts and returns account holder', async () => {
      dbCall.mockResolvedValue(ok([{ evaluation: { source: 'S', destination: 'D', credttm: 'T' } }]));

      const payload = { source: 'S', destination: 'D', credttm: 'T' } as any;
      const res = await AccountHolderRepo.create(payload);

      expect(dbCall).toHaveBeenCalledWith(
        {
          text: 'INSERT INTO account_holder (source, destination, credttm) VALUES ($1, $2, $3) RETURNING source, destination, credttm;',
          values: ['S', 'D', 'T'],
        },
        'event_history',
      );
      expect(res).toEqual({ source: 'S', destination: 'D', credttm: 'T' });
    });
  });

  describe('update', () => {
    it('returns updated account holder when rowCount > 0', async () => {
      dbCall.mockResolvedValue({
        rows: [{ evaluation: { source: 'S2', destination: 'D2', credttm: 'T2' } }],
        rowCount: 1,
      });

      const res = await AccountHolderRepo.update({ source: 'S', destination: 'D' }, {
        source: 'S2',
        destination: 'D2',
        credttm: 'T2',
      } as any);

      expect(dbCall).toHaveBeenCalledWith(
        {
          text: 'UPDATE account_holder SET credttm = $1, source = $2, destination = $3 WHERE source = $4 AND destination = $5 RETURNING source, destination, credttm;',
          values: ['T2', 'S2', 'D2', 'S', 'D'],
        },
        'event_history',
      );
      expect(res).toEqual({ source: 'S2', destination: 'D2', credttm: 'T2' });
    });

    it('returns null when rowCount = 0', async () => {
      dbCall.mockResolvedValue({ rows: [], rowCount: 0 });

      const res = await AccountHolderRepo.update({ source: 'S', destination: 'D' }, {
        source: 'S2',
        destination: 'D2',
        credttm: 'T2',
      } as any);
      expect(res).toBeNull();
    });
  });

  describe('remove', () => {
    it('returns true when a row was deleted', async () => {
      dbCall.mockResolvedValue({ rows: [], rowCount: 1 });

      const res = await AccountHolderRepo.remove({ source: 'S', destination: 'D' });

      expect(dbCall).toHaveBeenCalledWith(
        {
          text: 'DELETE FROM account_holder WHERE source = $1 AND destination = $2;',
          values: ['S', 'D'],
        },
        'event_history',
      );
      expect(res).toBe(true);
    });

    it('returns false when nothing was deleted', async () => {
      dbCall.mockResolvedValue({ rows: [], rowCount: 0 });

      const res = await AccountHolderRepo.remove({ source: 'S', destination: 'D' });
      expect(res).toBe(false);
    });
  });
});
