import { LicenseChainSolana } from '../src/LicenseChainSolana';
import { SolanaConfig } from '../src/types';

// Example configuration
const config: SolanaConfig = {
  apiKey: 'your-api-key-here',
  baseUrl: 'https://api.licensechain.app',
  rpcUrl: 'https://api.mainnet-beta.solana.com',
  timeout: 30000,
  retries: 3
};

// Initialize the SDK
const solana = new LicenseChainSolana(config);

async function basicUsageExample() {
  try {
    console.log('🚀 LicenseChain Solana SDK - Basic Usage Example\n');

    // 1. Account Management
    console.log('📊 Account Management:');
    const publicKey = 'YourPublicKeyHere';
    
    // Get account information
    const account = await solana.getAccount(publicKey);
    console.log('Account Info:', account);
    
    // Get account balance
    const balance = await solana.getBalance(publicKey);
    console.log('Balance (lamports):', balance);
    
    // Get token accounts
    const tokenAccounts = await solana.getTokenAccounts(publicKey);
    console.log('Token Accounts:', tokenAccounts);

    // 2. License Management
    console.log('\n🔑 License Management:');
    
    // Create a license
    const license = await solana.createLicense('user123', 'product456', {
      platform: 'solana',
      features: ['nft_minting', 'defi_trading']
    });
    console.log('Created License:', license);
    
    // Validate a license
    const isValid = await solana.validateLicense(license.licenseKey);
    console.log('License Valid:', isValid);
    
    // Get license details
    const licenseDetails = await solana.getLicense(license.id);
    console.log('License Details:', licenseDetails);

    // 3. NFT Management
    console.log('\n🎨 NFT Management:');
    
    // Create an NFT
    const nft = await solana.createNFT({
      name: 'My Solana NFT',
      symbol: 'MSN',
      description: 'A sample NFT created with LicenseChain',
      image: 'https://example.com/image.png',
      attributes: [
        { trait_type: 'Rarity', value: 'Common' },
        { trait_type: 'Color', value: 'Blue' }
      ]
    }, publicKey);
    console.log('Created NFT:', nft);
    
    // Get NFT details
    const nftDetails = await solana.getNFT(nft.mint);
    console.log('NFT Details:', nftDetails);
    
    // Get owner's NFTs
    const ownerNFTs = await solana.getOwnerNFTs(publicKey);
    console.log('Owner NFTs:', ownerNFTs);

    // 4. DeFi Management
    console.log('\n💰 DeFi Management:');
    
    // Get DeFi positions
    const positions = await solana.getDeFiPositions(publicKey);
    console.log('DeFi Positions:', positions);
    
    // Add liquidity to a pool
    const poolAddress = 'PoolAddressHere';
    const liquidityTx = await solana.addLiquidity(poolAddress, '1000000', publicKey);
    console.log('Liquidity Transaction:', liquidityTx);

    // 5. Transaction Management
    console.log('\n📝 Transaction Management:');
    
    // Get latest blockhash
    const blockhash = await solana.getLatestBlockhash();
    console.log('Latest Blockhash:', blockhash);
    
    // Get cluster information
    const clusterInfo = await solana.getClusterInfo();
    console.log('Cluster Info:', clusterInfo);

    // 6. Validator Information
    console.log('\n🏛️ Validator Information:');
    
    // Get validators
    const validators = await solana.getValidators();
    console.log('Validators Count:', validators.length);
    console.log('First Validator:', validators[0]);

    // 7. Stake Management
    console.log('\n🥩 Stake Management:');
    
    // Get stake accounts
    const stakeAccounts = await solana.getStakeAccounts(publicKey);
    console.log('Stake Accounts:', stakeAccounts);

    console.log('\n✅ Basic usage example completed successfully!');

  } catch (error) {
    console.error('❌ Error in basic usage example:', error);
  }
}

async function advancedUsageExample() {
  try {
    console.log('\n🔧 LicenseChain Solana SDK - Advanced Usage Example\n');

    // 1. Error Handling
    console.log('🛡️ Error Handling:');
    try {
      await solana.getAccount('invalid-key');
    } catch (error) {
      console.log('Caught expected error:', error.message);
    }

    // 2. Batch Operations
    console.log('\n📦 Batch Operations:');
    const promises = [
      solana.getBalance('PublicKey1'),
      solana.getBalance('PublicKey2'),
      solana.getBalance('PublicKey3')
    ];
    
    const balances = await Promise.allSettled(promises);
    console.log('Batch Balance Results:', balances);

    // 3. NFT Collection Management
    console.log('\n🎨 NFT Collection Management:');
    
    // Create a collection
    const collection = await solana.createCollection({
      name: 'My Collection',
      symbol: 'MC',
      description: 'A sample NFT collection',
      image: 'https://example.com/collection.png',
      sellerFeeBasisPoints: 500,
      creators: [
        { address: 'CreatorAddress', verified: true, share: 100 }
      ]
    }, 'CreatorAddress');
    console.log('Created Collection:', collection);

    // 4. DeFi Pool Management
    console.log('\n🏊 DeFi Pool Management:');
    
    // Get liquidity pools
    const pools = await solana.getLiquidityPools();
    console.log('Available Pools:', pools.length);
    
    // Get lending pools
    const lendingPools = await solana.getLendingPools();
    console.log('Lending Pools:', lendingPools.length);
    
    // Get staking pools
    const stakingPools = await solana.getStakingPools();
    console.log('Staking Pools:', stakingPools.length);

    // 5. Statistics
    console.log('\n📈 Statistics:');
    
    // Get DeFi stats
    const defiStats = await solana.getDeFiStats();
    console.log('DeFi Stats:', defiStats);

    console.log('\n✅ Advanced usage example completed successfully!');

  } catch (error) {
    console.error('❌ Error in advanced usage example:', error);
  }
}

// Run examples
async function runExamples() {
  await basicUsageExample();
  await advancedUsageExample();
  
  // Cleanup
  await solana.disconnect();
  console.log('\n🔌 Disconnected from LicenseChain Solana SDK');
}

// Execute examples
runExamples().catch(console.error);
