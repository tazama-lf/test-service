// SPDX-License-Identifier: Apache-2.0
import type { PgQueryConfig } from '@tazama-lf/frms-coe-lib';
import type { Edge } from '@tazama-lf/frms-coe-lib/lib/interfaces';
import handleExecuteSqlStatement from '../../database.logic.service';
import type { Connector, CrudRepository } from '../repository.base';

export const GovernedAsCreditorAccountByRepo: CrudRepository<Edge, Connector> = {
  list: async function ({ limit, offset, sort, order, tenantId }): Promise<{ data: Edge[]; total: number }> {
    sort ??= 'id';
    const queryRes = await handleExecuteSqlStatement<{ edge: Edge }>(
      {
        text: `SELECT * FROM governed_as_creditor_account_by WHERE tenantId = $3 ORDER BY ${sort} ${order} OFFSET $1 LIMIT $2;`,
        values: [offset, limit, tenantId],
      },
      'event_history',
    );

    return queryRes.rows.length > 0
      ? { data: queryRes.rows.map((values) => values.edge), total: queryRes.rowCount! }
      : { data: [], total: 0 };
  },

  get: async function ({ source, destination, tenantId }): Promise<Edge | null> {
    const queryRes = await handleExecuteSqlStatement<{ edge: Edge }>(
      {
        text: 'SELECT * FROM governed_as_creditor_account_by WHERE source = $1 AND destination = $2 AND tenantid = $3;',
        values: [source, destination, tenantId],
      } satisfies PgQueryConfig,
      'event_history',
    );

    return queryRes.rows.length > 0 ? queryRes.rows[0].edge : null;
  },

  create: async function (payload: Edge): Promise<Edge> {
    const queryRes = await handleExecuteSqlStatement<{ edge: Edge }>(
      {
        text: 'INSERT INTO governed_as_creditor_account_by (source, destination, evttp, incptndttm, xprtndttm, tenantid) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *;',
        values: [payload.source, payload.destination, payload.evtTp, payload.incptnDtTm, payload.xprtnDtTm, payload.tenantId],
      } satisfies PgQueryConfig,
      'event_history',
    );
    return queryRes.rows[0].edge;
  },

  update: async function ({ source, destination, tenantId }, payload: Edge): Promise<Edge | null> {
    const queryRes = await handleExecuteSqlStatement<{ edge: Edge }>(
      {
        text: 'UPDATE governed_as_creditor_account_by SET source = $1, destination = $2, evttp = $3, incptndttm = $4, xprtndttm = $5 WHERE source = $6 AND destination = $7 AND tenantid = $8 RETURNING *;',
        values: [payload.source, payload.destination, payload.evtTp, payload.incptnDtTm, payload.xprtnDtTm, source, destination, tenantId],
      } satisfies PgQueryConfig,
      'event_history',
    );
    return queryRes.rowCount ? queryRes.rows[0].edge : null;
  },

  remove: async function ({ source, destination, tenantId }): Promise<boolean> {
    const queryRes = await handleExecuteSqlStatement<{ edge: Edge }>(
      {
        text: 'DELETE FROM governed_as_creditor_account_by WHERE source = $1 AND destination = $2 AND tenantid = $3;',
        values: [source, destination, tenantId],
      } satisfies PgQueryConfig,
      'event_history',
    );
    return queryRes.rowCount ? true : false;
  },
};

