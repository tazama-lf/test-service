// SPDX-License-Identifier: Apache-2.0
import handleExecuteSqlStatement from '../../src/database.logic.service';
import { Pacs008Repo } from '../../src/repositories/raw_history/Pacs.008.001.10.repository';

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

describe('Pacs008Repo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('returns mapped data + total when rows exist', async () => {
      dbCall.mockResolvedValue(ok([{ document: { id: '1', foo: 'bar' } }], 7));

      const res = await Pacs008Repo.list({
        limit: 10,
        offset: 0,
        sort: 'TxTp',
        order: 'DESC',
      });

      expect(dbCall).toHaveBeenCalledTimes(1);
      expect(dbCall).toHaveBeenCalledWith(
        {
          text: expect.stringContaining('SELECT document FROM pacs008 ORDER BY'),
          values: [0, 10],
        },
        'raw_history',
      );

      const calledSql = dbCall.mock.calls[0][0].text as string;
      expect(calledSql).toContain('ORDER BY TxTp DESC');
      expect(calledSql).toContain('OFFSET $1 LIMIT $2');

      expect(res).toEqual({
        data: [{ id: '1', foo: 'bar' }],
        total: 7,
      });
    });

    it('uses default sort "TxTp" when sort is undefined', async () => {
      dbCall.mockResolvedValue(ok([], 0));

      await Pacs008Repo.list({
        limit: 5,
        offset: 15,
        sort: undefined,
        order: 'ASC',
      });

      const [[cfg, dbName]] = dbCall.mock.calls;
      expect(dbName).toBe('raw_history');
      expect(cfg.values).toEqual([15, 5]);
      expect(cfg.text).toContain('ORDER BY TxTp ASC');
    });

    it('supports custom sort column', async () => {
      dbCall.mockResolvedValue(ok([], 0));

      await Pacs008Repo.list({
        limit: 3,
        offset: 9,
        sort: 'DataCache',
        order: 'DESC',
      });

      const [[cfg]] = dbCall.mock.calls;
      expect(cfg.text).toContain('ORDER BY DataCache DESC');
      expect(cfg.values).toEqual([9, 3]);
    });

    it('returns empty data when no rows', async () => {
      dbCall.mockResolvedValue(ok([], 0));

      const res = await Pacs008Repo.list({
        limit: 10,
        offset: 0,
        sort: 'TxTp',
        order: 'ASC',
      });

      expect(res).toEqual({ data: [], total: 0 });
    });
  });

  describe('get', () => {
    it('returns document when found', async () => {
      dbCall.mockResolvedValue(ok([{ document: { id: 'abc', x: 1 } }]));

      const res = await Pacs008Repo.get('abc');

      expect(dbCall).toHaveBeenCalledWith(
        {
          text: 'SELECT document FROM pacs008 WHERE messageid = $1;',
          values: ['abc'],
        },
        'raw_history',
      );
      expect(res).toEqual({ id: 'abc', x: 1 });
    });

    it('returns null when not found', async () => {
      dbCall.mockResolvedValue(ok([]));

      const res = await Pacs008Repo.get('nope');
      expect(res).toBeNull();
    });
  });

  describe('create', () => {
    it('inserts and returns document', async () => {
      dbCall.mockResolvedValue(ok([{ document: { id: 'new' } }]));

      const payload = { id: 'new', a: 1 } as any;
      const res = await Pacs008Repo.create(payload);

      expect(dbCall).toHaveBeenCalledWith(
        {
          text: 'INSERT INTO pacs008 (document) VALUES ($1) RETURNING document;',
          values: [payload],
        },
        'raw_history',
      );
      expect(res).toEqual({ id: 'new' });
    });
  });

  describe('update', () => {
    it('returns updated document when rowCount > 0', async () => {
      dbCall.mockResolvedValue({ rows: [{ document: { id: 'u1' } }], rowCount: 1 });

      const res = await Pacs008Repo.update('msg-1', { id: 'u1' } as any);

      expect(dbCall).toHaveBeenCalledWith(
        {
          text: 'UPDATE pacs008 SET document = $1 WHERE messageid = $2 RETURNING document;',
          values: [{ id: 'u1' }, 'msg-1'],
        },
        'raw_history',
      );
      expect(res).toEqual({ id: 'u1' });
    });

    it('returns null when rowCount = 0', async () => {
      dbCall.mockResolvedValue({ rows: [], rowCount: 0 });

      const res = await Pacs008Repo.update('msg-1', { id: 'u1' } as any);
      expect(res).toBeNull();
    });
  });

  describe('remove', () => {
    it('returns true when a row was deleted', async () => {
      dbCall.mockResolvedValue({ rows: [], rowCount: 1 });

      const res = await Pacs008Repo.remove('msg-1');

      expect(dbCall).toHaveBeenCalledWith(
        {
          text: 'DELETE FROM pacs008 WHERE messageid = $1;',
          values: ['msg-1'],
        },
        'raw_history',
      );
      expect(res).toBe(true);
    });

    it('returns false when nothing was deleted', async () => {
      dbCall.mockResolvedValue({ rows: [], rowCount: 0 });

      const res = await Pacs008Repo.remove('msg-1');
      expect(res).toBe(false);
    });
  });
});
