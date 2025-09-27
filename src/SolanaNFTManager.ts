import { SolanaConfig, SolanaNFTMetadata, SolanaNFTCollection, SolanaMarketplaceListing } from './types';
import { SolanaError, SolanaNetworkError, SolanaValidationError } from './errors';
import { validatePublicKey, retry } from './utils';

export interface SolanaNFT {
  mint: string;
  owner: string;
  metadata: SolanaNFTMetadata;
  collection?: SolanaNFTCollection;
  supply?: number;
  isMutable: boolean;
  primarySaleHappened: boolean;
  sellerFeeBasisPoints: number;
  creators: Array<{
    address: string;
    verified: boolean;
    share: number;
  }>;
}

export class SolanaNFTManager {
  private config: SolanaConfig;

  constructor(config: SolanaConfig) {
    this.config = config;
  }

  async createNFT(metadata: SolanaNFTMetadata, owner: string): Promise<SolanaNFT> {
    try {
      if (!metadata || !owner) {
        throw new SolanaValidationError('Metadata and owner are required');
      }

      if (!validatePublicKey(owner)) {
        throw new SolanaValidationError('Invalid owner public key');
      }

      const response = await this.makeRequest('POST', '/nfts', {
        metadata,
        owner,
        platform: 'solana'
      });

      return response.data;
    } catch (error) {
      if (error instanceof SolanaError) {
        throw error;
      }
      throw new SolanaError('Failed to create NFT', 'NFT_CREATE_ERROR', error);
    }
  }

  async getNFT(mint: string): Promise<SolanaNFT> {
    try {
      if (!mint) {
        throw new SolanaValidationError('Mint address is required');
      }

      if (!validatePublicKey(mint)) {
        throw new SolanaValidationError('Invalid mint address');
      }

      const response = await this.makeRequest('GET', `/nfts/${mint}`);
      return response.data;
    } catch (error) {
      if (error instanceof SolanaError) {
        throw error;
      }
      throw new SolanaError('Failed to get NFT', 'NFT_GET_ERROR', error);
    }
  }

  async transferNFT(mint: string, from: string, to: string): Promise<string> {
    try {
      if (!mint || !from || !to) {
        throw new SolanaValidationError('Mint, from, and to addresses are required');
      }

      if (!validatePublicKey(mint) || !validatePublicKey(from) || !validatePublicKey(to)) {
        throw new SolanaValidationError('Invalid address format');
      }

      const response = await this.makeRequest('POST', `/nfts/${mint}/transfer`, {
        from,
        to,
        platform: 'solana'
      });

      return response.data.transactionSignature;
    } catch (error) {
      if (error instanceof SolanaError) {
        throw error;
      }
      throw new SolanaError('Failed to transfer NFT', 'NFT_TRANSFER_ERROR', error);
    }
  }

  async getOwnerNFTs(owner: string): Promise<SolanaNFT[]> {
    try {
      if (!owner) {
        throw new SolanaValidationError('Owner address is required');
      }

      if (!validatePublicKey(owner)) {
        throw new SolanaValidationError('Invalid owner address');
      }

      const response = await this.makeRequest('GET', `/nfts/owner/${owner}`);
      return response.data;
    } catch (error) {
      if (error instanceof SolanaError) {
        throw error;
      }
      throw new SolanaError('Failed to get owner NFTs', 'NFT_LIST_ERROR', error);
    }
  }

  async getCollectionNFTs(collection: string): Promise<SolanaNFT[]> {
    try {
      if (!collection) {
        throw new SolanaValidationError('Collection address is required');
      }

      if (!validatePublicKey(collection)) {
        throw new SolanaValidationError('Invalid collection address');
      }

      const response = await this.makeRequest('GET', `/nfts/collection/${collection}`);
      return response.data;
    } catch (error) {
      if (error instanceof SolanaError) {
        throw error;
      }
      throw new SolanaError('Failed to get collection NFTs', 'NFT_LIST_ERROR', error);
    }
  }

  async updateNFTMetadata(mint: string, metadata: Partial<SolanaNFTMetadata>): Promise<SolanaNFT> {
    try {
      if (!mint) {
        throw new SolanaValidationError('Mint address is required');
      }

      if (!validatePublicKey(mint)) {
        throw new SolanaValidationError('Invalid mint address');
      }

      const response = await this.makeRequest('PUT', `/nfts/${mint}/metadata`, {
        metadata,
        platform: 'solana'
      });

      return response.data;
    } catch (error) {
      if (error instanceof SolanaError) {
        throw error;
      }
      throw new SolanaError('Failed to update NFT metadata', 'NFT_UPDATE_ERROR', error);
    }
  }