export const GovernedAsCreditorByRepo: CrudRepository<Edge, Connector> = {
  list: async function ({ limit, offset, sort, order, tenantId }): Promise<{ data: Edge[]; total: number }> {
    sort ??= 'id';
    const queryRes = await handleExecuteSqlStatement<{ edge: Edge }>(
      {
        text: `SELECT * FROM governed_as_creditor_by WHERE tenantId = $3 ORDER BY ${sort} ${order} OFFSET $1 LIMIT $2;`,
        values: [offset, limit, tenantId],
      },
      'event_history',
    );

    return queryRes.rows.length > 0
      ? { data: queryRes.rows.map((values) => values.edge), total: queryRes.rowCount! }
      : { data: [], total: 0 };
  },

  get: async function ({ source, destination, tenantId }): Promise<Edge | null> {
    const queryRes = await handleExecuteSqlStatement<{ edge: Edge }>(
      {
        text: 'SELECT * FROM governed_as_creditor_by WHERE source = $1 AND destination = $2 AND tenantid = $3;',
        values: [source, destination, tenantId],
      } satisfies PgQueryConfig,
      'event_history',
    );

    return queryRes.rows.length > 0 ? queryRes.rows[0].edge : null;
  },

  create: async function (payload: Edge): Promise<Edge> {
    const queryRes = await handleExecuteSqlStatement<{ edge: Edge }>(
      {
        text: 'INSERT INTO governed_as_creditor_by (source, destination, evttp, incptndttm, xprtndttm, tenantid) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *;',
        values: [payload.source, payload.destination, payload.evtTp, payload.incptnDtTm, payload.xprtnDtTm, payload.tenantId],
      } satisfies PgQueryConfig,
      'event_history',
    );
    return queryRes.rows[0].edge;
  },

  update: async function ({ source, destination, tenantId }, payload: Edge): Promise<Edge | null> {
    const queryRes = await handleExecuteSqlStatement<{ edge: Edge }>(
      {
        text: 'UPDATE governed_as_creditor_by SET source = $1, destination = $2, evttp = $3, incptndttm = $4, xprtndttm = $5 WHERE source = $6 AND destination = $7 AND tenantid = $8 RETURNING *;',
        values: [payload.source, payload.destination, payload.evtTp, payload.incptnDtTm, payload.xprtnDtTm, source, destination, tenantId],
      } satisfies PgQueryConfig,
      'event_history',
    );
    return queryRes.rowCount ? queryRes.rows[0].edge : null;
  },

  remove: async function ({ source, destination, tenantId }): Promise<boolean> {
    const queryRes = await handleExecuteSqlStatement<{ edge: Edge }>(
      {
        text: 'DELETE FROM governed_as_creditor_by WHERE source = $1 AND destination = $2 AND tenantid = $3;',
        values: [source, destination, tenantId],
      } satisfies PgQueryConfig,
      'event_history',
    );
    return queryRes.rowCount ? true : false;
  },
};

export const GovernedAsDebtorAccountByRepo: CrudRepository<Edge, Connector> = {
  list: async function ({ limit, offset, sort, order, tenantId }): Promise<{ data: Edge[]; total: number }> {
    sort ??= 'id';
    const queryRes = await handleExecuteSqlStatement<{ edge: Edge }>(
      {
        text: `SELECT * FROM governed_as_debtor_account_by WHERE tenantId = $3 ORDER BY ${sort} ${order} OFFSET $1 LIMIT $2;`,
        values: [offset, limit, tenantId],
      },
      'event_history',
    );

    return queryRes.rows.length > 0
      ? { data: queryRes.rows.map((values) => values.edge), total: queryRes.rowCount! }
      : { data: [], total: 0 };
  },

  get: async function ({ source, destination, tenantId }): Promise<Edge | null> {
    const queryRes = await handleExecuteSqlStatement<{ edge: Edge }>(
      {
        text: 'SELECT * FROM governed_as_debtor_account_by WHERE source = $1 AND destination = $2 AND tenantid = $3;',
        values: [source, destination, tenantId],
      } satisfies PgQueryConfig,
      'event_history',
    );

    return queryRes.rows.length > 0 ? queryRes.rows[0].edge : null;
  },

  create: async function (payload: Edge): Promise<Edge> {
    const queryRes = await handleExecuteSqlStatement<{ edge: Edge }>(
      {
        text: 'INSERT INTO governed_as_debtor_account_by (source, destination, evttp, incptndttm, xprtndttm, tenantid) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *;',
        values: [payload.source, payload.destination, payload.evtTp, payload.incptnDtTm, payload.xprtnDtTm, payload.tenantId],
      } satisfies PgQueryConfig,
      'event_history',
    );
    return queryRes.rows[0].edge;
  },

  update: async function ({ source, destination, tenantId }, payload: Edge): Promise<Edge | null> {
    const queryRes = await handleExecuteSqlStatement<{ edge: Edge }>(
      {
        text: 'UPDATE governed_as_debtor_account_by SET source = $1, destination = $2, evttp = $3, incptndttm = $4, xprtndttm = $5 WHERE source = $6 AND destination = $7 AND tenantid = $8 RETURNING *;',
        values: [payload.source, payload.destination, payload.evtTp, payload.incptnDtTm, payload.xprtnDtTm, source, destination, tenantId],
      } satisfies PgQueryConfig,
      'event_history',
    );
    return queryRes.rowCount ? queryRes.rows[0].edge : null;
  },

  remove: async function ({ source, destination, tenantId }): Promise<boolean> {
    const queryRes = await handleExecuteSqlStatement<{ edge: Edge }>(
      {
        text: 'DELETE FROM governed_as_debtor_account_by WHERE source = $1 AND destination = $2 AND tenantid = $3;',
        values: [source, destination, tenantId],
      } satisfies PgQueryConfig,
      'event_history',
    );
    return queryRes.rowCount ? true : false;
  },
};

