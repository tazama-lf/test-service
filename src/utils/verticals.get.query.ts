import type { PgQueryConfig } from '@tazama-lf/frms-coe-lib';
import handleExecuteSqlStatement from '../database.logic.service';
import type { FastifyRequest, FastifyReply } from 'fastify';

const GetConditionsFromDBPostRequest = async (req: FastifyRequest, reply: FastifyReply): Promise<object | undefined> => {
  const request = req.params as { id: string; type: 'entity' | 'account' };
  const queryRes = await handleExecuteSqlStatement(
    {
      text: `
              WITH RECURSIVE
              params AS (
                SELECT lower($1)::text AS src_type, $2::text AS src_id
              ),
              edges_all AS (
                -- Unify the four governed_* tables into a typed edge list
                SELECT 'governed_as_debtor_by'::text AS edge_type,
                       'entity'::text  AS src_type, g.source AS src_id,
                       'condition'::text AS dst_type, g.destination AS dst_id,
                       g.source, g.destination, g.evtTp, g.incptnDtTm, g.xprtnDtTm
                FROM governed_as_debtor_by g
                UNION ALL
                SELECT 'governed_as_debtor_account_by',
                       'account', g.source, 'condition', g.destination,
                       g.source, g.destination, g.evtTp, g.incptnDtTm, g.xprtnDtTm
                FROM governed_as_debtor_account_by g
                UNION ALL
                SELECT 'governed_as_creditor_by',
                       'entity', g.source, 'condition', g.destination,
                       g.source, g.destination, g.evtTp, g.incptnDtTm, g.xprtnDtTm
                FROM governed_as_creditor_by g
                UNION ALL
                SELECT 'governed_as_creditor_account_by',
                       'account', g.source, 'condition', g.destination,
                       g.source, g.destination, g.evtTp, g.incptnDtTm, g.xprtnDtTm
                FROM governed_as_creditor_account_by g
              ),
              -- Graph walk: ANY direction, up to depth 2 (exclude depth 0)
              walk AS (
                -- seed (depth 0)
                SELECT p.src_type AS v_type,
                       p.src_id   AS v_id,
                       NULL::text AS edge_type,
                       NULL::text AS e_source,
                       NULL::text AS e_destination,
                       0          AS depth,
                       ARRAY[p.src_type || ':' || p.src_id]::text[] AS visited
                FROM params p

                UNION ALL

                -- expand (depth 1..2)
                SELECT
                  CASE WHEN (e.src_type = w.v_type AND e.src_id = w.v_id)
                       THEN e.dst_type ELSE e.src_type END     AS v_type,
                  CASE WHEN (e.src_type = w.v_type AND e.src_id = w.v_id)
                       THEN e.dst_id   ELSE e.src_id   END     AS v_id,
                  e.edge_type                                       AS edge_type,
                  e.source                                          AS e_source,
                  e.destination                                     AS e_destination,
                  w.depth + 1                                       AS depth,
                  w.visited || (
                    CASE WHEN (e.src_type = w.v_type AND e.src_id = w.v_id)
                         THEN e.dst_type || ':' || e.dst_id
                         ELSE e.src_type || ':' || e.src_id
                    END
                  )
                FROM walk w
                JOIN edges_all e
                  ON (e.src_type = w.v_type AND e.src_id = w.v_id)
                  OR (e.dst_type = w.v_type AND e.dst_id = w.v_id)
                WHERE w.depth < 2
                  AND NOT (
                    CASE WHEN (e.src_type = w.v_type AND e.src_id = w.v_id)
                         THEN e.dst_type || ':' || e.dst_id
                         ELSE e.src_type || ':' || e.src_id
                    END
                  ) = ANY (w.visited)
              ),
              -- vertices reached at depth 1..2
              verts AS (
                SELECT DISTINCT v_type, v_id
                FROM walk
                WHERE depth BETWEEN 1 AND 2
              ),
              -- edges used at depth 1..2 (distinct by table + (source,destination))
              edge_keys AS (
                SELECT DISTINCT edge_type, e_source AS source, e_destination AS destination
                FROM walk
                WHERE depth BETWEEN 1 AND 2
              ),
              edges_used AS (
                SELECT ea.edge_type, ea.source, ea.destination, ea.evtTp, ea.incptnDtTm, ea.xprtnDtTm
                FROM edge_keys k
                JOIN edges_all ea
                  ON ea.edge_type = k.edge_type
                 AND ea.source    = k.source
                 AND ea.destination = k.destination
              ),
              -- build JSON for vertices (typed rows from each table)
              v_json AS (
                SELECT COALESCE(
                  (
                    SELECT jsonb_agg(vdoc) FROM (
                      SELECT jsonb_build_object(
                               'type','entity',
                               'id', e.id,
                               'creDtTm', e.creDtTm
                             ) AS vdoc
                      FROM verts v
                      JOIN entity e ON v.v_type = 'entity' AND e.id = v.v_id

                      UNION ALL

                      SELECT jsonb_build_object(
                               'type','account',
                               'id', a.id
                             )
                      FROM verts v
                      JOIN account a ON v.v_type = 'account' AND a.id = v.v_id

                      UNION ALL

                      SELECT jsonb_build_object(
                               'type','condition',
                               'id', c.id,
                               'condition', c.condition
                             )
                      FROM verts v
                      JOIN "condition" c ON v.v_type = 'condition' AND c.id = v.v_id
                    ) s
                  ),
                  '[]'::jsonb
                ) AS data
              ),
              -- build JSON for edges (include table name + columns)
              e_json AS (
                SELECT COALESCE(
                  jsonb_agg(
                    jsonb_build_object(
                      'edge_type', edge_type,
                      'source', source,
                      'destination', destination,
                      'evtTp', evtTp,
                      'incptnDtTm', incptnDtTm,
                      'xprtnDtTm', xprtnDtTm
                    )
                  ),
                  '[]'::jsonb
                ) AS data
                FROM edges_used
              )
              SELECT jsonb_build_object('v', v_json.data, 'e', e_json.data) AS result
              FROM v_json, e_json;`,
      values: [request.type, request.id],
    } satisfies PgQueryConfig,
    'event_history',
  );
  return queryRes.rows.length > 0 ? (queryRes.rows[0].result as object) : undefined;
};

