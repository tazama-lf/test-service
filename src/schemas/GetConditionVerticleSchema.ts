import { Type, type Static } from '@sinclair/typebox';

enum VertexType {
  Entity = 'entity',
  Account = 'account',
}

export const VerticleSchema = Type.Object({
  id: Type.String(),
  type: Type.Enum(VertexType),
});

export type VerticleSchema = Static<typeof VerticleSchema>;
