// SPDX-License-Identifier: Apache-2.0
import type { PgQueryConfig } from '@tazama-lf/frms-coe-lib';
import type { Pacs002 } from '@tazama-lf/frms-coe-lib/lib/interfaces';
import handleExecuteSqlStatement from '../../database.logic.service';
import type { CrudRepository } from '../repository.base';

export const Pacs002Repo: CrudRepository<Pacs002> = {
  list: async function ({ limit, offset, order, sort, tenantId }): Promise<{ data: Pacs002[]; total: number }> {
    sort ??= 'TxTp';
    const queryRes = await handleExecuteSqlStatement<{ document: Pacs002 }>(
      {
        text: `SELECT document FROM pacs002 WHERE tenantId = $3 ORDER BY ${sort} ${order} OFFSET $1 LIMIT $2;`,
        values: [offset, limit, tenantId],
      },
      'raw_history',
    );

    return queryRes.rows.length > 0
      ? { data: queryRes.rows.map((values) => values.document), total: queryRes.rowCount! }
      : { data: [], total: 0 };
  },

  get: async function (id: string): Promise<Pacs002 | null> {
    const queryRes = await handleExecuteSqlStatement<{ document: Pacs002 }>(
      {
        text: 'SELECT document FROM pacs002 WHERE messageid = $1;',
        values: [id],
      } satisfies PgQueryConfig,
      'raw_history',
    );

    return queryRes.rows.length > 0 ? queryRes.rows[0].document : null;
  },

  create: async function (payload: Pacs002): Promise<Pacs002> {
    const queryRes = await handleExecuteSqlStatement<{ document: Pacs002 }>(
      {
        text: 'INSERT INTO pacs002 (document) VALUES ($1) RETURNING document;',
        values: [payload],
      } satisfies PgQueryConfig,
      'raw_history',
    );
    return queryRes.rows[0].document;
  },

  update: async function (name: string, payload: Pacs002): Promise<Pacs002 | null> {
    const queryRes = await handleExecuteSqlStatement<{ document: Pacs002 }>(
      {
        text: 'UPDATE pacs002 SET document = $1 WHERE messageid = $2 RETURNING document;',
        values: [payload, name],
      } satisfies PgQueryConfig,
      'raw_history',
    );
    return queryRes.rowCount ? queryRes.rows[0].document : null;
  },

  remove: async function (name: string): Promise<boolean> {
    const queryRes = await handleExecuteSqlStatement<{ document: Pacs002 }>(
      {
        text: 'DELETE FROM pacs002 WHERE messageid = $1;',
        values: [name],
      } satisfies PgQueryConfig,
      'raw_history',
    );
    return queryRes.rowCount ? true : false;
  },
};