const GetActiveConditionsFromDBPostRequest = async (req: FastifyRequest, reply: FastifyReply): Promise<object | undefined> => {
  const request = req.params as { id: string; type: 'entity' | 'account' };
  const queryRes = await handleExecuteSqlStatement(
    {
      text: `WITH RECURSIVE
  params AS (
    SELECT lower($1)::text AS src_type, $2::text AS src_id
  ),
  edges_all AS (
    -- Unify the four governed_* tables into a typed edge list
    SELECT 'governed_as_debtor_by'::text AS edge_type,
           'entity'::text  AS src_type, g.source AS src_id,
           'condition'::text AS dst_type, g.destination AS dst_id,
           g.source, g.destination, g.evtTp, g.incptnDtTm, g.xprtnDtTm
    FROM governed_as_debtor_by g
    UNION ALL
    SELECT 'governed_as_debtor_account_by',
           'account', g.source, 'condition', g.destination,
           g.source, g.destination, g.evtTp, g.incptnDtTm, g.xprtnDtTm
    FROM governed_as_debtor_account_by g
    UNION ALL
    SELECT 'governed_as_creditor_by',
           'entity', g.source, 'condition', g.destination,
           g.source, g.destination, g.evtTp, g.incptnDtTm, g.xprtnDtTm
    FROM governed_as_creditor_by g
    UNION ALL
    SELECT 'governed_as_creditor_account_by',
           'account', g.source, 'condition', g.destination,
           g.source, g.destination, g.evtTp, g.incptnDtTm, g.xprtnDtTm
    FROM governed_as_creditor_account_by g
  ),
  -- Graph walk: ANY direction, up to depth 2 (exclude depth 0),
  -- and require that ALL edges in the path have xprtnDtTm > now()
  walk AS (
    -- seed (depth 0)
    SELECT p.src_type AS v_type,
           p.src_id   AS v_id,
           NULL::text AS edge_type,
           NULL::text AS e_source,
           NULL::text AS e_destination,
           0          AS depth,
           ARRAY[p.src_type || ':' || p.src_id]::text[] AS visited,
           TRUE::boolean AS valid
    FROM params p

    UNION ALL

    -- expand (depth 1..2)
    SELECT
      CASE WHEN (e.src_type = w.v_type AND e.src_id = w.v_id)
           THEN e.dst_type ELSE e.src_type END     AS v_type,
      CASE WHEN (e.src_type = w.v_type AND e.src_id = w.v_id)
           THEN e.dst_id   ELSE e.src_id   END     AS v_id,
      e.edge_type                                       AS edge_type,
      e.source                                          AS e_source,
      e.destination                                     AS e_destination,
      w.depth + 1                                       AS depth,
      w.visited || (
        CASE WHEN (e.src_type = w.v_type AND e.src_id = w.v_id)
             THEN e.dst_type || ':' || e.dst_id
             ELSE e.src_type || ':' || e.src_id
        END
      )                                                 AS visited,
      (w.valid AND e.xprtnDtTm > now())                 AS valid
    FROM walk w
    JOIN edges_all e
      ON (e.src_type = w.v_type AND e.src_id = w.v_id)
      OR (e.dst_type = w.v_type AND e.dst_id = w.v_id)
    WHERE w.depth < 2
      AND NOT (
        CASE WHEN (e.src_type = w.v_type AND e.src_id = w.v_id)
             THEN e.dst_type || ':' || e.dst_id
             ELSE e.src_type || ':' || e.src_id
        END
      ) = ANY (w.visited)
  ),
  -- vertices reached at depth 1..2 (only from valid paths)
  verts AS (
    SELECT DISTINCT v_type, v_id
    FROM walk
    WHERE depth BETWEEN 1 AND 2
      AND valid
  ),
  -- edges used at depth 1..2 (distinct by table + (source,destination)) from valid paths
  edge_keys AS (
    SELECT DISTINCT edge_type, e_source AS source, e_destination AS destination
    FROM walk
    WHERE depth BETWEEN 1 AND 2
      AND valid
  ),
  edges_used AS (
    SELECT ea.edge_type, ea.source, ea.destination, ea.evtTp, ea.incptnDtTm, ea.xprtnDtTm
    FROM edge_keys k
    JOIN edges_all ea
      ON ea.edge_type = k.edge_type
     AND ea.source    = k.source
     AND ea.destination = k.destination
  ),
  -- build JSON for vertices (typed rows from each table)
  v_json AS (
    SELECT COALESCE(
      (
        SELECT jsonb_agg(vdoc) FROM (
          SELECT jsonb_build_object(
                   'type','entity',
                   'id', e.id,
                   'creDtTm', e.creDtTm
                 ) AS vdoc
          FROM verts v
          JOIN entity e ON v.v_type = 'entity' AND e.id = v.v_id

          UNION ALL

          SELECT jsonb_build_object(
                   'type','account',
                   'id', a.id
                 )
          FROM verts v
          JOIN account a ON v.v_type = 'account' AND a.id = v.v_id

          UNION ALL

          SELECT jsonb_build_object(
                   'type','condition',
                   'id', c.id,
                   'condition', c.condition
                 )
          FROM verts v
          JOIN "condition" c ON v.v_type = 'condition' AND c.id = v.v_id
        ) s
      ),
      '[]'::jsonb
    ) AS data
  ),
  -- build JSON for edges
  e_json AS (
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'edge_type', edge_type,
          'source', source,
          'destination', destination,
          'evtTp', evtTp,
          'incptnDtTm', incptnDtTm,
          'xprtnDtTm', xprtnDtTm
        )
      ),
      '[]'::jsonb
    ) AS data
    FROM edges_used
  )
SELECT jsonb_build_object('v', v_json.data, 'e', e_json.data) AS result
FROM v_json, e_json;
`,
      values: [request.type, request.id],
    } satisfies PgQueryConfig,
    'event_history',
  );
  return queryRes.rows.length > 0 ? (queryRes.rows[0].result as object) : undefined;
};
export { GetConditionsFromDBPostRequest, GetActiveConditionsFromDBPostRequest };
