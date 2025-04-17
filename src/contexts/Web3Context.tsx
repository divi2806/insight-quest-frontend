import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { getConnectedAddress, setConnectedAddress, getCurrentUser, initializeUser } from '../lib/mockData';
import { User } from '../types';
import { getUserStage, getStageEmoji } from '../lib/web3Utils';
import { saveUser, getUser, updateUserXP } from '@/services/firebase';
import LevelUpDialog from '@/components/notifications/LevelUpDialog';
import TokenService from '../lib/tokenContract';

// Sepolia chain info
const SEPOLIA_CHAIN_ID = '0xaa36a7';  // Hex value for Sepolia testnet (11155111 in decimal)
const SEPOLIA_RPC_URL = 'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161';

interface Web3ContextType {
  isConnected: boolean;
  connecting: boolean;
  address: string | null;
  user: User | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  refreshUser: () => Promise<void>;
  updateUsername: (username: string) => void;
  addUserXP: (amount: number) => Promise<void>;
  tokenBalance: string;
  fetchTokenBalance: () => Promise<void>;
}

const Web3Context = createContext<Web3ContextType>({
  isConnected: false,
  connecting: false,
  address: null,
  user: null,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  refreshUser: async () => {},
  updateUsername: () => {},
  addUserXP: async () => {},
  tokenBalance: "0",
  fetchTokenBalance: async () => {}
});

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [address, setAddress] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [dailyLoginChecked, setDailyLoginChecked] = useState<boolean>(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(1);
  const [tokenBalance, setTokenBalance] = useState<string>("0");

  // Function to fetch the token balance
  const fetchTokenBalance = async (): Promise<void> => {
    if (!address || !window.ethereum || !isConnected) return;
    
    try {
      // Use TokenService to get the balance
      const balance = await TokenService.getTokenBalance(address);
      
      // Format to 2 decimal places
      const formattedBalance = balance.toFixed(2);
      
      setTokenBalance(formattedBalance);
    } catch (error) {
      console.error("Error fetching token balance:", error);
    }
  };

  // Function to add $TASK token to MetaMask
  const addTokenToWallet = async () => {
    if (!window.ethereum) return false;
    
    try {
      // Request to add the token to the wallet
      const wasAdded = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: '0x4f87b9dE9Dd8F13EC323C0eDfb082c1363BafBb7', // TASK token contract address
            symbol: 'TASK',
            decimals: 18,
            image: 'https://imgur.com/a/BzNO9wc', // Replace with your token logo URL
          },
        },
      });
      
      if (wasAdded) {
        toast.success('$TASK token added to your wallet!');
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error adding token to wallet:', error);
      return false;
    }
  };
  
  // Check if the user is on the correct network
  const checkAndSwitchNetwork = async () => {
    if (!window.ethereum) return false;
    
    try {
      // Get the current chain ID
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      
      // If not on Sepolia, switch
      if (chainId !== SEPOLIA_CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: SEPOLIA_CHAIN_ID }],
          });
          return true;
        } catch (switchError: any) {
          // This error code indicates that the chain has not been added to MetaMask
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: SEPOLIA_CHAIN_ID,
                    chainName: 'Sepolia Testnet',
                    rpcUrls: [SEPOLIA_RPC_URL],
                    nativeCurrency: {
                      name: 'Sepolia ETH',
                      symbol: 'ETH',
                      decimals: 18,
                    },
                    blockExplorerUrls: ['https://sepolia.etherscan.io/'],
                  },
                ],
              });
              return true;
            } catch (addError) {
              console.error('Error adding Sepolia network:', addError);
              return false;
            }
          }
          console.error('Error switching to Sepolia network:', switchError);
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error('Error checking network:', error);
      return false;
    }
  };

  // Listen for network changes
  useEffect(() => {
    if (!window.ethereum) return;
    
    const handleChainChanged = async (chainId: string) => {
      if (chainId !== SEPOLIA_CHAIN_ID && isConnected) {
        toast.warning('Network Change Detected', {
          description: 'Please use Sepolia Testnet for InsightQuest',
          action: {
            label: 'Switch Back',
            onClick: checkAndSwitchNetwork,
          },
          duration: 0, // Keep toast visible until dismissed
        });
      }
    };
    
    window.ethereum.on('chainChanged', handleChainChanged);
    
    // Clean up listener on unmount
    return () => {
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [isConnected]);

  const checkDailyLogin = async (currentUser: User) => {
    const today = new Date().toISOString().split('T')[0];
    const lastLogin = currentUser.lastLogin;
    
    // Initialize streak if not present
    if (!currentUser.loginStreak) {
      currentUser.loginStreak = 0;
    }
    
    if (lastLogin !== today) {
      // Check if streak should continue or reset
      let streak = currentUser.loginStreak || 0;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      // If last login was yesterday, increment streak
      if (lastLogin === yesterdayStr) {
        streak += 1;
      } 
      // If last login was more than a day ago, reset streak
      else if (lastLogin) {
        streak = 1; // Reset but count today
      } 
      // First time login
      else {
        streak = 1;
      }
      
      // Calculate XP bonus based on streak
      let xpReward = 100; // Base XP reward
      let streakBonus = 0;
      
      if (streak >= 7) {
        streakBonus = 100; // 7+ days streak
      } else if (streak >= 3) {
        streakBonus = 50; // 3-6 days streak
      }
      
      const totalXp = xpReward + streakBonus;
      
      // Update user with new XP and streak info
      const updatedUser = {
        ...currentUser,
        xp: currentUser.xp + totalXp,
        lastLogin: today,
        loginStreak: streak
      };
      
      // Calculate new level
      const oldLevel = currentUser.level;
      const newLevel = Math.floor(Math.sqrt(updatedUser.xp / 100)) + 1;
      updatedUser.level = newLevel;
      
      // Update stage if level changed
      if (oldLevel !== newLevel) {
        updatedUser.stage = getUserStage(newLevel);
      }
      
      // Update user in Firebase
      await saveUser(updatedUser);
      
      // Show toast notification with appropriate message
      if (streak > 1) {
        toast.success(`${streak}-Day Streak! +${totalXp} XP`, {
          description: `You've logged in ${streak} days in a row! Keep it up for more rewards.`,
          duration: 5000,
        });
      } else {
        toast.success(`Daily Login Reward! +${totalXp} XP`, {
          description: `Welcome back! You've earned ${totalXp} XP for logging in today.`,
          duration: 5000,
        });
      }
      
      // Show level up dialog if level changed
      if (oldLevel !== newLevel) {
        setNewLevel(newLevel);
        setShowLevelUp(true);
      }
      
      return updatedUser;
    }
    
    return currentUser;
  };

  // Update checkConnection function
  const checkConnection = async () => {
    try {
      const savedAddress = getConnectedAddress();
      if (savedAddress) {
        // Normalize the address to lowercase
        const normalizedAddress = savedAddress.toLowerCase();
        setAddress(normalizedAddress);
        setIsConnected(true);
        
        // Save the normalized address
        setConnectedAddress(normalizedAddress);
        localStorage.setItem('connectedAddress', normalizedAddress);
        
        // Try to get user from Firebase first
        let fbUser = await getUser(normalizedAddress);
        
        // If not found in Firebase, fall back to local storage or create new
        if (!fbUser) {
          let currentUser = getCurrentUser();
          
          if (currentUser) {
            // Ensure wallet address is stored in lowercase
            currentUser.address = normalizedAddress;
            currentUser.id = normalizedAddress;
            
            // Save to Firebase
            await saveUser(currentUser);
            fbUser = currentUser;
          } else {
            // Create new user if none exists
            const newUser = initializeUser(normalizedAddress);
            await saveUser(newUser);
            fbUser = newUser;
          }
        }
        
        if (fbUser) {
          // Ensure address is normalized
          fbUser.address = normalizedAddress;
          
          // Set stage based on level
          fbUser = {
            ...fbUser,
            stage: getUserStage(fbUser.level)
          };
          
          // Check for daily login if not already checked
          if (!dailyLoginChecked) {
            fbUser = await checkDailyLogin(fbUser);
            setDailyLoginChecked(true);
          }
          
          setUser(fbUser);
          
          // Fetch token balance after user is set
          await fetchTokenBalance();
        }
        
        // Ensure correct network
        await checkAndSwitchNetwork();
        
        // Check and add $TASK token to wallet if needed
        try {
          await addTokenToWallet();
        } catch (tokenError) {
          console.error('Error adding token on reconnect:', tokenError);
        }
      }
    } catch (error) {
      console.error("Error checking connection:", error);
      toast.error("Error connecting to wallet", {
        description: "Please try refreshing the page or reconnecting your wallet"
      });
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);
  
  const updateUsername = async (username: string) => {
    if (!address || !user) return;
    
    const updatedUser = {
      ...user,
      username
    };
    
    // Update user in Firebase
    const success = await saveUser(updatedUser);
    
    if (success) {
      setUser(updatedUser);
      toast.success('Username updated successfully!');
    } else {
      toast.error('Failed to update username');
    }
  };

  const addUserXP = async (amount: number) => {
    if (!user?.id) return;
    
    try {
      const result = await updateUserXP(user.id, amount);
      
      if (result.success) {
        // Update local user state with new XP and level
        const updatedUser = {
          ...user,
          xp: result.newXP,
          level: result.newLevel,
          stage: getUserStage(result.newLevel)
        };
        
        setUser(updatedUser);
        
        // Show toast notification for XP gain
        toast.success(`+${amount} XP earned!`);
        
        // Check for level up
        if (result.oldLevel !== result.newLevel) {
          setNewLevel(result.newLevel);
          setShowLevelUp(true);
        }
      }
    } catch (error) {
      console.error("Error adding XP:", error);
    }
  };

  // Update connectWallet function
  const connectWallet = async () => {
    try {
      setConnecting(true);
      
      // Check if Metamask is installed
      if (typeof window.ethereum === 'undefined') {
        toast.error('Metamask not installed', {
          description: 'Please install Metamask to continue'
        });
        return;
      }
      
      // Try to switch to Sepolia network first
      try {
        // Check and switch to Sepolia network
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: SEPOLIA_CHAIN_ID }],
        });
      } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: SEPOLIA_CHAIN_ID,
                  chainName: 'Sepolia Testnet',
                  rpcUrls: [SEPOLIA_RPC_URL],
                  nativeCurrency: {
                    name: 'Sepolia ETH',
                    symbol: 'ETH',
                    decimals: 18,
                  },
                  blockExplorerUrls: ['https://sepolia.etherscan.io/'],
                },
              ],
            });
          } catch (addError) {
            console.error('Error adding Sepolia network:', addError);
            toast.error('Network Switch Failed', {
              description: 'Please manually switch to Sepolia Testnet to continue'
            });
            setConnecting(false);
            return;
          }
        } else {
          console.error('Error switching to Sepolia network:', switchError);
          toast.error('Network Switch Failed', {
            description: 'Please manually switch to Sepolia Testnet to continue'
          });
          setConnecting(false);
          return;
        }
      }
      
      // Request accounts
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts returned from wallet');
      }
      
      const userAddress = accounts[0].toLowerCase(); // Normalize to lowercase
      
      // Success!
      setAddress(userAddress);
      setConnectedAddress(userAddress); // Save to localStorage
      localStorage.setItem('connectedAddress', userAddress);
      setIsConnected(true);
      
      // Try to get user from Firebase first
      let fbUser = await getUser(userAddress);
      let isNewUser = false;
      
      // If not found in Firebase, check local storage or create new
      if (!fbUser) {
        let currentUser = getCurrentUser();
        
        if (!currentUser) {
          currentUser = initializeUser(userAddress);
          isNewUser = true;
        }
        
        // Ensure ID and address match and are normalized
        currentUser.id = userAddress;
        currentUser.address = userAddress;
        
        // Save to Firebase
        await saveUser(currentUser);
        fbUser = currentUser;
      }
      
      // Set stage based on level
      fbUser = {
        ...fbUser,
        stage: getUserStage(fbUser.level)
      };
      
      // Generate a unique avatar for the user if they don't have one already
      if (!fbUser.avatarUrl) {
        // Generate a unique seed based on the user's address to ensure consistency
        const seed = fbUser.address.slice(2, 10); // Use part of the address as seed
        fbUser.avatarUrl = `https://api.dicebear.com/6.x/avataaars/svg?seed=${seed}`;
        await saveUser(fbUser);
      }
      
      setUser(fbUser);
      
      // Fetch token balance
      try {
        await fetchTokenBalance();
      } catch (tokenError) {
        console.error('Error fetching token balance:', tokenError);
        // Don't break the flow if token balance fetching fails
      }
      
      // Show welcome back toast with stage info if returning user
      if (!isNewUser) {
        const emoji = getStageEmoji(fbUser.stage);
        toast.success(`Welcome back to InsightQuest!`, {
          description: `You're currently at the ${emoji} ${fbUser.stage} stage. Keep going!`
        });
        
        // Check daily login reward after a short delay
        setTimeout(async () => {
          try {
            const updatedUser = await checkDailyLogin(fbUser);
            if (updatedUser !== fbUser) {
              setUser(updatedUser);
            }
            setDailyLoginChecked(true);
          } catch (loginError) {
            console.error('Error checking daily login:', loginError);
          }
        }, 1500);
      } else {
        toast.success('Wallet connected successfully!');
      }
      
      // Automatically add $TASK token to wallet
      try {
        await addTokenToWallet();
      } catch (tokenError) {
        console.error('Error adding token:', tokenError);
        // Don't show error toast to user as this is a non-critical feature
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet', {
        description: 'Please try again or use a different wallet'
      });
    } finally {
      setConnecting(false);
    }
  };
  
  const disconnectWallet = () => {
    setAddress(null);
    setIsConnected(false);
    setUser(null);
    setTokenBalance("0");
    localStorage.removeItem('connectedAddress');
    toast.info('Wallet disconnected');
  };
  
  const refreshUser = async () => {
    if (address) {
      try {
        // Get fresh user data from Firebase
        let refreshedUser = await getUser(address);
        
        // If not found in Firebase, fall back to local storage or create new
        if (!refreshedUser) {
          refreshedUser = getCurrentUser();
          
          if (!refreshedUser) {
            refreshedUser = initializeUser(address);
          }
          
          // Ensure address is normalized
          refreshedUser.address = address.toLowerCase();
          refreshedUser.id = address.toLowerCase();
          
          // Save to Firebase for future use
          await saveUser(refreshedUser);
        }
        
        if (refreshedUser) {
          // Set stage based on level
          refreshedUser = {
            ...refreshedUser,
            stage: getUserStage(refreshedUser.level)
          };
          
          setUser(refreshedUser);
          
          // Also refresh token balance
          await fetchTokenBalance();
        }
      } catch (error) {
        console.error("Error refreshing user:", error);
      }
    }
  };
  
  // Check for token balance updates periodically
  useEffect(() => {
    if (isConnected && address) {
      // Initial fetch
      fetchTokenBalance();
      
      // Set up periodic refresh (every 30 seconds)
      const intervalId = setInterval(() => {
        fetchTokenBalance();
      }, 30000);
      
      // Clean up interval
      return () => clearInterval(intervalId);
    }
  }, [isConnected, address]);
  
  return (
    <Web3Context.Provider 
      value={{ 
        isConnected, 
        connecting, 
        address, 
        user,
        connectWallet, 
        disconnectWallet,
        refreshUser,
        updateUsername,
        addUserXP,
        tokenBalance,
        fetchTokenBalance
      }}
    >
      {children}
      
      {/* Level Up Dialog */}
      <LevelUpDialog 
        level={newLevel}
        open={showLevelUp}
        onOpenChange={setShowLevelUp}
      />
    </Web3Context.Provider>
  );
};

// Add TypeScript interface for Ethereum window object
declare global {
  interface Window {
    ethereum: any;
    web3: any;
  }
}