export const GovernedAsDebtorByRepo: CrudRepository<Edge, Connector> = {
  list: async function ({ limit, offset, sort, order, tenantId }): Promise<{ data: Edge[]; total: number }> {
    sort ??= 'id';
    const queryRes = await handleExecuteSqlStatement<{ edge: Edge }>(
      {
        text: `SELECT * FROM governed_as_debtor_by WHERE tenantId = $3 ORDER BY ${sort} ${order} OFFSET $1 LIMIT $2;`,
        values: [offset, limit, tenantId],
      },
      'event_history',
    );

    return queryRes.rows.length > 0
      ? { data: queryRes.rows.map((values) => values.edge), total: queryRes.rowCount! }
      : { data: [], total: 0 };
  },

  get: async function ({ source, destination, tenantId }): Promise<Edge | null> {
    const queryRes = await handleExecuteSqlStatement<{ edge: Edge }>(
      {
        text: 'SELECT * FROM governed_as_debtor_by WHERE source = $1 AND destination = $2 AND tenantid = $3;',
        values: [source, destination, tenantId],
      } satisfies PgQueryConfig,
      'event_history',
    );

    return queryRes.rows.length > 0 ? queryRes.rows[0].edge : null;
  },

  create: async function (payload: Edge): Promise<Edge> {
    const queryRes = await handleExecuteSqlStatement<{ edge: Edge }>(
      {
        text: 'INSERT INTO governed_as_debtor_by (source, destination, evttp, incptndttm, xprtndttm, tenantid) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *;',
        values: [payload.source, payload.destination, payload.evtTp, payload.incptnDtTm, payload.xprtnDtTm, payload.tenantId],
      } satisfies PgQueryConfig,
      'event_history',
    );
    return queryRes.rows[0].edge;
  },

  update: async function ({ source, destination, tenantId }, payload: Edge): Promise<Edge | null> {
    const queryRes = await handleExecuteSqlStatement<{ edge: Edge }>(
      {
        text: 'UPDATE governed_as_debtor_by SET source = $1, destination = $2, evttp = $3, incptndttm = $4, xprtndttm = $5 WHERE source = $6 AND destination = $7 AND tenantid = $8 RETURNING *;',
        values: [payload.source, payload.destination, payload.evtTp, payload.incptnDtTm, payload.xprtnDtTm, source, destination, tenantId],
      } satisfies PgQueryConfig,
      'event_history',
    );
    return queryRes.rowCount ? queryRes.rows[0].edge : null;
  },

  remove: async function ({ source, destination, tenantId }): Promise<boolean> {
    const queryRes = await handleExecuteSqlStatement<{ edge: Edge }>(
      {
        text: 'DELETE FROM governed_as_debtor_by WHERE source = $1 AND destination = $2 AND tenantid = $3;',
        values: [source, destination, tenantId],
      } satisfies PgQueryConfig,
      'event_history',
    );
    return queryRes.rowCount ? queryRes.rowCount > 0 : false;
  },
};
