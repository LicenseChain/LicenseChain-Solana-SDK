import { SolanaError, SolanaValidationError } from './errors';

export function validatePublicKey(publicKey: string): boolean {
  try {
    // Basic Solana public key validation
    if (!publicKey || typeof publicKey !== 'string') {
      return false;
    }
    
    // Solana public keys are base58 encoded and typically 32-44 characters
    if (publicKey.length < 32 || publicKey.length > 44) {
      return false;
    }
    
    // Check if it's valid base58
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]+$/;
    return base58Regex.test(publicKey);
  } catch {
    return false;
  }
}

export function validatePrivateKey(privateKey: Uint8Array | string): boolean {
  try {
    if (typeof privateKey === 'string') {
      // Convert hex string to Uint8Array
      const bytes = new Uint8Array(privateKey.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);
      return bytes.length === 64;
    }
    
    return privateKey instanceof Uint8Array && privateKey.length === 64;
  } catch {
    return false;
  }
}

export function formatPublicKey(publicKey: string): string {
  if (!validatePublicKey(publicKey)) {
    throw new SolanaValidationError('Invalid public key format');
  }
  
  return publicKey;
}

export function parseUnits(value: string, decimals: number = 9): bigint {
  const [integer, fraction = ''] = value.split('.');
  const paddedFraction = fraction.padEnd(decimals, '0').slice(0, decimals);
  return BigInt(integer + paddedFraction);
}

export function formatUnits(value: bigint | string, decimals: number = 9): string {
  const bigintValue = typeof value === 'string' ? BigInt(value) : value;
  const divisor = BigInt(10 ** decimals);
  const quotient = bigintValue / divisor;
  const remainder = bigintValue % divisor;
  
  if (remainder === 0n) {
    return quotient.toString();
  }
  
  const remainderStr = remainder.toString().padStart(decimals, '0');
  const trimmedRemainder = remainderStr.replace(/0+$/, '');
  
  if (trimmedRemainder) {
    return `${quotient}.${trimmedRemainder}`;
  }
  
  return quotient.toString();
}

export function calculateRentExemptMinimum(dataLength: number, isExecutable: boolean = false): number {
  // Simplified rent calculation - in production, use the actual Solana rent calculation
  const baseRent = 890880; // Base rent for account
  const dataRent = dataLength * 100; // Simplified data rent calculation
  const executableRent = isExecutable ? 1000000 : 0; // Additional rent for executable accounts
  
  return baseRent + dataRent + executableRent;
}

export function estimateTransactionFee(instructions: number, signatures: number = 1): number {
  const baseFee = 5000; // Base transaction fee
  const instructionFee = instructions * 200; // Fee per instruction
  const signatureFee = signatures * 1000; // Fee per signature
  
  return baseFee + instructionFee + signatureFee;
}

export function generateRandomBytes(length: number): Uint8Array {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return array;
}

export function generateKeypair(): { publicKey: string; secretKey: Uint8Array } {
  const secretKey = generateRandomBytes(64);
  // In a real implementation, you would derive the public key from the secret key
  const publicKey = 'GeneratedPublicKey' + Math.random().toString(36).substr(2, 9);
  
  return { publicKey, secretKey };
}

export function hashMessage(message: string): string {
  // Simple hash function - in production, use a proper cryptographic hash
  let hash = 0;
  for (let i = 0; i < message.length; i++) {
    const char = message.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function retry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    
    const attempt = async () => {
      try {
        const result = await fn();
        resolve(result);
      } catch (error) {
        attempts++;
        if (attempts >= maxRetries) {
          reject(error);
        } else {
          setTimeout(attempt, delay * attempts);
        }
      }
    };
    
    attempt();
  });
}

export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return input.replace(/[<>\"'&]/g, (match) => {
      const escapeMap: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return escapeMap[match];
    });
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
}

export function createWebhookSignature(payload: string, secret: string): string {
  // Simple HMAC implementation - in production, use crypto.subtle
  const encoder = new TextEncoder();
  const key = encoder.encode(secret);
  const data = encoder.encode(payload);
  
  // This is a simplified version - use proper HMAC in production
  return btoa(Array.from(data).map((byte, i) => 
    String.fromCharCode(byte ^ key[i % key.length])
  ).join(''));
}

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = createWebhookSignature(payload, secret);
  return signature === expectedSignature;
}

export function formatLamports(lamports: number): string {
  return formatUnits(BigInt(lamports), 9);
}

export function parseLamports(sol: string): number {
  return Number(parseUnits(sol, 9));
}

export function getClusterInfo(cluster: 'mainnet-beta' | 'testnet' | 'devnet'): {
  name: string;
  rpcUrl: string;
  wsUrl: string;
  explorerUrl: string;
  commitment: 'processed' | 'confirmed' | 'finalized';
} {
  const clusters = {
    'mainnet-beta': {
      name: 'Mainnet Beta',
      rpcUrl: 'https://api.mainnet-beta.solana.com',
      wsUrl: 'wss://api.mainnet-beta.solana.com',
      explorerUrl: 'https://explorer.solana.com',
      commitment: 'confirmed' as const
    },
    'testnet': {
      name: 'Testnet',
      rpcUrl: 'https://api.testnet.solana.com',
      wsUrl: 'wss://api.testnet.solana.com',
      explorerUrl: 'https://explorer.solana.com/?cluster=testnet',
      commitment: 'confirmed' as const
    },
    'devnet': {
      name: 'Devnet',
      rpcUrl: 'https://api.devnet.solana.com',
      wsUrl: 'wss://api.devnet.solana.com',
      explorerUrl: 'https://explorer.solana.com/?cluster=devnet',
      commitment: 'confirmed' as const
    }
  };
  
  return clusters[cluster];
}

export function isValidSolanaAddress(address: string): boolean {
  return validatePublicKey(address);
}

export function shortenAddress(address: string, chars: number = 4): string {
  if (!address || address.length <= chars * 2) {
    return address;
  }
  
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function formatTokenAmount(amount: string | number, decimals: number = 9): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return numAmount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals
  });
}

export function calculateAPY(principal: number, interest: number, timeInDays: number): number {
  if (principal <= 0 || timeInDays <= 0) return 0;
  
  const dailyRate = interest / principal;
  const annualRate = dailyRate * 365;
  return annualRate * 100; // Convert to percentage
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${Math.floor(ms / 1000)}s`;
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  return `${Math.floor(ms / 3600000)}h ${Math.floor((ms % 3600000) / 60000)}m`;
}
