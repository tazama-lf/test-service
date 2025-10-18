// SPDX-License-Identifier: Apache-2.0
import handleExecuteSqlStatement from '../../src/database.logic.service';
import { TransactionRepo } from '../../src/repositories/event_history/transaction.repository';

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

describe('TransactionRepo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('returns mapped data + total when rows exist', async () => {
      const rows = [
        { source: 'S1', destination: 'D1', transaction: { amt: 1 } },
        { source: 'S2', destination: 'D2', transaction: { amt: 2 } },
      ];
      dbCall.mockResolvedValue(ok(rows, 11));

      const res = await TransactionRepo.list({
        limit: 10,
        offset: 0,
        sort: 'destination',
        order: 'DESC',
      });

      expect(dbCall).toHaveBeenCalledTimes(1);
      expect(dbCall).toHaveBeenCalledWith(
        {
          text: expect.stringContaining('SELECT * FROM transaction WHERE tenantId = $3 ORDER BY destination DESC OFFSET $1 LIMIT $2;'),
          values: [0, 10],
        },
        'event_history',
      );

      const sql = dbCall.mock.calls[0][0].text as string;
      expect(sql).toContain('ORDER BY destination DESC');
      expect(sql).toContain('OFFSET $1 LIMIT $2');

      expect(res).toEqual({
        data: rows,
        total: 11,
      });
    });

    it('uses default sort "destination" when sort is undefined', async () => {
      dbCall.mockResolvedValue(ok([], 0));

      await TransactionRepo.list({
        limit: 5,
        offset: 15,
        sort: undefined,
        order: 'ASC',
      });

      const [[cfg, dbName]] = dbCall.mock.calls;
      expect(dbName).toBe('event_history');
      expect(cfg.values).toEqual([15, 5]);
      expect(cfg.text).toContain('ORDER BY destination ASC');
    });

    it('supports custom sort column', async () => {
      dbCall.mockResolvedValue(ok([], 0));

      await TransactionRepo.list({
        limit: 3,
        offset: 9,
        sort: 'source',
        order: 'DESC',
      });

      const [[cfg]] = dbCall.mock.calls;
      expect(cfg.text).toContain('ORDER BY source DESC');
      expect(cfg.values).toEqual([9, 3]);
    });

    it('returns empty data when no rows', async () => {
      dbCall.mockResolvedValue(ok([], 0));

      const res = await TransactionRepo.list({
        limit: 10,
        offset: 0,
        sort: 'destination',
        order: 'ASC',
      });

      expect(res).toEqual({ data: [], total: 0 });
    });
  });

  describe('get', () => {
    it('returns transaction when found', async () => {
      const row = { source: 'S', destination: 'D', transaction: { amt: 9 } };
      dbCall.mockResolvedValue(ok([row]));

      const res = await TransactionRepo.get({ id: 'MSG-1', tenantId: 'tenantA' });

      expect(dbCall).toHaveBeenCalledWith(
        {
          text: 'SELECT * FROM transaction WHERE msgid = $1 AND tenantid = $2;',
          values: ['MSG-1', 'tenantA'],
        },
        'event_history',
      );
      expect(res).toEqual(row);
    });

    it('returns null when not found', async () => {
      dbCall.mockResolvedValue(ok([]));

      const res = await TransactionRepo.get({ id: 'missing', tenantId: 'tenantA' });
      expect(res).toBeNull();
    });
  });

  describe('create', () => {
    it('inserts and returns transaction (maps fields from first row)', async () => {
      const inserted = { source: 'S', destination: 'D', transaction: { amt: 7 } };
      dbCall.mockResolvedValue(ok([inserted]));

      const payload = inserted as any;
      const res = await TransactionRepo.create(payload);

      expect(dbCall).toHaveBeenCalledWith(
        {
          text: 'INSERT INTO transaction (source, destination, transaction) VALUES ($1, $2, $3) RETURNING source, destination, transaction;',
          values: ['S', 'D', { amt: 7 }],
        },
        'event_history',
      );
      expect(res).toEqual({ source: 'S', destination: 'D', transaction: { amt: 7 } });
    });
  });

  describe('update', () => {
    it('returns updated transaction when rowCount > 0', async () => {
      const updated = { source: 'S2', destination: 'D2', transaction: { amt: 99 } };
      dbCall.mockResolvedValue({ rows: [updated], rowCount: 1 });

      const res = await TransactionRepo.update({ id: 'MSG-1', tenantId: 'tenantA' }, updated as any);

      expect(dbCall).toHaveBeenCalledWith(
        {
          text: 'UPDATE transaction SET source = $1,destination = $2,transaction = $3 WHERE msgid = $4 AND tenantid = $5 RETURNING source, destination, transaction;',
          values: ['S2', 'D2', { amt: 99 }, 'MSG-1', 'tenantA'],
        },
        'event_history',
      );
      expect(res).toEqual(updated);
    });

    it('returns null when rowCount = 0', async () => {
      dbCall.mockResolvedValue({ rows: [], rowCount: 0 });

      const res = await TransactionRepo.update({ id: 'MSG-1', tenantId: 'tenantA' }, {
        source: 'S2',
        destination: 'D2',
        transaction: { amt: 99 },
      } as any);

      expect(res).toBeNull();
    });
  });

  describe('remove', () => {
    it('returns true when a row was deleted', async () => {
      dbCall.mockResolvedValue({ rows: [], rowCount: 1 });

      const res = await TransactionRepo.remove({ id: 'MSG-1', tenantId: 'tenantA' });

      expect(dbCall).toHaveBeenCalledWith(
        {
          text: 'DELETE FROM transaction WHERE msgid = $1 AND tenantid = $2;',
          values: ['MSG-1', 'tenantA'],
        },
        'event_history',
      );
      expect(res).toBe(true);
    });

    it('returns false when nothing was deleted', async () => {
      dbCall.mockResolvedValue({ rows: [], rowCount: 0 });

      const res = await TransactionRepo.remove({ id: 'MSG-1', tenantId: 'tenantA' });
      expect(res).toBe(false);
    });
  });
});
