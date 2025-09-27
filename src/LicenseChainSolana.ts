import { SolanaConfig, SolanaAccount, SolanaTransaction, SolanaTokenAccount, SolanaProgram, SolanaBlock, SolanaClusterInfo, SolanaValidatorInfo, SolanaStakeAccount } from './types';
import { SolanaError, SolanaNetworkError, SolanaRPCError, SolanaTransactionError, SolanaAccountError } from './errors';
import { SolanaLicenseManager } from './SolanaLicenseManager';
import { SolanaNFTManager } from './SolanaNFTManager';
import { SolanaDeFiManager } from './SolanaDeFiManager';
import { validatePublicKey, formatPublicKey, parseUnits, formatUnits, retry } from './utils';

export class LicenseChainSolana {
  private config: SolanaConfig;
  private licenseManager: SolanaLicenseManager;
  private nftManager: SolanaNFTManager;
  private defiManager: SolanaDeFiManager;

  constructor(config: SolanaConfig) {
    this.config = {
      baseUrl: 'https://api.licensechain.com',
      rpcUrl: 'https://api.mainnet-beta.solana.com',
      timeout: 30000,
      retries: 3,
      ...config
    };
    
    this.licenseManager = new SolanaLicenseManager(this.config);
    this.nftManager = new SolanaNFTManager(this.config);
    this.defiManager = new SolanaDeFiManager(this.config);
  }

  // Account Management
  async getAccount(publicKey: string): Promise<SolanaAccount> {
    try {
      const validatedKey = formatPublicKey(publicKey);
      
      const response = await this.makeRPCRequest('getAccountInfo', [validatedKey]);
      
      if (!response.value) {
        throw new SolanaAccountError('Account not found', validatedKey);
      }
      
      return {
        publicKey: validatedKey,
        balance: response.value.lamports,
        isExecutable: response.value.executable,
        owner: response.value.owner,
        lamports: response.value.lamports
      };
    } catch (error) {
      if (error instanceof SolanaError) {
        throw error;
      }
      throw new SolanaAccountError('Failed to get account', publicKey, error);
    }
  }

  async getBalance(publicKey: string): Promise<number> {
    try {
      const validatedKey = formatPublicKey(publicKey);
      
      const response = await this.makeRPCRequest('getBalance', [validatedKey]);
      
      return response.value;
    } catch (error) {
      throw new SolanaAccountError('Failed to get balance', publicKey, error);
    }
  }

