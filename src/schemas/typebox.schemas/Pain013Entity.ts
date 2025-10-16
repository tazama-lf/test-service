import { Type, type Static } from '@sinclair/typebox';
import { DataCache } from './DataCache';

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

type CtgyPurp = Static<typeof CtgyPurp>;
const CtgyPurp = Type.Object({
  Prtry: Type.String(),
});

type PrvtIDOthr = Static<typeof PrvtIDOthr>;
const PrvtIDOthr = Type.Object({
  Id: Type.String(),
  SchmeNm: CtgyPurp,
});

type PrvtID = Static<typeof PrvtID>;
const PrvtID = Type.Object({
  DtAndPlcOfBirth: DtAndPLCOfBirth,
  Othr: Type.Array(PrvtIDOthr),
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

type RmtInf = Static<typeof RmtInf>;
const RmtInf = Type.Object({
  Ustrd: Type.String(),
});
type EqvtAmtAmt = Static<typeof EqvtAmtAmt>;
const EqvtAmtAmt = Type.Object({
  Amt: Type.String(),
  Ccy: Type.String(),
});

type EqvtAmt = Static<typeof EqvtAmt>;
const EqvtAmt = Type.Object({
  Amt: EqvtAmtAmt,
  CcyOfTrf: Type.String(),
});
type InstdAmt = Static<typeof InstdAmt>;
const InstdAmt = Type.Object({
  Amt: EqvtAmtAmt,
});
type CdtTrfTxInfAmt = Static<typeof CdtTrfTxInfAmt>;
const CdtTrfTxInfAmt = Type.Object({
  InstdAmt,
  EqvtAmt,
});

type PurpleDoc = Static<typeof PurpleDoc>;
const PurpleDoc = Type.Object({
  PyeeRcvAmt: InstdAmt,
  PyeeFinSvcsPrvdrFee: InstdAmt,
  PyeeFinSvcsPrvdrComssn: InstdAmt,
});
type PurpleEnvlp = Static<typeof PurpleEnvlp>;
const PurpleEnvlp = Type.Object({
  Doc: PurpleDoc,
});

type CdtTrfTxInfSplmtryData = Static<typeof CdtTrfTxInfSplmtryData>;
const CdtTrfTxInfSplmtryData = Type.Object({
  Envlp: PurpleEnvlp,
});

type CdtrAcctID = Static<typeof CdtrAcctID>;
const CdtrAcctID = Type.Object({
  Othr: Type.Array(PrvtIDOthr),
});
type CdtrAcct = Static<typeof CdtrAcct>;
const CdtrAcct = Type.Object({
  Id: CdtrAcctID,
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

type PurpleOthr = Static<typeof PurpleOthr>;
const PurpleOthr = Type.Object({
  Id: Type.String(),
  SchmeNm: CtgyPurp,
  Nm: Type.String(),
});

type DbtrAcctID = Static<typeof DbtrAcctID>;
const DbtrAcctID = Type.Object({
  Othr: Type.Array(PurpleOthr),
});

type CdtTrfTxInf = Static<typeof CdtTrfTxInf>;
const CdtTrfTxInf = Type.Object({
  PmtId: PmtID,
  PmtTpInf,
  Amt: CdtTrfTxInfAmt,
  ChrgBr: Type.String(),
  CdtrAgt: TrAgt,
  Cdtr: InitgPty,
  CdtrAcct,
  Purp,
  RgltryRptg,
  RmtInf,
  SplmtryData: CdtTrfTxInfSplmtryData,
});

type DbtrAcct = Static<typeof DbtrAcct>;
const DbtrAcct = Type.Object({
  Id: DbtrAcctID,
  Nm: Type.String(),
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

type Dt = Static<typeof Dt>;
const Dt = Type.Object({
  DtTm: Type.String(),
});

type Glctn = Static<typeof Glctn>;
const Glctn = Type.Object({
  Lat: Type.String(),
  Long: Type.String(),
});

type DocInitgPty = Static<typeof DocInitgPty>;
const DocInitgPty = Type.Object({
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

type PmtInf = Static<typeof PmtInf>;
const PmtInf = Type.Object({
  PmtInfId: Type.String(),
  PmtMtd: Type.String(),
  ReqdAdvcTp,
  ReqdExctnDt: Dt,
  XpryDt: Dt,
  Dbtr: InitgPty,
  DbtrAcct,
  DbtrAgt: TrAgt,
  CdtTrfTxInf,
});

type CdtrPmtActvtnReqSplmtryData = Static<typeof CdtrPmtActvtnReqSplmtryData>;
const CdtrPmtActvtnReqSplmtryData = Type.Object({
  Envlp: FluffyEnvlp,
});

type CdtrPmtActvtnReq = Static<typeof CdtrPmtActvtnReq>;
const CdtrPmtActvtnReq = Type.Object({
  GrpHdr,
  PmtInf,
  SplmtryData: CdtrPmtActvtnReqSplmtryData,
});

export type Pain013Schema = Static<typeof Pain013Schema>;
export const Pain013Schema = Type.Object({
  TxTp: Type.String(),
  tenantId: Type.Optional(Type.String({ default: 'DEFAULT' })),
  CdtrPmtActvtnReq,
  DataCache: Type.Optional(DataCache),
});
