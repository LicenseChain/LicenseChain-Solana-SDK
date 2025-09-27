import { SolanaConfig } from './types';
import { SolanaError, SolanaNetworkError, SolanaValidationError } from './errors';
import { validatePublicKey, retry } from './utils';

export interface License {
  id: string;
  userId: string;
  productId: string;
  licenseKey: string;
  status: 'active' | 'inactive' | 'expired' | 'suspended';
  createdAt: string;
  expiresAt?: string;
  metadata?: Record<string, any>;
}

export class SolanaLicenseManager {
  private config: SolanaConfig;

  constructor(config: SolanaConfig) {
    this.config = config;
  }

  async createLicense(userId: string, productId: string, metadata?: Record<string, any>): Promise<License> {
    try {
      if (!userId || !productId) {
        throw new SolanaValidationError('User ID and Product ID are required');
      }

      const response = await this.makeRequest('POST', '/licenses', {
        userId,
        productId,
        metadata: {
          ...metadata,
          platform: 'solana',
          createdVia: 'sdk'
        }
      });

      return response.data;
    } catch (error) {
      if (error instanceof SolanaError) {
        throw error;
      }
      throw new SolanaError('Failed to create license', 'LICENSE_CREATE_ERROR', error);
    }
  }

  async validateLicense(licenseKey: string): Promise<boolean> {
    try {
      if (!licenseKey) {
        throw new SolanaValidationError('License key is required');
      }

      const response = await this.makeRequest('POST', '/licenses/validate', {
        licenseKey,
        platform: 'solana'
      });

      return response.data.valid;
    } catch (error) {
      if (error instanceof SolanaError) {
        throw error;
      }
      throw new SolanaError('Failed to validate license', 'LICENSE_VALIDATE_ERROR', error);
    }
  }

  async getLicense(licenseId: string): Promise<License> {
    try {
      if (!licenseId) {
        throw new SolanaValidationError('License ID is required');
      }

      const response = await this.makeRequest('GET', `/licenses/${licenseId}`);
      return response.data;
    } catch (error) {
      if (error instanceof SolanaError) {
        throw error;
      }
      throw new SolanaError('Failed to get license', 'LICENSE_GET_ERROR', error);
    }
  }

  async updateLicense(licenseId: string, updates: Partial<License>): Promise<License> {
    try {
      if (!licenseId) {
        throw new SolanaValidationError('License ID is required');
      }

      const response = await this.makeRequest('PUT', `/licenses/${licenseId}`, {
        ...updates,
        platform: 'solana'
      });

      return response.data;
    } catch (error) {
      if (error instanceof SolanaError) {
        throw error;
      }
      throw new SolanaError('Failed to update license', 'LICENSE_UPDATE_ERROR', error);
    }
  }

  async revokeLicense(licenseId: string): Promise<boolean> {
    try {
      if (!licenseId) {
        throw new SolanaValidationError('License ID is required');
      }

      const response = await this.makeRequest('DELETE', `/licenses/${licenseId}`);
      return response.data.success;
    } catch (error) {
      if (error instanceof SolanaError) {
        throw error;
      }
      throw new SolanaError('Failed to revoke license', 'LICENSE_REVOKE_ERROR', error);
    }
  }

  async getUserLicenses(userId: string): Promise<License[]> {
    try {
      if (!userId) {
        throw new SolanaValidationError('User ID is required');
      }

      const response = await this.makeRequest('GET', `/users/${userId}/licenses`);
      return response.data;
    } catch (error) {
      if (error instanceof SolanaError) {
        throw error;
      }
      throw new SolanaError('Failed to get user licenses', 'LICENSE_LIST_ERROR', error);
    }
  }

  async getProductLicenses(productId: string): Promise<License[]> {
    try {
      if (!productId) {
        throw new SolanaValidationError('Product ID is required');
      }

      const response = await this.makeRequest('GET', `/products/${productId}/licenses`);
      return response.data;
    } catch (error) {
      if (error instanceof SolanaError) {
        throw error;
      }
      throw new SolanaError('Failed to get product licenses', 'LICENSE_LIST_ERROR', error);
    }
  }

  async extendLicense(licenseId: string, days: number): Promise<License> {
    try {
      if (!licenseId) {
        throw new SolanaValidationError('License ID is required');
      }

      if (days <= 0) {
        throw new SolanaValidationError('Days must be greater than 0');
      }

      const response = await this.makeRequest('POST', `/licenses/${licenseId}/extend`, {
        days,
        platform: 'solana'
      });

      return response.data;
    } catch (error) {
      if (error instanceof SolanaError) {
        throw error;
      }
      throw new SolanaError('Failed to extend license', 'LICENSE_EXTEND_ERROR', error);
    }
  }

  async suspendLicense(licenseId: string, reason?: string): Promise<boolean> {
    try {
      if (!licenseId) {
        throw new SolanaValidationError('License ID is required');
      }

      const response = await this.makeRequest('POST', `/licenses/${licenseId}/suspend`, {
        reason,
        platform: 'solana'
      });

      return response.data.success;
    } catch (error) {
      if (error instanceof SolanaError) {
        throw error;
      }
      throw new SolanaError('Failed to suspend license', 'LICENSE_SUSPEND_ERROR', error);
    }
  }

  async unsuspendLicense(licenseId: string): Promise<boolean> {
    try {
      if (!licenseId) {
        throw new SolanaValidationError('License ID is required');
      }

      const response = await this.makeRequest('POST', `/licenses/${licenseId}/unsuspend`, {
        platform: 'solana'
      });

      return response.data.success;
    } catch (error) {
      if (error instanceof SolanaError) {
        throw error;
      }
      throw new SolanaError('Failed to unsuspend license', 'LICENSE_UNSUSPEND_ERROR', error);
    }
  }

  async getLicenseStats(): Promise<{
    total: number;
    active: number;
    expired: number;
    suspended: number;
    revenue: number;
  }> {
    try {
      const response = await this.makeRequest('GET', '/licenses/stats');
      return response.data;
    } catch (error) {
      if (error instanceof SolanaError) {
        throw error;
      }
      throw new SolanaError('Failed to get license stats', 'LICENSE_STATS_ERROR', error);
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