  async getTokenAccounts(owner: string, mint?: string): Promise<SolanaTokenAccount[]> {
    try {
      const validatedOwner = formatPublicKey(owner);
      
      const filters = mint ? [{ mint: formatPublicKey(mint) }] : undefined;
      
      const response = await this.makeRPCRequest('getTokenAccountsByOwner', [
        validatedOwner,
        { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
        filters
      ]);
      
      return response.value.map((account: any) => ({
        address: account.pubkey,
        mint: account.account.data.parsed.info.mint,
        owner: account.account.data.parsed.info.owner,
        amount: account.account.data.parsed.info.tokenAmount.amount,
        decimals: account.account.data.parsed.info.tokenAmount.decimals,
        state: account.account.data.parsed.info.state
      }));
    } catch (error) {
      throw new SolanaAccountError('Failed to get token accounts', owner, error);
    }
  }

  // Transaction Management
  async sendTransaction(transaction: any): Promise<SolanaTransaction> {
    try {
      const response = await this.makeRPCRequest('sendTransaction', [transaction]);
      
      return {
        signature: response.value,
        slot: 0, // Will be filled by confirmation
        blockTime: 0,
        confirmationStatus: 'processed'
      };
    } catch (error) {
      throw new SolanaTransactionError('Failed to send transaction', undefined, error);
    }
  }

  async confirmTransaction(signature: string, commitment: 'processed' | 'confirmed' | 'finalized' = 'confirmed'): Promise<SolanaTransaction> {
    try {
      const response = await this.makeRPCRequest('getSignatureStatuses', [[signature], { searchTransactionHistory: true }]);
      
      if (!response.value[0]) {
        throw new SolanaTransactionError('Transaction not found', signature);
      }
      
      const status = response.value[0];
      
      return {
        signature,
        slot: status.slot || 0,
        blockTime: status.blockTime || 0,
        confirmationStatus: commitment,
        err: status.err
      };
    } catch (error) {
      throw new SolanaTransactionError('Failed to confirm transaction', signature, error);
    }
  }

  async getTransaction(signature: string): Promise<SolanaTransaction> {
    try {
      const response = await this.makeRPCRequest('getTransaction', [signature]);
      
      if (!response.value) {
        throw new SolanaTransactionError('Transaction not found', signature);
      }
      
      return {
        signature,
        slot: response.value.slot,
        blockTime: response.value.blockTime,
        confirmationStatus: 'confirmed',
        err: response.value.meta?.err,
        memo: response.value.meta?.logMessages?.find((msg: string) => msg.startsWith('Program log: '))?.replace('Program log: ', '')
      };
    } catch (error) {
      throw new SolanaTransactionError('Failed to get transaction', signature, error);
    }
  }

  // Program Management
  async getProgram(programId: string): Promise<SolanaProgram> {
    try {
      const validatedId = formatPublicKey(programId);
      
      const response = await this.makeRPCRequest('getAccountInfo', [validatedId]);
      
      if (!response.value) {
        throw new SolanaAccountError('Program not found', validatedId);
      }
      
      return {
        programId: validatedId,
        data: response.value.data,
        owner: response.value.owner,
        executable: response.value.executable,
        rentEpoch: response.value.rentEpoch
      };
    } catch (error) {
      throw new SolanaAccountError('Failed to get program', programId, error);
    }
  }

  // Block Management
  async getBlock(slot: number): Promise<SolanaBlock> {
    try {
      const response = await this.makeRPCRequest('getBlock', [slot]);
      
      if (!response.value) {
        throw new SolanaError('Block not found', 'BLOCK_NOT_FOUND');
      }
      
      return {
        blockhash: response.value.blockhash,
        previousBlockhash: response.value.previousBlockhash,
        parentSlot: response.value.parentSlot,
        transactions: response.value.transactions || [],
        rewards: response.value.rewards || [],
        blockTime: response.value.blockTime,
        blockHeight: response.value.blockHeight
      };
    } catch (error) {
      throw new SolanaError('Failed to get block', 'BLOCK_ERROR', error);
    }
  }

  async getLatestBlockhash(): Promise<string> {
    try {
      const response = await this.makeRPCRequest('getLatestBlockhash', []);
      return response.value.blockhash;
    } catch (error) {
      throw new SolanaError('Failed to get latest blockhash', 'BLOCKHASH_ERROR', error);
    }
  }

  // Cluster Information
  async getClusterInfo(): Promise<SolanaClusterInfo> {
    try {
      const response = await this.makeRPCRequest('getClusterNodes', []);
      
      return {
        name: 'Mainnet Beta',
        rpcUrl: this.config.rpcUrl!,
        wsUrl: this.config.rpcUrl!.replace('https://', 'wss://'),
        explorerUrl: 'https://explorer.solana.com',
        commitment: 'confirmed'
      };
    } catch (error) {
      throw new SolanaError('Failed to get cluster info', 'CLUSTER_ERROR', error);
    }
  }

  async getValidators(): Promise<SolanaValidatorInfo[]> {
    try {
      const response = await this.makeRPCRequest('getVoteAccounts', []);
      
      return response.value.current.concat(response.value.delinquent).map((validator: any) => ({
        identity: validator.nodePubkey,
        voteAccount: validator.votePubkey,
        commission: validator.commission,
        lastVote: validator.lastVote,
        rootSlot: validator.rootSlot,
        credits: validator.credits,
        epochCredits: validator.epochCredits,
        activatedStake: validator.activatedStake,
        version: validator.version,
        delinquent: validator.delinquent
      }));
    } catch (error) {
      throw new SolanaError('Failed to get validators', 'VALIDATORS_ERROR', error);
    }
  }

  // Stake Management
  async getStakeAccounts(owner: string): Promise<SolanaStakeAccount[]> {
    try {
      const validatedOwner = formatPublicKey(owner);
      
      const response = await this.makeRPCRequest('getProgramAccounts', [
        'Stake11111111111111111111111111111111111112',
        {
          filters: [
            {
              memcmp: {
                offset: 124,
                bytes: validatedOwner
              }
            }
          ]
        }
      ]);
      
      return response.value.map((account: any) => ({
        address: account.pubkey,
        stake: account.account.lamports,
        activationEpoch: account.account.data.parsed.info.stake.delegation.activationEpoch,
        deactivationEpoch: account.account.data.parsed.info.stake.delegation.deactivationEpoch,
        voter: account.account.data.parsed.info.stake.delegation.voter,
        withdrawer: account.account.data.parsed.info.withdrawer,
        staker: account.account.data.parsed.info.stake.delegation.stake,
        rentExemptReserve: account.account.data.parsed.info.rentExemptReserve
      }));
    } catch (error) {
      throw new SolanaError('Failed to get stake accounts', 'STAKE_ERROR', error);
    }
  }

  // License Management (delegated to license manager)
  async createLicense(userId: string, productId: string, metadata?: Record<string, any>) {
    return this.licenseManager.createLicense(userId, productId, metadata);
  }

  async validateLicense(licenseKey: string) {
    return this.licenseManager.validateLicense(licenseKey);
  }

  async getLicense(licenseId: string) {
    return this.licenseManager.getLicense(licenseId);
  }

  async updateLicense(licenseId: string, updates: any) {
    return this.licenseManager.updateLicense(licenseId, updates);
  }

  async revokeLicense(licenseId: string) {
    return this.licenseManager.revokeLicense(licenseId);
  }

  // NFT Management (delegated to NFT manager)
  async createNFT(metadata: any, owner: string) {
    return this.nftManager.createNFT(metadata, owner);
  }

  async getNFT(mint: string) {
    return this.nftManager.getNFT(mint);
  }

  async transferNFT(mint: string, from: string, to: string) {
    return this.nftManager.transferNFT(mint, from, to);
  }

  // DeFi Management (delegated to DeFi manager)
  async getDeFiPositions(owner: string) {
    return this.defiManager.getPositions(owner);
  }

  async addLiquidity(poolAddress: string, amount: string, owner: string) {
    return this.defiManager.addLiquidity(poolAddress, amount, owner);
  }

  async removeLiquidity(poolAddress: string, amount: string, owner: string) {
    return this.defiManager.removeLiquidity(poolAddress, amount, owner);
  }

  // Utility Methods
  private async makeRPCRequest(method: string, params: any[]): Promise<any> {
    const url = this.config.rpcUrl!;
    const options: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
        'X-API-Version': '1.0'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method,
        params
      }),
      signal: AbortSignal.timeout(this.config.timeout!)
    };

    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new SolanaNetworkError(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new SolanaRPCError(data.error.message, data.error.code, data.error);
      }
      
      return data;
    } catch (error) {
      if (error instanceof SolanaError) {
        throw error;
      }
      throw new SolanaNetworkError('RPC request failed', error);
    }
  }

  // Cleanup
  async disconnect(): Promise<void> {
    // Cleanup any connections
  }
}
