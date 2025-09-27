import { SolanaConfig, SolanaDeFiPosition } from './types';
import { SolanaError, SolanaNetworkError, SolanaValidationError } from './errors';
import { validatePublicKey, retry } from './utils';

export interface LiquidityPool {
  address: string;
  tokenA: string;
  tokenB: string;
  reserveA: string;
  reserveB: string;
  totalSupply: string;
  fee: number;
  apy: number;
  volume24h: string;
  tvl: string;
}

export interface LendingPool {
  address: string;
  token: string;
  totalSupply: string;
  totalBorrowed: string;
  utilizationRate: number;
  supplyRate: number;
  borrowRate: number;
  apy: number;
  collateralFactor: number;
}

export interface StakingPool {
  address: string;
  token: string;
  totalStaked: string;
  rewardRate: string;
  apy: number;
  lockPeriod: number;
  minStake: string;
  totalRewards: string;
}

export interface YieldFarm {
  address: string;
  token: string;
  rewardToken: string;
  totalStaked: string;
  rewardRate: string;
  apy: number;
  lockPeriod: number;
  minStake: string;
  totalRewards: string;
}

export class SolanaDeFiManager {
  private config: SolanaConfig;

  constructor(config: SolanaConfig) {
    this.config = config;
  }

  async getPositions(owner: string): Promise<SolanaDeFiPosition[]> {
    try {
      if (!owner) {
        throw new SolanaValidationError('Owner address is required');
      }

      if (!validatePublicKey(owner)) {
        throw new SolanaValidationError('Invalid owner address');
      }

      const response = await this.makeRequest('GET', `/defi/positions/${owner}`);
      return response.data;
    } catch (error) {
      if (error instanceof SolanaError) {
        throw error;
      }
      throw new SolanaError('Failed to get DeFi positions', 'DEFI_POSITIONS_ERROR', error);
    }
  }

  // Liquidity Pool Management
  async getLiquidityPools(): Promise<LiquidityPool[]> {
    try {
      const response = await this.makeRequest('GET', '/defi/liquidity-pools');
      return response.data;
    } catch (error) {
      if (error instanceof SolanaError) {
        throw error;
      }
      throw new SolanaError('Failed to get liquidity pools', 'LIQUIDITY_POOLS_ERROR', error);
    }
  }

  async addLiquidity(poolAddress: string, amountA: string, amountB: string, owner: string): Promise<string> {
    try {
      if (!poolAddress || !amountA || !amountB || !owner) {
        throw new SolanaValidationError('Pool address, amounts, and owner are required');
      }

      if (!validatePublicKey(poolAddress) || !validatePublicKey(owner)) {
        throw new SolanaValidationError('Invalid address format');
      }

      const response = await this.makeRequest('POST', `/defi/liquidity-pools/${poolAddress}/add`, {
        amountA,
        amountB,
        owner,
        platform: 'solana'
      });

      return response.data.transactionSignature;
    } catch (error) {
      if (error instanceof SolanaError) {
        throw error;
      }
      throw new SolanaError('Failed to add liquidity', 'ADD_LIQUIDITY_ERROR', error);
    }
  }

  async removeLiquidity(poolAddress: string, lpTokens: string, owner: string): Promise<string> {
    try {
      if (!poolAddress || !lpTokens || !owner) {
        throw new SolanaValidationError('Pool address, LP tokens, and owner are required');
      }

      if (!validatePublicKey(poolAddress) || !validatePublicKey(owner)) {
        throw new SolanaValidationError('Invalid address format');
      }

      const response = await this.makeRequest('POST', `/defi/liquidity-pools/${poolAddress}/remove`, {
        lpTokens,
        owner,
        platform: 'solana'
      });

      return response.data.transactionSignature;
    } catch (error) {
      if (error instanceof SolanaError) {
        throw error;
      }
      throw new SolanaError('Failed to remove liquidity', 'REMOVE_LIQUIDITY_ERROR', error);
    }
  }

