// SPDX-License-Identifier: Apache-2.0
import type { PgQueryConfig } from '@tazama-lf/frms-coe-lib';
import type { Condition } from '@tazama-lf/frms-coe-lib/lib/interfaces';
import handleExecuteSqlStatement from '../../database.logic.service';
import type { CrudRepository } from '../repository.base';

export const ConditionRepo: CrudRepository<Condition> = {
  list: async function ({ offset, limit, sort, order, tenantId }): Promise<{ data: Condition[]; total: number }> {
    sort ??= 'creDtTm';
    const queryRes = await handleExecuteSqlStatement<{ condition: Condition }>(
      {
        text: `SELECT condition FROM condition WHERE tenantId = $4 ORDER BY condition->>$3 ${order} OFFSET $1 LIMIT $2;`,
        values: [offset, limit, sort, tenantId],
      } satisfies PgQueryConfig,
      'event_history',
    );

    return queryRes.rows.length > 0
      ? { data: queryRes.rows.map((values) => values.condition), total: queryRes.rowCount! }
      : { data: [], total: 0 };
  },

  get: async function ({ id, tenantId }): Promise<Condition | null> {
    const queryRes = await handleExecuteSqlStatement<{ condition: Condition }>(
      {
        text: 'SELECT condition FROM condition WHERE id = $1 AND tenantid = $2;',
        values: [id, tenantId],
      } satisfies PgQueryConfig,
      'event_history',
    );

    return queryRes.rows.length > 0 ? queryRes.rows[0].condition : null;
  },

  create: async function (payload: Condition): Promise<Condition> {
    const queryRes = await handleExecuteSqlStatement<{ condition: Condition }>(
      {
        text: 'INSERT INTO condition (condition) VALUES ($1) RETURNING condition;',
        values: [payload],
      } satisfies PgQueryConfig,
      'event_history',
    );
    return queryRes.rows[0].condition;
  },

  update: async function ({ id, tenantId }, payload: Condition): Promise<Condition | null> {
    const queryRes = await handleExecuteSqlStatement<{ condition: Condition }>(
      {
        text: 'UPDATE condition SET condition = $1 WHERE id = $2 AND tenantid = $3 RETURNING condition;',
        values: [payload, id, tenantId],
      } satisfies PgQueryConfig,
      'event_history',
    );
    return queryRes.rowCount ? queryRes.rows[0].condition : null;
  },

  remove: async function ({ id, tenantId }): Promise<boolean> {
    const queryRes = await handleExecuteSqlStatement<{ condition: Condition }>(
      {
        text: 'DELETE FROM condition WHERE id = $1 AND tenantid = $2;',
        values: [id, tenantId],
      } satisfies PgQueryConfig,
      'event_history',
    );
    return queryRes.rowCount ? true : false;
  },
};
