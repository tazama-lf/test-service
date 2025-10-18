// SPDX-License-Identifier: Apache-2.0
import type { PgQueryConfig } from '@tazama-lf/frms-coe-lib';
import type { Entity } from '@tazama-lf/frms-coe-lib/lib/interfaces';
import handleExecuteSqlStatement from '../../database.logic.service';
import type { CrudRepository } from '../repository.base';

export const EntityRepo: CrudRepository<Entity> = {
  list: async function ({ limit, offset, sort, order, tenantId }): Promise<{ data: Entity[]; total: number }> {
    sort ??= 'creDtTm';
    const queryRes = await handleExecuteSqlStatement<Entity>(
      {
        text: `SELECT id, credttm as "creDtTm" FROM entity WHERE tenantId = $3 ORDER BY ${sort} ${order} OFFSET $1 LIMIT $2;`,
        values: [offset, limit, tenantId],
      } satisfies PgQueryConfig,
      'event_history',
    );

    return queryRes.rows.length > 0 ? { data: queryRes.rows.map((values) => values), total: queryRes.rowCount! } : { data: [], total: 0 };
  },

  get: async function ({ id, tenantId }): Promise<Entity | null> {
    const queryRes = await handleExecuteSqlStatement<Entity>(
      {
        text: 'SELECT id, credttm as "creDtTm" FROM entity WHERE id = $1 AND tenantid = $2;',
        values: [id, tenantId],
      } satisfies PgQueryConfig,
      'event_history',
    );

    return queryRes.rows.length > 0 ? queryRes.rows[0] : null;
  },

  create: async function (payload: Entity): Promise<Entity> {
    const queryRes = await handleExecuteSqlStatement<{ entity: Entity }>(
      {
        text: 'INSERT INTO entity (id, creDtTm, tenantid) VALUES ($1,$2,$3) RETURNING id, credttm as "creDtTm";',
        values: [payload.id, payload.creDtTm, payload.TenantId],
      } satisfies PgQueryConfig,
      'event_history',
    );
    return queryRes.rows[0].entity;
  },

  update: async function ({ id, tenantId }, payload: Entity): Promise<Entity | null> {
    const queryRes = await handleExecuteSqlStatement<Entity>(
      {
        text: 'UPDATE entity SET id = $1, creDtTm = $2, tenantid = $3 WHERE id = $4 AND tenantid = $5 RETURNING id, credttm AS "creDtTm", tenantid;',
        values: [payload.id, payload.creDtTm, payload.TenantId, id, tenantId],
      } satisfies PgQueryConfig,
      'event_history',
    );
    return queryRes.rowCount ? queryRes.rows[0] : null;
  },

  remove: async function ({ id, tenantId }): Promise<boolean> {
    const queryRes = await handleExecuteSqlStatement<Entity>(
      {
        text: 'DELETE FROM entity WHERE id = $1 AND tenantid = $2;',
        values: [id, tenantId],
      } satisfies PgQueryConfig,
      'event_history',
    );
    return queryRes.rowCount ? true : false;
  },
};
