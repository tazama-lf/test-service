// SPDX-License-Identifier: Apache-2.0
import type { PgQueryConfig } from '@tazama-lf/frms-coe-lib';
import type { Account } from '@tazama-lf/frms-coe-lib/lib/interfaces';
import handleExecuteSqlStatement from '../../database.logic.service';
import type { CrudRepository } from '../repository.base';

export const AccountRepo: CrudRepository<Account> = {
  list: async function ({ limit, offset, sort, order, tenantId }): Promise<{ data: Account[]; total: number }> {
    sort ??= 'id';
    const queryRes = await handleExecuteSqlStatement<{ id: Account }>(
      {
        text: `SELECT id FROM account WHERE tenantId = $3 ORDER BY ${sort} ${order} OFFSET $1 LIMIT $2;`,
        values: [offset, limit, tenantId],
      } satisfies PgQueryConfig,
      'event_history',
    );

    return queryRes.rows.length > 0
      ? { data: queryRes.rows.map((values) => values.id), total: queryRes.rowCount! }
      : { data: [], total: 0 };
  },

  get: async function ({ id, tenantId }): Promise<Account | null> {
    const queryRes = await handleExecuteSqlStatement<{ id: Account }>(
      {
        text: 'SELECT id FROM account WHERE id = $1 AND tenantid = $2;',
        values: [id, tenantId],
      } satisfies PgQueryConfig,
      'event_history',
    );
    return queryRes.rows.length > 0 ? queryRes.rows[0].id : null;
  },

  create: async function (payload: Account): Promise<Account> {
    const queryRes = await handleExecuteSqlStatement<{ id: Account }>(
      {
        text: 'INSERT INTO account (id, tenantid) VALUES ($1, $2) RETURNING *;',
        values: [payload.id, payload.TenantId],
      } satisfies PgQueryConfig,
      'event_history',
    );
    return queryRes.rows[0].id;
  },

  update: async function ({ id, tenantId }, payload: Account): Promise<Account | null> {
    const queryRes = await handleExecuteSqlStatement<{ id: Account }>(
      {
        text: 'UPDATE account SET id = $1, tenantid = $2 WHERE id = $3 AND tenantid = $4 RETURNING id;',
        values: [payload.id, payload.TenantId, id, tenantId],
      } satisfies PgQueryConfig,
      'event_history',
    );
    return queryRes.rowCount ? queryRes.rows[0].id : null;
  },

  remove: async function ({ id, tenantId }): Promise<boolean> {
    const queryRes = await handleExecuteSqlStatement<{ id: Account }>(
      {
        text: 'DELETE FROM account WHERE id = $1 AND tenantid = $2;',
        values: [id, tenantId],
      } satisfies PgQueryConfig,
      'event_history',
    );
    return queryRes.rowCount ? true : false;
  },
};
