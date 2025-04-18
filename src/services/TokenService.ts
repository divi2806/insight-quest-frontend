import { ethers } from 'ethers';

// ABI for standard ERC-20 functions
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function transferFrom(address from, address to, uint256 amount) returns (bool)'
];

// Your custom token contract address
const TOKEN_CONTRACT_ADDRESS = '0x4f87b9dE9Dd8F13EC323C0eDfb082c1363BafBb7';

// The address where contest entry fees should be sent
const RECEIVER_ADDRESS = '0x22254eA9fBF6bA715CdCe91Dd453704B12Aa67d4';

// Admin wallet that will pay rewards
const ADMIN_PRIVATE_KEY = 'ea5f30606c38ec9abf62cd19a3cb84db5edb1c5cd1bf9406c9a0f7cd1a26501a';

const TokenService = {
  // Get a provider and signer using the admin private key (for backend operations)
  getProviderAndSigner() {
    // For frontend testing with MetaMask
    if (typeof window !== 'undefined' && window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      return { provider, adminWallet: null };
    }
    
    // For backend or serverless functions
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.REACT_APP_RPC_URL || 'https://ethereum-mainnet.rpc.io'
    );
    const adminWallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
    
    return { provider, adminWallet };
  },
  
  // Transfer tokens from admin wallet to user as reward
  async rewardUserForTask(userAddress: string, amount: number): Promise<string> {
    try {
      const { provider, adminWallet } = this.getProviderAndSigner();
      
      if (!adminWallet) {
        throw new Error('Admin wallet not configured properly');
      }
      
      const tokenContract = new ethers.Contract(
        TOKEN_CONTRACT_ADDRESS, 
        ERC20_ABI, 
        adminWallet
      );
      
      // Convert amount to wei (assuming 18 decimals)
      const amountInWei = ethers.utils.parseUnits(amount.toString(), 18);
      
      // Send the transaction
      const tx = await tokenContract.transfer(userAddress, amountInWei);
      
      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      
      return receipt.transactionHash;
    } catch (error) {
      console.error('Error rewarding user with tokens:', error);
      throw error;
    }
  },
  
  // Get token balance for the admin wallet
  async getAdminBalance(): Promise<string> {
    try {
      const { provider, adminWallet } = this.getProviderAndSigner();
      
      if (!adminWallet) {
        throw new Error('Admin wallet not configured properly');
      }
      
      const tokenContract = new ethers.Contract(
        TOKEN_CONTRACT_ADDRESS, 
        ERC20_ABI, 
        provider
      );
      
      const balance = await tokenContract.balanceOf(adminWallet.address);
      return ethers.utils.formatUnits(balance, 18);
    } catch (error) {
      console.error('Error getting admin balance:', error);
      throw error;
    }
  },
  
  // Get token balance for a user
  async getUserBalance(userAddress: string): Promise<string> {
    try {
      const { provider } = this.getProviderAndSigner();
      
      const tokenContract = new ethers.Contract(
        TOKEN_CONTRACT_ADDRESS, 
        ERC20_ABI, 
        provider
      );
      
      const balance = await tokenContract.balanceOf(userAddress);
      return ethers.utils.formatUnits(balance, 18);
    } catch (error) {
      console.error('Error getting user balance:', error);
      throw error;
    }
  },

  // Get the token balance for a user (used in ContestJoinModal)
  async getTokenBalance(userAddress: string): Promise<number> {
    try {
      if (!window.ethereum) throw new Error('No Ethereum provider found');
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, ERC20_ABI, provider);
      
      const balance = await tokenContract.balanceOf(userAddress);
      // Convert from wei to token units (assuming 18 decimals like most ERC-20 tokens)
      return Number(ethers.utils.formatUnits(balance, 18));
    } catch (error) {
      console.error('Error getting token balance:', error);
      return 0;
    }
  },

  // Transfer tokens for contest entry (from user to receiver)
  async enterContest(userAddress: string, amount: number): Promise<string> {
    try {
      if (!window.ethereum) throw new Error('No Ethereum provider found');
      
      // Request account access if needed
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      // Get the signer for the connected account
      const signer = provider.getSigner();
      
      // Verify the signer address matches the expected user address
      const signerAddress = await signer.getAddress();
      if (signerAddress.toLowerCase() !== userAddress.toLowerCase()) {
        throw new Error('Connected wallet address does not match the expected address');
      }
      
      const tokenContract = new ethers.Contract(TOKEN_CONTRACT_ADDRESS, ERC20_ABI, signer);
      
      // Convert amount to wei
      const amountInWei = ethers.utils.parseUnits(amount.toString(), 18);
      
      // Send the transaction
      const tx = await tokenContract.transfer(RECEIVER_ADDRESS, amountInWei);
      
      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      return receipt.transactionHash;
    } catch (error: any) {
      console.error('Error entering contest:', error);
      throw new Error(error.message || 'Failed to process transaction');
    }
  }
};

export default TokenService;