import { Type, type Static } from '@sinclair/typebox';
import { DataCache } from './DataCache';

type DbtrFinSvcsPrvdrFeesClass = Static<typeof DbtrFinSvcsPrvdrFeesClass>;
const DbtrFinSvcsPrvdrFeesClass = Type.Object({
  Amt: Type.String(),
  Ccy: Type.String(),
});

type EqvtAmt = Static<typeof EqvtAmt>;
const EqvtAmt = Type.Object({
  Amt: DbtrFinSvcsPrvdrFeesClass,
  CcyOfTrf: Type.String(),
  XchgRate: Type.Optional(Type.Number()),
});

type InstdAmt = Static<typeof InstdAmt>;
const InstdAmt = Type.Object({
  Amt: DbtrFinSvcsPrvdrFeesClass,
});

type Amt = Static<typeof Amt>;
const Amt = Type.Object({
  InstdAmt,
  EqvtAmt,
});

type CtgyPurp = Static<typeof CtgyPurp>;
const CtgyPurp = Type.Object({
  Prtry: Type.String(),
});

type Othr = Static<typeof Othr>;
const Othr = Type.Object({
  Id: Type.String(),
  SchmeNm: CtgyPurp,
});

type DbtrAcctID = Static<typeof DbtrAcctID>;
const DbtrAcctID = Type.Object({
  Othr: Type.Array(Othr),
});

type TrAcct = Static<typeof TrAcct>;
const TrAcct = Type.Object({
  Id: DbtrAcctID,
  Nm: Type.String(),
});

type CLRSysMmbID = Static<typeof CLRSysMmbID>;
const CLRSysMmbID = Type.Object({
  MmbId: Type.String(),
});

type FinInstnID = Static<typeof FinInstnID>;
const FinInstnID = Type.Object({
  ClrSysMmbId: CLRSysMmbID,
});

type TrAgt = Static<typeof TrAgt>;
const TrAgt = Type.Object({
  FinInstnId: FinInstnID,
});

type PmtID = Static<typeof PmtID>;
const PmtID = Type.Object({
  EndToEndId: Type.String(),
});

type PmtTpInf = Static<typeof PmtTpInf>;
const PmtTpInf = Type.Object({
  CtgyPurp,
});

type Purp = Static<typeof Purp>;
const Purp = Type.Object({
  Cd: Type.String(),
});

type Dtls = Static<typeof Dtls>;
const Dtls = Type.Object({
  Tp: Type.String(),
  Cd: Type.String(),
});

type RgltryRptg = Static<typeof RgltryRptg>;
const RgltryRptg = Type.Object({
  Dtls,
});

type RmtInf = Static<typeof RmtInf>;
const RmtInf = Type.Object({
  Ustrd: Type.String(),
});

type Cdtr = Static<typeof Cdtr>;
const Cdtr = Type.Object({
  FrstNm: Type.String(),
  MddlNm: Type.String(),
  LastNm: Type.String(),
  MrchntClssfctnCd: Type.String(),
});

type PurpleDoc = Static<typeof PurpleDoc>;
const PurpleDoc = Type.Object({
  Dbtr: Cdtr,
  Cdtr,
  DbtrFinSvcsPrvdrFees: DbtrFinSvcsPrvdrFeesClass,
  Xprtn: Type.String(),
});

type PurpleEnvlp = Static<typeof PurpleEnvlp>;
const PurpleEnvlp = Type.Object({
  Doc: PurpleDoc,
});

type CdtTrfTxInfSplmtryData = Static<typeof CdtTrfTxInfSplmtryData>;
const CdtTrfTxInfSplmtryData = Type.Object({
  Envlp: PurpleEnvlp,
});

type DbtAdvc = Static<typeof DbtAdvc>;
const DbtAdvc = Type.Object({
  Cd: Type.String(),
  Prtry: Type.String(),
});

type ReqdAdvcTp = Static<typeof ReqdAdvcTp>;
const ReqdAdvcTp = Type.Object({
  DbtAdvc,
});

type Glctn = Static<typeof Glctn>;
const Glctn = Type.Object({
  Lat: Type.String(),
  Long: Type.String(),
});

type DocInitgPty = Static<typeof DocInitgPty>;
const DocInitgPty = Type.Object({
  InitrTp: Type.String(),
  Glctn,
});

type FluffyDoc = Static<typeof FluffyDoc>;
const FluffyDoc = Type.Object({
  InitgPty: DocInitgPty,
});

type FluffyEnvlp = Static<typeof FluffyEnvlp>;
const FluffyEnvlp = Type.Object({
  Doc: FluffyDoc,
});

type CstmrCdtTrfInitnSplmtryData = Static<typeof CstmrCdtTrfInitnSplmtryData>;
const CstmrCdtTrfInitnSplmtryData = Type.Object({
  Envlp: FluffyEnvlp,
});

type CtctDtls = Static<typeof CtctDtls>;
const CtctDtls = Type.Object({
  MobNb: Type.String(),
});

type DtAndPLCOfBirth = Static<typeof DtAndPLCOfBirth>;
const DtAndPLCOfBirth = Type.Object({
  BirthDt: Type.String(),
  CityOfBirth: Type.String(),
  CtryOfBirth: Type.String(),
});

type PrvtID = Static<typeof PrvtID>;
const PrvtID = Type.Object({
  DtAndPlcOfBirth: DtAndPLCOfBirth,
  Othr: Type.Array(Othr),
});
type InitgPtyID = Static<typeof InitgPtyID>;
const InitgPtyID = Type.Object({
  PrvtId: PrvtID,
});

type InitgPty = Static<typeof InitgPty>;
const InitgPty = Type.Object({
  Nm: Type.String(),
  Id: InitgPtyID,
  CtctDtls,
});
type GrpHdr = Static<typeof GrpHdr>;
const GrpHdr = Type.Object({
  MsgId: Type.String(),
  CreDtTm: Type.String(),
  NbOfTxs: Type.Number(),
  InitgPty,
});

type CdtTrfTxInf = Static<typeof CdtTrfTxInf>;
const CdtTrfTxInf = Type.Object({
  PmtId: PmtID,
  PmtTpInf,
  Amt,
  ChrgBr: Type.String(),
  CdtrAgt: TrAgt,
  Cdtr: InitgPty,
  CdtrAcct: TrAcct,
  Purp,
  RgltryRptg,
  RmtInf,
  SplmtryData: CdtTrfTxInfSplmtryData,
});
type ReqdExctnDt = Static<typeof ReqdExctnDt>;
const ReqdExctnDt = Type.Object({
  Dt: Type.String(),
  DtTm: Type.String(),
});

type PmtInf = Static<typeof PmtInf>;
const PmtInf = Type.Object({
  PmtInfId: Type.String(),
  PmtMtd: Type.String(),
  ReqdAdvcTp,
  ReqdExctnDt,
  Dbtr: InitgPty,
  DbtrAcct: TrAcct,
  DbtrAgt: TrAgt,
  CdtTrfTxInf,
});

type CstmrCdtTrfInitn = Static<typeof CstmrCdtTrfInitn>;
const CstmrCdtTrfInitn = Type.Object({
  GrpHdr,
  PmtInf,
  SplmtryData: CstmrCdtTrfInitnSplmtryData,
});

export type Pain001Schema = Static<typeof Pain001Schema>;
export const Pain001Schema = Type.Object({
  TxTp: Type.String(),
  TenantId: Type.Optional(Type.String({ default: 'DEFAULT' })),
  CstmrCdtTrfInitn,
  DataCache: Type.Optional(DataCache),
});
