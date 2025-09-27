export interface SolanaConfig {
  apiKey: string;
  baseUrl?: string;
  rpcUrl?: string;
  timeout?: number;
  retries?: number;
}

export interface SolanaAccount {
  publicKey: string;
  secretKey?: Uint8Array;
  balance: number;
  isExecutable: boolean;
  owner: string;
  lamports: number;
}

export interface SolanaTransaction {
  signature: string;
  slot: number;
  blockTime: number;
  confirmationStatus: 'processed' | 'confirmed' | 'finalized';
  err: any;
  memo?: string;
}

export interface SolanaTokenAccount {
  address: string;
  mint: string;
  owner: string;
  amount: string;
  decimals: number;
  state: 'initialized' | 'frozen';
}

export interface SolanaNFTMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  external_url?: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  properties?: {
    files?: Array<{
      uri: string;
      type: string;
    }>;
    category?: string;
    creators?: Array<{
      address: string;
      verified: boolean;
      share: number;
    }>;
  };
}

export interface SolanaProgram {
  programId: string;
  data: Uint8Array;
  owner: string;
  executable: boolean;
  rentEpoch: number;
}

export interface SolanaInstruction {
  programId: string;
  keys: Array<{
    pubkey: string;
    isSigner: boolean;
    isWritable: boolean;
  }>;
  data: Uint8Array;
}

export interface SolanaMessage {
  header: {
    numRequiredSignatures: number;
    numReadonlySignedAccounts: number;
    numReadonlyUnsignedAccounts: number;
  };
  accountKeys: string[];
  recentBlockhash: string;
  instructions: SolanaInstruction[];
}

export interface SolanaBlock {
  blockhash: string;
  previousBlockhash: string;
  parentSlot: number;
  transactions: SolanaTransaction[];
  rewards: Array<{
    pubkey: string;
    lamports: number;
    postBalance: number;
    rewardType: string;
  }>;
  blockTime: number;
  blockHeight: number;
}

export interface SolanaClusterInfo {
  name: string;
  rpcUrl: string;
  wsUrl: string;
  explorerUrl: string;
  commitment: 'processed' | 'confirmed' | 'finalized';
}

export interface SolanaValidatorInfo {
  identity: string;
  voteAccount: string;
  commission: number;
  lastVote: number;
  rootSlot: number;
  credits: number;
  epochCredits: number;
  activatedStake: number;
  version: string;
  delinquent: boolean;
}

export interface SolanaStakeAccount {
  address: string;
  stake: number;
  activationEpoch: number;
  deactivationEpoch: number;
  voter: string;
  withdrawer: string;
  staker: string;
  rentExemptReserve: number;
}

export interface SolanaDeFiPosition {
  protocol: string;
  positionType: 'liquidity' | 'lending' | 'staking' | 'farming';
  amount: string;
  value: string;
  apy?: number;
  rewards?: string;
  poolAddress?: string;
  tokenMint?: string;
}

export interface SolanaNFTCollection {
  name: string;
  symbol: string;
  description: string;
  image: string;
  externalUrl?: string;
  sellerFeeBasisPoints: number;
  creators: Array<{
    address: string;
    verified: boolean;
    share: number;
  }>;
  collection?: {
    name: string;
    family: string;
  };
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

export interface SolanaMarketplaceListing {
  mint: string;
  price: number;
  seller: string;
  marketplace: string;
  listedAt: number;
  expiresAt?: number;
  currency: string;
  status: 'active' | 'sold' | 'cancelled' | 'expired';
}

export interface SolanaError extends Error {
  code: string;
  details?: any;
}