  async swapTokens(
    inputMint: string,
    outputMint: string,
    amountIn: string,
    minAmountOut: string,
    owner: string
  ): Promise<string> {
    try {
      if (!inputMint || !outputMint || !amountIn || !minAmountOut || !owner) {
        throw new SolanaValidationError('All swap parameters are required');
      }

      if (!validatePublicKey(inputMint) || !validatePublicKey(outputMint) || !validatePublicKey(owner)) {
        throw new SolanaValidationError('Invalid address format');
      }

      const response = await this.makeRequest('POST', '/defi/swap', {
        inputMint,
        outputMint,
        amountIn,
        minAmountOut,
        owner,
        platform: 'solana'
      });

      return response.data.transactionSignature;
    } catch (error) {
      if (error instanceof SolanaError) {
        throw error;
      }
      throw new SolanaError('Failed to swap tokens', 'SWAP_ERROR', error);
    }
  }

  // Lending Management
  async getLendingPools(): Promise<LendingPool[]> {
    try {
      const response = await this.makeRequest('GET', '/defi/lending-pools');
      return response.data;
    } catch (error) {
      if (error instanceof SolanaError) {
        throw error;
      }
      throw new SolanaError('Failed to get lending pools', 'LENDING_POOLS_ERROR', error);
    }
  }

  async supplyLiquidity(poolAddress: string, amount: string, owner: string): Promise<string> {
    try {
      if (!poolAddress || !amount || !owner) {
        throw new SolanaValidationError('Pool address, amount, and owner are required');
      }

      if (!validatePublicKey(poolAddress) || !validatePublicKey(owner)) {
        throw new SolanaValidationError('Invalid address format');
      }

      const response = await this.makeRequest('POST', `/defi/lending-pools/${poolAddress}/supply`, {
        amount,
        owner,
        platform: 'solana'
      });

      return response.data.transactionSignature;
    } catch (error) {
      if (error instanceof SolanaError) {
        throw error;
      }
      throw new SolanaError('Failed to supply liquidity', 'SUPPLY_LIQUIDITY_ERROR', error);
    }
  }

  async borrowLiquidity(poolAddress: string, amount: string, owner: string): Promise<string> {
    try {
      if (!poolAddress || !amount || !owner) {
        throw new SolanaValidationError('Pool address, amount, and owner are required');
      }

      if (!validatePublicKey(poolAddress) || !validatePublicKey(owner)) {
        throw new SolanaValidationError('Invalid address format');
      }

      const response = await this.makeRequest('POST', `/defi/lending-pools/${poolAddress}/borrow`, {
        amount,
        owner,
        platform: 'solana'
      });

      return response.data.transactionSignature;
    } catch (error) {
      if (error instanceof SolanaError) {
        throw error;
      }
      throw new SolanaError('Failed to borrow liquidity', 'BORROW_LIQUIDITY_ERROR', error);
    }
  }

  async repayLiquidity(poolAddress: string, amount: string, owner: string): Promise<string> {
    try {
      if (!poolAddress || !amount || !owner) {
        throw new SolanaValidationError('Pool address, amount, and owner are required');
      }

      if (!validatePublicKey(poolAddress) || !validatePublicKey(owner)) {
        throw new SolanaValidationError('Invalid address format');
      }

      const response = await this.makeRequest('POST', `/defi/lending-pools/${poolAddress}/repay`, {
        amount,
        owner,
        platform: 'solana'
      });

      return response.data.transactionSignature;
    } catch (error) {
      if (error instanceof SolanaError) {
        throw error;
      }
      throw new SolanaError('Failed to repay liquidity', 'REPAY_LIQUIDITY_ERROR', error);
    }
  }

  // Staking Management
  async getStakingPools(): Promise<StakingPool[]> {
    try {
      const response = await this.makeRequest('GET', '/defi/staking-pools');
      return response.data;
    } catch (error) {
      if (error instanceof SolanaError) {
        throw error;
      }
      throw new SolanaError('Failed to get staking pools', 'STAKING_POOLS_ERROR', error);
    }
  }

  async stakeTokens(poolAddress: string, amount: string, owner: string): Promise<string> {
    try {
      if (!poolAddress || !amount || !owner) {
        throw new SolanaValidationError('Pool address, amount, and owner are required');
      }

      if (!validatePublicKey(poolAddress) || !validatePublicKey(owner)) {
        throw new SolanaValidationError('Invalid address format');
      }

      const response = await this.makeRequest('POST', `/defi/staking-pools/${poolAddress}/stake`, {
        amount,
        owner,
        platform: 'solana'
      });

      return response.data.transactionSignature;
    } catch (error) {
      if (error instanceof SolanaError) {
        throw error;
      }
      throw new SolanaError('Failed to stake tokens', 'STAKE_ERROR', error);
    }
  }