  async burnNFT(mint: string, owner: string): Promise<string> {
    try {
      if (!mint || !owner) {
        throw new SolanaValidationError('Mint and owner addresses are required');
      }

      if (!validatePublicKey(mint) || !validatePublicKey(owner)) {
        throw new SolanaValidationError('Invalid address format');
      }

      const response = await this.makeRequest('POST', `/nfts/${mint}/burn`, {
        owner,
        platform: 'solana'
      });

      return response.data.transactionSignature;
    } catch (error) {
      if (error instanceof SolanaError) {
        throw error;
      }
      throw new SolanaError('Failed to burn NFT', 'NFT_BURN_ERROR', error);
    }
  }

  async createCollection(collection: SolanaNFTCollection, creator: string): Promise<SolanaNFTCollection> {
    try {
      if (!collection || !creator) {
        throw new SolanaValidationError('Collection data and creator are required');
      }

      if (!validatePublicKey(creator)) {
        throw new SolanaValidationError('Invalid creator address');
      }

      const response = await this.makeRequest('POST', '/nfts/collections', {
        ...collection,
        creator,
        platform: 'solana'
      });

      return response.data;
    } catch (error) {
      if (error instanceof SolanaError) {
        throw error;
      }
      throw new SolanaError('Failed to create collection', 'COLLECTION_CREATE_ERROR', error);
    }
  }

  async getCollection(collectionId: string): Promise<SolanaNFTCollection> {
    try {
      if (!collectionId) {
        throw new SolanaValidationError('Collection ID is required');
      }

      const response = await this.makeRequest('GET', `/nfts/collections/${collectionId}`);
      return response.data;
    } catch (error) {
      if (error instanceof SolanaError) {
        throw error;
      }
      throw new SolanaError('Failed to get collection', 'COLLECTION_GET_ERROR', error);
    }
  }

  async listNFT(mint: string, price: number, seller: string, marketplace: string = 'default'): Promise<SolanaMarketplaceListing> {
    try {
      if (!mint || !price || !seller) {
        throw new SolanaValidationError('Mint, price, and seller are required');
      }

      if (!validatePublicKey(mint) || !validatePublicKey(seller)) {
        throw new SolanaValidationError('Invalid address format');
      }

      const response = await this.makeRequest('POST', `/nfts/${mint}/list`, {
        price,
        seller,
        marketplace,
        platform: 'solana'
      });

      return response.data;
    } catch (error) {
      if (error instanceof SolanaError) {
        throw error;
      }
      throw new SolanaError('Failed to list NFT', 'NFT_LIST_ERROR', error);
    }
  }

  async unlistNFT(mint: string, seller: string): Promise<boolean> {
    try {
      if (!mint || !seller) {
        throw new SolanaValidationError('Mint and seller are required');
      }

      if (!validatePublicKey(mint) || !validatePublicKey(seller)) {
        throw new SolanaValidationError('Invalid address format');
      }

      const response = await this.makeRequest('POST', `/nfts/${mint}/unlist`, {
        seller,
        platform: 'solana'
      });

      return response.data.success;
    } catch (error) {
      if (error instanceof SolanaError) {
        throw error;
      }
      throw new SolanaError('Failed to unlist NFT', 'NFT_UNLIST_ERROR', error);
    }
  }

  async buyNFT(mint: string, buyer: string, price: number): Promise<string> {
    try {
      if (!mint || !buyer || !price) {
        throw new SolanaValidationError('Mint, buyer, and price are required');
      }

      if (!validatePublicKey(mint) || !validatePublicKey(buyer)) {
        throw new SolanaValidationError('Invalid address format');
      }

      const response = await this.makeRequest('POST', `/nfts/${mint}/buy`, {
        buyer,
        price,
        platform: 'solana'
      });

      return response.data.transactionSignature;
    } catch (error) {
      if (error instanceof SolanaError) {
        throw error;
      }
      throw new SolanaError('Failed to buy NFT', 'NFT_BUY_ERROR', error);
    }
  }

  async getMarketplaceListings(filters?: {
    collection?: string;
    minPrice?: number;
    maxPrice?: number;
    seller?: string;
    status?: string;
  }): Promise<SolanaMarketplaceListing[]> {
    try {
      const response = await this.makeRequest('GET', '/nfts/marketplace/listings', {
        params: filters
      });

      return response.data;
    } catch (error) {
      if (error instanceof SolanaError) {
        throw error;
      }
      throw new SolanaError('Failed to get marketplace listings', 'MARKETPLACE_LIST_ERROR', error);
    }
  }

  async getNFTStats(): Promise<{
    totalNFTs: number;
    totalCollections: number;
    totalVolume: number;
    averagePrice: number;
    floorPrice: number;
  }> {
    try {
      const response = await this.makeRequest('GET', '/nfts/stats');
      return response.data;
    } catch (error) {
      if (error instanceof SolanaError) {
        throw error;
      }
      throw new SolanaError('Failed to get NFT stats', 'NFT_STATS_ERROR', error);
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
