# ⚡ LicenseChain Solana SDK

[![npm version](https://badge.fury.io/js/@licensechain%2Fsolana-sdk.svg)](https://badge.fury.io/js/@licensechain%2Fsolana-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

> **High-performance Solana integration for LicenseChain** - Deploy, manage, and verify software licenses on the Solana blockchain using Program Derived Addresses (PDAs) and SPL tokens.

## 🌟 Features

### ⚡ **High-Performance Blockchain**
- **Fast Transactions** - Sub-second transaction confirmation
- **Low Fees** - Fraction of a cent per transaction
- **High Throughput** - 65,000+ transactions per second
- **Program Derived Addresses** - Secure, deterministic account generation

### 🎯 **SPL Token Integration**
- **SPL Token Licenses** - Use SPL tokens as license representations
- **Metadata Standards** - Metaplex metadata compatibility
- **Token Programs** - SPL Token and Token-2022 support
- **NFT Licenses** - Unique license tokens as NFTs

### 🔐 **Advanced Security**
- **PDA-based Architecture** - Secure account management
- **Multi-signature Support** - Require multiple signatures
- **Authority Management** - Granular permission control
- **Upgradeable Programs** - Program upgrade capabilities

### 🌐 **Multi-Cluster Support**
- **Mainnet Beta** - Production deployments
- **Devnet** - Development and testing
- **Testnet** - Pre-production testing
- **Localnet** - Local development

## 🚀 Quick Start

### Installation

```bash
npm install @licensechain/solana-sdk
# or
yarn add @licensechain/solana-sdk
# or
pnpm add @licensechain/solana-sdk
```

### Basic Usage

```typescript
import { LicenseChainSolana } from '@licensechain/solana-sdk';

// Initialize the SDK
const licenseChain = new LicenseChainSolana({
  cluster: 'devnet', // or 'mainnet-beta', 'testnet'
  privateKey: process.env.PRIVATE_KEY,
  rpcUrl: process.env.RPC_URL
});

// Deploy a license program
const program = await licenseChain.deployLicenseProgram({
  name: 'My Software License',
  symbol: 'MSL',
  uri: 'https://api.myapp.com/licenses/',
  maxSupply: 10000
});

// Create a license
const license = await program.createLicense({
  owner: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
  metadata: {
    software: 'MyApp Pro',
    version: '2.0.0',
    features: ['premium', 'unlimited'],
    expiresAt: 1735689600
  }
});

// Verify a license
const isValid = await program.verifyLicense(license.publicKey);
console.log('License valid:', isValid);
```

## 📚 API Reference

### LicenseChainSolana

#### Constructor Options

```typescript
interface SolanaConfig {
  cluster: 'mainnet-beta' | 'devnet' | 'testnet' | 'localnet';
  privateKey: string;
  rpcUrl?: string;
  commitment?: 'processed' | 'confirmed' | 'finalized';
  skipPreflight?: boolean;
  preflightCommitment?: 'processed' | 'confirmed' | 'finalized';
}
```

#### Methods

##### `deployLicenseProgram(options)`
Deploy a new license program.

```typescript
interface DeployOptions {
  name: string;
  symbol: string;
  uri: string;
  maxSupply?: number;
  decimals?: number;
  freezeAuthority?: string;
}

const program = await licenseChain.deployLicenseProgram({
  name: 'My Software License',
  symbol: 'MSL',
  uri: 'https://api.myapp.com/licenses/',
  maxSupply: 10000,
  decimals: 0
});
```

##### `getProgram(address)`
Get an existing program instance.

```typescript
const program = await licenseChain.getProgram('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU');
```

### LicenseProgram

#### Methods

##### `createLicense(options)`
Create a new license.

```typescript
interface CreateLicenseOptions {
  owner: string;
  metadata: LicenseMetadata;
  expiresAt?: number;
  transferable?: boolean;
}

interface LicenseMetadata {
  software: string;
  version: string;
  features: string[];
  expiresAt?: number;
  customData?: Record<string, any>;
}

const license = await program.createLicense({
  owner: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
  metadata: {
    software: 'MyApp Pro',
    version: '2.0.0',
    features: ['premium', 'unlimited'],
    expiresAt: 1735689600
  },
  transferable: true
});
```

##### `verifyLicense(licenseAddress)`
Verify if a license is valid.

```typescript
const isValid = await program.verifyLicense('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU');
```

##### `getLicenseInfo(licenseAddress)`
Get license information.

```typescript
const licenseInfo = await program.getLicenseInfo('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU');
```

##### `transferLicense(from, to, licenseAddress)`
Transfer a license to another address.

```typescript
const signature = await program.transferLicense(
  '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU', // from
  '9yKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsV', // to
  '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'  // license
);
```

##### `revokeLicense(licenseAddress)`
Revoke a license.

```typescript
const signature = await program.revokeLicense('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU');
```

##### `batchCreateLicenses(licenses)`
Create multiple licenses in a single transaction.

```typescript
const licenses = await program.batchCreateLicenses([
  {
    owner: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    metadata: { software: 'MyApp Basic', version: '1.0.0', features: ['basic'] }
  },
  {
    owner: '9yKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsV',
    metadata: { software: 'MyApp Pro', version: '2.0.0', features: ['premium', 'unlimited'] }
  }
]);
```

## 🔧 Advanced Features

### Program Derived Addresses (PDAs)

```typescript
// Generate PDA for license
const [licensePDA] = await PublicKey.findProgramAddress(
  [Buffer.from('license'), ownerPublicKey.toBuffer()],
  programId
);

// Generate PDA for metadata
const [metadataPDA] = await PublicKey.findProgramAddress(
  [Buffer.from('metadata'), licensePDA.toBuffer()],
  programId
);
```

### Multi-signature Support

```typescript
const multiSigProgram = await licenseChain.deployMultiSigLicenseProgram({
  name: 'MultiSig License',
  symbol: 'MSL',
  uri: 'https://api.myapp.com/licenses/',
  requiredSignatures: 3,
  signers: [
    '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    '9yKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsV',
    '8zKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsW'
  ]
});
```

### Authority Management

```typescript
// Set mint authority
await program.setMintAuthority('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU');

// Set freeze authority
await program.setFreezeAuthority('9yKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsV');

// Revoke authority
await program.revokeAuthority('8zKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsW');
```

## 🌐 Cluster Configuration

### Supported Clusters

| Cluster | RPC URL | Explorer |
|---------|---------|----------|
| Mainnet Beta | https://api.mainnet-beta.solana.com | https://explorer.solana.com |
| Devnet | https://api.devnet.solana.com | https://explorer.solana.com/?cluster=devnet |
| Testnet | https://api.testnet.solana.com | https://explorer.solana.com/?cluster=testnet |
| Localnet | http://localhost:8899 | http://localhost:8899 |

### Custom Cluster

```typescript
const licenseChain = new LicenseChainSolana({
  cluster: 'custom',
  rpcUrl: 'https://your-custom-rpc.com',
  commitment: 'confirmed'
});
```

## 🔒 Security Best Practices

### Key Management

```typescript
// Use environment variables
const licenseChain = new LicenseChainSolana({
  cluster: 'mainnet-beta',
  privateKey: process.env.PRIVATE_KEY
});

// Use wallet adapter
const licenseChain = new LicenseChainSolana({
  cluster: 'mainnet-beta',
  wallet: walletAdapter
});
```

### Transaction Safety

```typescript
// Set commitment level
const licenseChain = new LicenseChainSolana({
  cluster: 'mainnet-beta',
  privateKey: process.env.PRIVATE_KEY,
  commitment: 'finalized'
});

// Enable preflight checks
const licenseChain = new LicenseChainSolana({
  cluster: 'mainnet-beta',
  privateKey: process.env.PRIVATE_KEY,
  skipPreflight: false
});
```

## 📊 Error Handling

```typescript
import { LicenseChainError, ErrorCodes } from '@licensechain/solana-sdk';

try {
  const license = await program.createLicense(options);
} catch (error) {
  if (error instanceof LicenseChainError) {
    switch (error.code) {
      case ErrorCodes.INSUFFICIENT_FUNDS:
        console.error('Insufficient SOL for transaction');
        break;
      case ErrorCodes.INVALID_ACCOUNT:
        console.error('Invalid account address');
        break;
      case ErrorCodes.LICENSE_NOT_FOUND:
        console.error('License not found');
        break;
      default:
        console.error('Unknown error:', error.message);
    }
  }
}
```

## 🧪 Testing

```typescript
import { LicenseChainSolana } from '@licensechain/solana-sdk';

describe('LicenseChain Solana SDK', () => {
  let licenseChain: LicenseChainSolana;
  let program: LicenseProgram;

  beforeEach(async () => {
    licenseChain = new LicenseChainSolana({
      cluster: 'devnet',
      privateKey: process.env.TEST_PRIVATE_KEY
    });

    program = await licenseChain.deployLicenseProgram({
      name: 'Test License',
      symbol: 'TL',
      uri: 'https://test.com/'
    });
  });

  it('should create a license', async () => {
    const license = await program.createLicense({
      owner: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
      metadata: { software: 'Test App', version: '1.0.0', features: ['basic'] }
    });

    expect(license.publicKey).toBeDefined();
    expect(license.owner).toBe('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU');
  });
});
```

## 📦 Package Scripts

```json
{
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "deploy:devnet": "ts-node scripts/deploy-devnet.ts",
    "deploy:mainnet": "ts-node scripts/deploy-mainnet.ts"
  }
}
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
git clone https://github.com/LicenseChain/LicenseChain-Solana-SDK.git
cd LicenseChain-Solana-SDK
npm install
npm run build
npm test
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Documentation](https://docs.licensechain.com/solana-sdk)
- [GitHub Repository](https://github.com/LicenseChain/LicenseChain-Solana-SDK)
- [NPM Package](https://www.npmjs.com/package/@licensechain/solana-sdk)
- [Discord Community](https://discord.gg/licensechain)
- [Twitter](https://twitter.com/licensechain)

## 🆘 Support

- 📧 Email: support@licensechain.com
- 💬 Discord: [LicenseChain Community](https://discord.gg/licensechain)
- 📖 Documentation: [docs.licensechain.com](https://docs.licensechain.com)
- 🐛 Issues: [GitHub Issues](https://github.com/LicenseChain/LicenseChain-Solana-SDK/issues)

---

**Built with ❤️ by the LicenseChain Team**