  async unstakeTokens(poolAddress: string, amount: string, owner: string): Promise<string> {
    try {
      if (!poolAddress || !amount || !owner) {
        throw new SolanaValidationError('Pool address, amount, and owner are required');
      }

      if (!validatePublicKey(poolAddress) || !validatePublicKey(owner)) {
        throw new SolanaValidationError('Invalid address format');
      }

      const response = await this.makeRequest('POST', `/defi/staking-pools/${poolAddress}/unstake`, {
        amount,
        owner,
        platform: 'solana'
      });

      return response.data.transactionSignature;
    } catch (error) {
      if (error instanceof SolanaError) {
        throw error;
      }
      throw new SolanaError('Failed to unstake tokens', 'UNSTAKE_ERROR', error);
    }
  }

  async claimRewards(poolAddress: string, owner: string): Promise<string> {
    try {
      if (!poolAddress || !owner) {
        throw new SolanaValidationError('Pool address and owner are required');
      }

      if (!validatePublicKey(poolAddress) || !validatePublicKey(owner)) {
        throw new SolanaValidationError('Invalid address format');
      }

      const response = await this.makeRequest('POST', `/defi/staking-pools/${poolAddress}/claim`, {
        owner,
        platform: 'solana'
      });

      return response.data.transactionSignature;
    } catch (error) {
      if (error instanceof SolanaError) {
        throw error;
      }
      throw new SolanaError('Failed to claim rewards', 'CLAIM_REWARDS_ERROR', error);
    }
  }

  // Yield Farming Management
  async getYieldFarms(): Promise<YieldFarm[]> {
    try {
      const response = await this.makeRequest('GET', '/defi/yield-farms');
      return response.data;
    } catch (error) {
      if (error instanceof SolanaError) {
        throw error;
      }
      throw new SolanaError('Failed to get yield farms', 'YIELD_FARMS_ERROR', error);
    }
  }

  async farmYield(farmAddress: string, amount: string, owner: string): Promise<string> {
    try {
      if (!farmAddress || !amount || !owner) {
        throw new SolanaValidationError('Farm address, amount, and owner are required');
      }

      if (!validatePublicKey(farmAddress) || !validatePublicKey(owner)) {
        throw new SolanaValidationError('Invalid address format');
      }

      const response = await this.makeRequest('POST', `/defi/yield-farms/${farmAddress}/farm`, {
        amount,
        owner,
        platform: 'solana'
      });

      return response.data.transactionSignature;
    } catch (error) {
      if (error instanceof SolanaError) {
        throw error;
      }
      throw new SolanaError('Failed to farm yield', 'FARM_YIELD_ERROR', error);
    }
  }

  async harvestYield(farmAddress: string, owner: string): Promise<string> {
    try {
      if (!farmAddress || !owner) {
        throw new SolanaValidationError('Farm address and owner are required');
      }

      if (!validatePublicKey(farmAddress) || !validatePublicKey(owner)) {
        throw new SolanaValidationError('Invalid address format');
      }

      const response = await this.makeRequest('POST', `/defi/yield-farms/${farmAddress}/harvest`, {
        owner,
        platform: 'solana'
      });

      return response.data.transactionSignature;
    } catch (error) {
      if (error instanceof SolanaError) {
        throw error;
      }
      throw new SolanaError('Failed to harvest yield', 'HARVEST_YIELD_ERROR', error);
    }
  }

  // DeFi Statistics
  async getDeFiStats(): Promise<{
    totalValueLocked: string;
    totalVolume24h: string;
    totalFees24h: string;
    activeUsers: number;
    totalPools: number;
    averageAPY: number;
  }> {
    try {
      const response = await this.makeRequest('GET', '/defi/stats');
      return response.data;
    } catch (error) {
      if (error instanceof SolanaError) {
        throw error;
      }
      throw new SolanaError('Failed to get DeFi stats', 'DEFI_STATS_ERROR', error);
    }
  }

  private async makeRequest(method: string, endpoint: string, data?: any): Promise<any> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
        'X-API-Version': '1.0',
        'X-Platform': 'solana'
      },
      signal: AbortSignal.timeout(this.config.timeout!)
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new SolanaNetworkError(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof SolanaError) {
        throw error;
      }
      throw new SolanaNetworkError('API request failed', error);
    }
  }
}
