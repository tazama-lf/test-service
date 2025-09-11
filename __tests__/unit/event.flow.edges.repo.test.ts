// SPDX-License-Identifier: Apache-2.0
import {
  GovernedAsCreditorAccountByRepo,
  GovernedAsCreditorByRepo,
  GovernedAsDebtorAccountByRepo,
  GovernedAsDebtorByRepo,
} from '../../src/repositories/event_history/event.flow.edges.repository';
import handleExecuteSqlStatement from '../../src/database.logic.service';

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

const edge = (over: Partial<{ source: string; destination: string; evtTp: string; incptnDtTm: string; xprtnDtTm: string }> = {}) => ({
  source: 'S',
  destination: 'D',
  evtTp: 'EVT',
  incptnDtTm: 'I',
  xprtnDtTm: 'X',
  ...over,
});

describe('Governed repos', () => {
  beforeEach(() => jest.clearAllMocks());

  // ----------------------- GovernedAsCreditorAccountByRepo -----------------------
  describe('GovernedAsCreditorAccountByRepo', () => {
    const table = 'governed_as_creditor_account_by';

    describe('list', () => {
      it('returns mapped data + total when rows exist', async () => {
        dbCall.mockResolvedValue(ok([{ edge: edge({ source: 'S1' }) }], 7));

        const res = await GovernedAsCreditorAccountByRepo.list({
          limit: 10,
          offset: 0,
          sort: 'id',
          order: 'DESC',
        });

        expect(dbCall).toHaveBeenCalledWith(
          {
            text: expect.stringContaining(`SELECT * FROM ${table} ORDER BY`),
            values: [0, 10],
          },
          'event_history',
        );
        const sql = dbCall.mock.calls[0][0].text as string;
        expect(sql).toContain('ORDER BY id DESC');
        expect(sql).toContain('OFFSET $1 LIMIT $2');

        expect(res).toEqual({ data: [edge({ source: 'S1' })], total: 7 });
      });

      it('uses default sort "id" when sort is undefined', async () => {
        dbCall.mockResolvedValue(ok([], 0));

        await GovernedAsCreditorAccountByRepo.list({
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

      it('returns empty when no rows', async () => {
        dbCall.mockResolvedValue(ok([], 0));

        const res = await GovernedAsCreditorAccountByRepo.list({
          limit: 2,
          offset: 0,
          sort: 'id',
          order: 'ASC',
        });
        expect(res).toEqual({ data: [], total: 0 });
      });
    });

    describe('get', () => {
      it('returns edge when found', async () => {
        dbCall.mockResolvedValue(ok([{ edge: edge({ source: 'S', destination: 'D' }) }]));

        const res = await GovernedAsCreditorAccountByRepo.get({ source: 'S', destination: 'D' });

        expect(dbCall).toHaveBeenCalledWith(
          {
            text: `SELECT * FROM ${table} WHERE source = $1 AND destination = $2;`,
            values: ['S', 'D'],
          },
          'event_history',
        );
        expect(res).toEqual(edge({ source: 'S', destination: 'D' }));
      });

      it('returns null when not found', async () => {
        dbCall.mockResolvedValue(ok([]));

        const res = await GovernedAsCreditorAccountByRepo.get({ source: 'S', destination: 'D' });
        expect(res).toBeNull();
      });
    });

    describe('create', () => {
      it('inserts and returns edge', async () => {
        dbCall.mockResolvedValue(ok([{ edge: edge({ source: 'S2', destination: 'D2' }) }]));

        const payload = edge({ source: 'S2', destination: 'D2' }) as any;
        const res = await GovernedAsCreditorAccountByRepo.create(payload);

        expect(dbCall).toHaveBeenCalledWith(
          {
            text: `INSERT INTO ${table} (source, destination, evttp, incptndttm, xprtndttm) VALUES ($1,$2,$3,$4,$5) RETURNING evaluation;`,
            values: ['S2', 'D2', 'EVT', 'I', 'X'],
          },
          'event_history',
        );
        expect(res).toEqual(edge({ source: 'S2', destination: 'D2' }));
      });
    });

    describe('update', () => {
      it('returns updated edge when rowCount > 0', async () => {
        dbCall.mockResolvedValue({ rows: [{ edge: edge({ source: 'S3', destination: 'D3' }) }], rowCount: 1 });

        const res = await GovernedAsCreditorAccountByRepo.update(
          { source: 'S', destination: 'D' },
          edge({ source: 'S3', destination: 'D3' }) as any,
        );

        expect(dbCall).toHaveBeenCalledWith(
          {
            text: `UPDATE ${table} SET source = $1, destination = $2, evttp = $3, incptndttm = $4, xprtndttm = $5 WHERE source = $6 AND destination = $7;`,
            values: ['S3', 'D3', 'EVT', 'I', 'X', 'S', 'D'],
          },
          'event_history',
        );
        expect(res).toEqual(edge({ source: 'S3', destination: 'D3' }));
      });

      it('returns null when rowCount = 0', async () => {
        dbCall.mockResolvedValue({ rows: [], rowCount: 0 });

        const res = await GovernedAsCreditorAccountByRepo.update(
          { source: 'S', destination: 'D' },
          edge({ source: 'S3', destination: 'D3' }) as any,
        );
        expect(res).toBeNull();
      });
    });

    describe('remove', () => {
      it('returns true when a row was deleted', async () => {
        dbCall.mockResolvedValue({ rows: [], rowCount: 1 });

        const res = await GovernedAsCreditorAccountByRepo.remove({ source: 'S', destination: 'D' });

        expect(dbCall).toHaveBeenCalledWith(
          {
            text: `DELETE FROM ${table} WHERE source = $1 AND destination = $2;`,
            values: ['S', 'D'],
          },
          'event_history',
        );
        expect(res).toBe(true);
      });

      it('returns false when nothing was deleted', async () => {
        dbCall.mockResolvedValue({ rows: [], rowCount: 0 });

        const res = await GovernedAsCreditorAccountByRepo.remove({ source: 'S', destination: 'D' });
        expect(res).toBe(false);
      });
    });
  });

  // ----------------------- GovernedAsCreditorByRepo -----------------------
  describe('GovernedAsCreditorByRepo', () => {
    const table = 'governed_as_creditor_by';

    describe('list', () => {
      it('returns mapped data + total', async () => {
        dbCall.mockResolvedValue(ok([{ edge: edge({ source: 'S1' }) }], 4));

        const res = await GovernedAsCreditorByRepo.list({
          limit: 10,
          offset: 0,
          sort: 'id',
          order: 'DESC',
        });

        expect(dbCall).toHaveBeenCalledWith(
          {
            text: expect.stringContaining(`SELECT * FROM ${table} ORDER BY`),
            values: [0, 10],
          },
          'event_history',
        );
        expect(res).toEqual({ data: [edge({ source: 'S1' })], total: 4 });
      });

      it('default sort id', async () => {
        dbCall.mockResolvedValue(ok([], 0));
        await GovernedAsCreditorByRepo.list({ limit: 5, offset: 15, sort: undefined, order: 'ASC' });
        const [[cfg]] = dbCall.mock.calls;
        expect(cfg.text).toContain('ORDER BY id ASC');
        expect(cfg.values).toEqual([15, 5]);
      });

      it('empty list', async () => {
        dbCall.mockResolvedValue(ok([], 0));
        const res = await GovernedAsCreditorByRepo.list({ limit: 1, offset: 0, sort: 'id', order: 'ASC' });
        expect(res).toEqual({ data: [], total: 0 });
      });
    });

    describe('get', () => {
      it('found', async () => {
        dbCall.mockResolvedValue(ok([{ edge: edge({ destination: 'D' }) }]));
        const res = await GovernedAsCreditorByRepo.get({ source: 'S', destination: 'D' });
        expect(dbCall).toHaveBeenCalledWith(
          { text: `SELECT * FROM ${table} WHERE source = $1 AND destination = $2;`, values: ['S', 'D'] },
          'event_history',
        );
        expect(res).toEqual(edge({ destination: 'D' }));
      });
      it('not found', async () => {
        dbCall.mockResolvedValue(ok([]));
        const res = await GovernedAsCreditorByRepo.get({ source: 'S', destination: 'D' });
        expect(res).toBeNull();
      });
    });

    describe('create', () => {
      it('returns created edge', async () => {
        dbCall.mockResolvedValue(ok([{ edge: edge({ source: 'S2' }) }]));
        const res = await GovernedAsCreditorByRepo.create(edge({ source: 'S2' }) as any);
        expect(dbCall).toHaveBeenCalledWith(
          {
            text: `INSERT INTO ${table} (source, destination, evttp, incptndttm, xprtndttm) VALUES ($1,$2,$3,$4,$5) RETURNING evaluation;`,
            values: ['S2', 'D', 'EVT', 'I', 'X'],
          },
          'event_history',
        );
        expect(res).toEqual(edge({ source: 'S2' }));
      });
    });

    describe('update', () => {
      it('returns updated when rowCount > 0', async () => {
        dbCall.mockResolvedValue({ rows: [{ edge: edge({ source: 'US' }) }], rowCount: 1 });
        const res = await GovernedAsCreditorByRepo.update({ source: 'S', destination: 'D' }, edge({ source: 'US' }) as any);
        expect(dbCall).toHaveBeenCalledWith(
          {
            text: `UPDATE ${table} SET source = $1, destination = $2, evttp = $3, incptndttm = $4, xprtndttm = $5 WHERE source = $6 AND destination = $7;`,
            values: ['US', 'D', 'EVT', 'I', 'X', 'S', 'D'],
          },
          'event_history',
        );
        expect(res).toEqual(edge({ source: 'US' }));
      });

      it('returns null when rowCount = 0', async () => {
        dbCall.mockResolvedValue({ rows: [], rowCount: 0 });
        const res = await GovernedAsCreditorByRepo.update({ source: 'S', destination: 'D' }, edge({ source: 'US' }) as any);
        expect(res).toBeNull();
      });
    });

    describe('remove', () => {
      it('true when deleted', async () => {
        dbCall.mockResolvedValue({ rows: [], rowCount: 1 });
        const res = await GovernedAsCreditorByRepo.remove({ source: 'S', destination: 'D' });
        expect(dbCall).toHaveBeenCalledWith(
          { text: `DELETE FROM ${table} WHERE source = $1 AND destination = $2;`, values: ['S', 'D'] },
          'event_history',
        );
        expect(res).toBe(true);
      });
      it('false when not deleted', async () => {
        dbCall.mockResolvedValue({ rows: [], rowCount: 0 });
        const res = await GovernedAsCreditorByRepo.remove({ source: 'S', destination: 'D' });
        expect(res).toBe(false);
      });
    });
  });

  // ----------------------- GovernedAsDebtorAccountByRepo -----------------------
  describe('GovernedAsDebtorAccountByRepo', () => {
    const table = 'governed_as_debtor_account_by';

    describe('list', () => {
      it('returns mapped data + total', async () => {
        dbCall.mockResolvedValue(ok([{ edge: edge({ destination: 'D1' }) }], 3));
        const res = await GovernedAsDebtorAccountByRepo.list({ limit: 10, offset: 0, sort: 'id', order: 'DESC' });
        expect(dbCall).toHaveBeenCalledWith(
          {
            text: expect.stringContaining(`SELECT * FROM ${table} ORDER BY`),
            values: [0, 10],
          },
          'event_history',
        );
        expect(res).toEqual({ data: [edge({ destination: 'D1' })], total: 3 });
      });

      it('default sort id', async () => {
        dbCall.mockResolvedValue(ok([], 0));
        await GovernedAsDebtorAccountByRepo.list({ limit: 2, offset: 4, sort: undefined, order: 'ASC' });
        const [[cfg]] = dbCall.mock.calls;
        expect(cfg.text).toContain('ORDER BY id ASC');
        expect(cfg.values).toEqual([4, 2]);
      });

      it('empty list', async () => {
        dbCall.mockResolvedValue(ok([], 0));
        const res = await GovernedAsDebtorAccountByRepo.list({ limit: 1, offset: 0, sort: 'id', order: 'ASC' });
        expect(res).toEqual({ data: [], total: 0 });
      });
    });

    describe('get', () => {
      it('found', async () => {
        dbCall.mockResolvedValue(ok([{ edge: edge({ source: 'S', destination: 'D' }) }]));
        const res = await GovernedAsDebtorAccountByRepo.get({ source: 'S', destination: 'D' });
        expect(dbCall).toHaveBeenCalledWith(
          { text: `SELECT * FROM ${table} WHERE source = $1 AND destination = $2;`, values: ['S', 'D'] },
          'event_history',
        );
        expect(res).toEqual(edge({ source: 'S', destination: 'D' }));
      });
      it('not found', async () => {
        dbCall.mockResolvedValue(ok([]));
        const res = await GovernedAsDebtorAccountByRepo.get({ source: 'S', destination: 'D' });
        expect(res).toBeNull();
      });
    });

    describe('create', () => {
      it('returns created edge', async () => {
        dbCall.mockResolvedValue(ok([{ edge: edge({ source: 'S3' }) }]));
        const res = await GovernedAsDebtorAccountByRepo.create(edge({ source: 'S3' }) as any);
        expect(dbCall).toHaveBeenCalledWith(
          {
            text: `INSERT INTO ${table} (source, destination, evttp, incptndttm, xprtndttm) VALUES ($1,$2,$3,$4,$5) RETURNING evaluation;`,
            values: ['S3', 'D', 'EVT', 'I', 'X'],
          },
          'event_history',
        );
        expect(res).toEqual(edge({ source: 'S3' }));
      });
    });

    describe('update', () => {
      it('returns updated when rowCount > 0', async () => {
        dbCall.mockResolvedValue({ rows: [{ edge: edge({ destination: 'UD' }) }], rowCount: 1 });
        const res = await GovernedAsDebtorAccountByRepo.update({ source: 'S', destination: 'D' }, edge({ destination: 'UD' }) as any);
        expect(dbCall).toHaveBeenCalledWith(
          {
            text: `UPDATE ${table} SET source = $1, destination = $2, evttp = $3, incptndttm = $4, xprtndttm = $5 WHERE source = $6 AND destination = $7;`,
            values: ['S', 'UD', 'EVT', 'I', 'X', 'S', 'D'],
          },
          'event_history',
        );
        expect(res).toEqual(edge({ destination: 'UD' }));
      });

      it('returns null when rowCount = 0', async () => {
        dbCall.mockResolvedValue({ rows: [], rowCount: 0 });
        const res = await GovernedAsDebtorAccountByRepo.update({ source: 'S', destination: 'D' }, edge({ destination: 'UD' }) as any);
        expect(res).toBeNull();
      });
    });

    describe('remove', () => {
      it('true when deleted', async () => {
        dbCall.mockResolvedValue({ rows: [], rowCount: 1 });
        const res = await GovernedAsDebtorAccountByRepo.remove({ source: 'S', destination: 'D' });
        expect(dbCall).toHaveBeenCalledWith(
          { text: `DELETE FROM ${table} WHERE source = $1 AND destination = $2;`, values: ['S', 'D'] },
          'event_history',
        );
        expect(res).toBe(true);
      });
      it('false when not deleted', async () => {
        dbCall.mockResolvedValue({ rows: [], rowCount: 0 });
        const res = await GovernedAsDebtorAccountByRepo.remove({ source: 'S', destination: 'D' });
        expect(res).toBe(false);
      });
    });
  });

  // ----------------------- GovernedAsDebtorByRepo -----------------------
  describe('GovernedAsDebtorByRepo', () => {
    const table = 'governed_as_debtor_by';

    describe('list', () => {
      it('returns mapped data + total', async () => {
        dbCall.mockResolvedValue(ok([{ edge: edge({ source: 'S10' }) }], 2));
        const res = await GovernedAsDebtorByRepo.list({ limit: 10, offset: 0, sort: 'id', order: 'DESC' });
        expect(dbCall).toHaveBeenCalledWith(
          { text: expect.stringContaining(`SELECT * FROM ${table} ORDER BY`), values: [0, 10] },
          'event_history',
        );
        expect(res).toEqual({ data: [edge({ source: 'S10' })], total: 2 });
      });

      it('default sort id', async () => {
        dbCall.mockResolvedValue(ok([], 0));
        await GovernedAsDebtorByRepo.list({ limit: 5, offset: 5, sort: undefined, order: 'ASC' });
        const [[cfg]] = dbCall.mock.calls;
        expect(cfg.text).toContain('ORDER BY id ASC');
        expect(cfg.values).toEqual([5, 5]);
      });

      it('empty list', async () => {
        dbCall.mockResolvedValue(ok([], 0));
        const res = await GovernedAsDebtorByRepo.list({ limit: 1, offset: 0, sort: 'id', order: 'ASC' });
        expect(res).toEqual({ data: [], total: 0 });
      });
    });

    describe('get', () => {
      it('found', async () => {
        dbCall.mockResolvedValue(ok([{ edge: edge({ destination: 'D9' }) }]));
        const res = await GovernedAsDebtorByRepo.get({ source: 'S', destination: 'D9' });
        expect(dbCall).toHaveBeenCalledWith(
          { text: `SELECT * FROM ${table} WHERE source = $1 AND destination = $2;`, values: ['S', 'D9'] },
          'event_history',
        );
        expect(res).toEqual(edge({ destination: 'D9' }));
      });
      it('not found', async () => {
        dbCall.mockResolvedValue(ok([]));
        const res = await GovernedAsDebtorByRepo.get({ source: 'S', destination: 'D' });
        expect(res).toBeNull();
      });
    });

    describe('create', () => {
      it('returns created edge', async () => {
        dbCall.mockResolvedValue(ok([{ edge: edge({ source: 'SC' }) }]));
        const res = await GovernedAsDebtorByRepo.create(edge({ source: 'SC' }) as any);
        expect(dbCall).toHaveBeenCalledWith(
          {
            text: `INSERT INTO ${table} (source, destination, evttp, incptndttm, xprtndttm) VALUES ($1,$2,$3,$4,$5) RETURNING evaluation;`,
            values: ['SC', 'D', 'EVT', 'I', 'X'],
          },
          'event_history',
        );
        expect(res).toEqual(edge({ source: 'SC' }));
      });
    });

    describe('update', () => {
      it('returns updated when rowCount > 0', async () => {
        dbCall.mockResolvedValue({ rows: [{ edge: edge({ source: 'SU' }) }], rowCount: 1 });
        const res = await GovernedAsDebtorByRepo.update({ source: 'S', destination: 'D' }, edge({ source: 'SU' }) as any);
        expect(dbCall).toHaveBeenCalledWith(
          {
            text: `UPDATE ${table} SET source = $1, destination = $2, evttp = $3, incptndttm = $4, xprtndttm = $5 WHERE source = $6 AND destination = $7;`,
            values: ['SU', 'D', 'EVT', 'I', 'X', 'S', 'D'],
          },
          'event_history',
        );
        expect(res).toEqual(edge({ source: 'SU' }));
      });

      it('returns null when rowCount = 0', async () => {
        dbCall.mockResolvedValue({ rows: [], rowCount: 0 });
        const res = await GovernedAsDebtorByRepo.update({ source: 'S', destination: 'D' }, edge({ source: 'SU' }) as any);
        expect(res).toBeNull();
      });
    });

    describe('remove', () => {
      it('true when deleted (rowCount > 0)', async () => {
        dbCall.mockResolvedValue({ rows: [], rowCount: 1 });
        const res = await GovernedAsDebtorByRepo.remove({ source: 'S', destination: 'D' });
        expect(dbCall).toHaveBeenCalledWith(
          { text: `DELETE FROM ${table} WHERE source = $1 AND destination = $2;`, values: ['S', 'D'] },
          'event_history',
        );
        // implementation returns rowCount ? rowCount > 0 : false; -> true
        expect(res).toBe(true);
      });
      it('false when not deleted', async () => {
        dbCall.mockResolvedValue({ rows: [], rowCount: 0 });
        const res = await GovernedAsDebtorByRepo.remove({ source: 'S', destination: 'D' });
        expect(res).toBe(false);
      });
    });
  });
});
