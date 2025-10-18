// SPDX-License-Identifier: Apache-2.0
import type { FastifyInstance } from 'fastify';
import {
  AccountHolderRepo,
  AccountRepo,
  ConditionRepo,
  EntityRepo,
  EvaluationRepo,
  GovernedAsCreditorAccountByRepo,
  GovernedAsCreditorByRepo,
  GovernedAsDebtorAccountByRepo,
  GovernedAsDebtorByRepo,
  Pacs002Repo,
  Pacs008Repo,
  Pain001Repo,
  Pain013Repo,
  TransactionRepo,
} from './repositories';
import {
  AccountHolderSchema,
  AccountSchema,
  ConditionSchema,
  EdgeSchema,
  EntitySchema,
  Pacs002Schema,
  Pacs008Schema,
  Pain001Schema,
  Pain013Schema,
  ReportSchema,
  TransactionRelationshipSchema,
  VerticleSchema,
} from './schemas';
import { buildCrudPlugin } from './utils/crud-schema';
import { GetConditionsFromDBPostRequest, GetActiveConditionsFromDBPostRequest } from './utils/verticals.get.query';

function Routes(fastify: FastifyInstance): void {
  fastify.get('/', () => 'UP');
  fastify.get('/health', () => 'UP');

  //-- test utilities
  fastify.get(
    '/v1/test/util/conditions/edges/:id/:type',
    {
      schema: {
        tags: ['utils'],
        params: VerticleSchema,
      },
    },
    GetConditionsFromDBPostRequest,
  );
  fastify.get(
    '/v1/test/util/active/conditions/edges/:id/:type',
    {
      schema: {
        tags: ['utils'],
        params: VerticleSchema,
      },
    },
    GetActiveConditionsFromDBPostRequest,
  );
  //-- evaluation
  fastify.register(
    buildCrudPlugin({
      prefix: '/v1/test/evaluation/evaluation',
      repo: EvaluationRepo,
      schemas: { Entity: ReportSchema, Create: ReportSchema, Update: ReportSchema },
    }),
  );

  //-- raw_history
  fastify.register(
    buildCrudPlugin({
      prefix: '/v1/test/raw_history/pain001',
      repo: Pain001Repo,
      schemas: { Entity: Pain001Schema, Create: Pain001Schema, Update: Pain001Schema },
    }),
  );

  fastify.register(
    buildCrudPlugin({
      prefix: '/v1/test/raw_history/pain013',
      repo: Pain013Repo,
      schemas: { Entity: Pain013Schema, Create: Pain013Schema, Update: Pain013Schema },
    }),
  );

  fastify.register(
    buildCrudPlugin({
      prefix: '/v1/test/raw_history/pacs008',
      repo: Pacs008Repo,
      schemas: { Entity: Pacs008Schema, Create: Pacs008Schema, Update: Pacs008Schema },
    }),
  );

  fastify.register(
    buildCrudPlugin({
      prefix: '/v1/test/raw_history/pacs002',
      repo: Pacs002Repo,
      schemas: { Entity: Pacs002Schema, Create: Pacs002Schema, Update: Pacs002Schema },
    }),
  );

  //-- event_history
  fastify.register(
    buildCrudPlugin({
      prefix: '/v1/test/event_history/account',
      repo: AccountRepo,
      schemas: { Entity: AccountSchema, Create: AccountSchema, Update: AccountSchema },
    }),
  );

  fastify.register(
    buildCrudPlugin({
      prefix: '/v1/test/event_history/account_holder',
      repo: AccountHolderRepo,
      schemas: { Entity: AccountHolderSchema, Create: AccountHolderSchema, Update: AccountHolderSchema },
      idParam: { kind: 'composite', names: ['source', 'destination'] },
    }),
  );

  fastify.register(
    buildCrudPlugin({
      prefix: '/v1/test/event_history/entity',
      repo: EntityRepo,
      schemas: { Entity: EntitySchema, Create: EntitySchema, Update: EntitySchema },
    }),
  );

  fastify.register(
    buildCrudPlugin({
      prefix: '/v1/test/event_history/transaction',
      repo: TransactionRepo,
      schemas: { Entity: TransactionRelationshipSchema, Create: TransactionRelationshipSchema, Update: TransactionRelationshipSchema },
    }),
  );

  //-- event_history: event-flow
  fastify.register(
    buildCrudPlugin({
      prefix: '/v1/test/event_history/condition',
      repo: ConditionRepo,
      schemas: { Entity: ConditionSchema, Create: ConditionSchema, Update: ConditionSchema },
    }),
  );

  fastify.register(
    buildCrudPlugin({
      prefix: '/v1/test/event_history/governed_as_creditor_account_by',
      repo: GovernedAsCreditorAccountByRepo,
      schemas: { Entity: EdgeSchema, Create: EdgeSchema, Update: EdgeSchema },
      idParam: { kind: 'composite', names: ['source', 'destination'] },
    }),
  );

  fastify.register(
    buildCrudPlugin({
      prefix: '/v1/test/event_history/governed_as_creditor_by',
      repo: GovernedAsCreditorByRepo,
      schemas: { Entity: EdgeSchema, Create: EdgeSchema, Update: EdgeSchema },
      idParam: { kind: 'composite', names: ['source', 'destination'] },
    }),
  );

  fastify.register(
    buildCrudPlugin({
      prefix: '/v1/test/event_history/governed_as_debtor_account_by',
      repo: GovernedAsDebtorAccountByRepo,
      schemas: { Entity: EdgeSchema, Create: EdgeSchema, Update: EdgeSchema },
      idParam: { kind: 'composite', names: ['source', 'destination'] },
    }),
  );

  fastify.register(
    buildCrudPlugin({
      prefix: '/v1/test/event_history/governed_as_debtor_by',
      repo: GovernedAsDebtorByRepo,
      schemas: { Entity: EdgeSchema, Create: EdgeSchema, Update: EdgeSchema },
      idParam: { kind: 'composite', names: ['source', 'destination'] },
    }),
  );
}

export default Routes;
