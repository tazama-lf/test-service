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
  ReportSchema,
  TransactionRelationshipSchema,
} from './schemas/typebox.schemas';
import { buildCrudPlugin } from './utils/crud-schema';

function Routes(fastify: FastifyInstance): void {
  fastify.get('/', () => 'UP');
  fastify.get('/health', () => 'UP');
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
      prefix: '/v1/test/raw_history/pacs002',
      repo: Pacs002Repo,
      schemas: { Entity: Pacs002Schema, Create: Pacs002Schema, Update: Pacs002Schema },
    }),
  );

  fastify.register(
    buildCrudPlugin({
      prefix: '/v1/test/raw_history/pacs008',
      repo: Pacs008Repo,
      schemas: { Entity: Pacs008Schema, Create: Pacs008Schema, Update: Pacs008Schema },
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
