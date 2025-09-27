export class SolanaError extends Error {
  public readonly code: string;
  public readonly details?: any;

  constructor(message: string, code: string, details?: any) {
    super(message);
    this.name = 'SolanaError';
    this.code = code;
    this.details = details;
  }
}

export class SolanaNetworkError extends SolanaError {
  constructor(message: string, details?: any) {
    super(message, 'NETWORK_ERROR', details);
    this.name = 'SolanaNetworkError';
  }
}

export class SolanaRPCError extends SolanaError {
  public readonly rpcCode: number;

  constructor(message: string, rpcCode: number, details?: any) {
    super(message, 'RPC_ERROR', details);
    this.name = 'SolanaRPCError';
    this.rpcCode = rpcCode;
  }
}

export class SolanaTransactionError extends SolanaError {
  public readonly signature?: string;

  constructor(message: string, signature?: string, details?: any) {
    super(message, 'TRANSACTION_ERROR', details);
    this.name = 'SolanaTransactionError';
    this.signature = signature;
  }
}

export class SolanaAccountError extends SolanaError {
  public readonly account?: string;

  constructor(message: string, account?: string, details?: any) {
    super(message, 'ACCOUNT_ERROR', details);
    this.name = 'SolanaAccountError';
    this.account = account;
  }
}

export class SolanaProgramError extends SolanaError {
  public readonly programId?: string;

  constructor(message: string, programId?: string, details?: any) {
    super(message, 'PROGRAM_ERROR', details);
    this.name = 'SolanaProgramError';
    this.programId = programId;
  }
}

export class SolanaValidationError extends SolanaError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'SolanaValidationError';
  }
}

export class SolanaAuthenticationError extends SolanaError {
  constructor(message: string, details?: any) {
    super(message, 'AUTHENTICATION_ERROR', details);
    this.name = 'SolanaAuthenticationError';
  }
}

export class SolanaRateLimitError extends SolanaError {
  public readonly retryAfter?: number;

  constructor(message: string, retryAfter?: number, details?: any) {
    super(message, 'RATE_LIMIT_ERROR', details);
    this.name = 'SolanaRateLimitError';
    this.retryAfter = retryAfter;
  }
}

export class SolanaInsufficientFundsError extends SolanaError {
  public readonly required: number;
  public readonly available: number;

  constructor(message: string, required: number, available: number, details?: any) {
    super(message, 'INSUFFICIENT_FUNDS', details);
    this.name = 'SolanaInsufficientFundsError';
    this.required = required;
    this.available = available;
  }
}

export class SolanaTimeoutError extends SolanaError {
  public readonly timeout: number;

  constructor(message: string, timeout: number, details?: any) {
    super(message, 'TIMEOUT_ERROR', details);
    this.name = 'SolanaTimeoutError';
    this.timeout = timeout;
  }
}
