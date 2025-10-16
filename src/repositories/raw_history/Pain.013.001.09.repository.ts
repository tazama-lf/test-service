// SPDX-License-Identifier: Apache-2.0
import type { PgQueryConfig } from '@tazama-lf/frms-coe-lib';
import type { Pain013 } from '@tazama-lf/frms-coe-lib/lib/interfaces';
import handleExecuteSqlStatement from '../../database.logic.service';
import type { CrudRepository } from '../repository.base';

export const Pain013Repo: CrudRepository<Pain013> = {
  list: async function ({ offset, limit, sort, order, tenantId }): Promise<{ data: Pain013[]; total: number }> {
    sort ??= 'TxTp';
    const queryRes = await handleExecuteSqlStatement<{ document: Pain013 }>(
      {
        text: `SELECT document FROM WHERE tenantId = $3 pain013 ORDER BY ${sort} ${order} OFFSET $1 LIMIT $2;`,
        values: [offset, limit, tenantId],
      },
      'raw_history',
    );

    return queryRes.rows.length > 0
      ? { data: queryRes.rows.map((values) => values.document), total: queryRes.rowCount! }
      : { data: [], total: 0 };
  },

  get: async function (id): Promise<Pain013 | null> {
    const queryRes = await handleExecuteSqlStatement<{ document: Pain013 }>(
      {
        text: 'SELECT document FROM pain013 WHERE messageid = $1;',
        values: [id],
      } satisfies PgQueryConfig,
      'raw_history',
    );

    return queryRes.rows.length > 0 ? queryRes.rows[0].document : null;
  },

  create: async function (payload: Pain013): Promise<Pain013> {
    const queryRes = await handleExecuteSqlStatement<{ document: Pain013 }>(
      {
        text: 'INSERT INTO pain013 (document) VALUES ($1) RETURNING document;',
        values: [payload],
      } satisfies PgQueryConfig,
      'raw_history',
    );
    return queryRes.rows[0].document;
  },

  update: async function (id: string, payload: Pain013): Promise<Pain013 | null> {
    const queryRes = await handleExecuteSqlStatement<{ document: Pain013 }>(
      {
        text: 'UPDATE pain013 SET document = $1 WHERE messageid = $2 RETURNING document;',
        values: [payload, id],
      } satisfies PgQueryConfig,
      'raw_history',
    );
    return queryRes.rowCount ? queryRes.rows[0].document : null;
  },

  remove: async function (id: string): Promise<boolean> {
    const queryRes = await handleExecuteSqlStatement<{ document: Pain013 }>(
      {
        text: 'DELETE FROM pain013 WHERE messageid = $1;',
        values: [id],
      } satisfies PgQueryConfig,
      'raw_history',
    );
    return queryRes.rowCount ? true : false;
  },
};
