# InsightQuest

A DAO-based productivity platform that rewards users with $TASK tokens for completing productivity tasks and provides an AI agent marketplace.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technical Architecture](#technical-architecture)
- [Getting Started](#getting-started)
- [Tokenomics](#tokenomics)
- [Revenue Model](#revenue-model)
- [Smart Contracts](#smart-contracts)
- [Future Roadmap](#future-roadmap)
- [Contributing](#contributing)
- [License](#license)

## Overview

InsightQuest is a decentralized productivity platform built on the Web3 ecosystem that incentivizes users through the $TASK token economy. The platform enables users to earn rewards for completing productivity tasks like solving LeetCode problems or watching educational content, while also providing an AI agent marketplace where users can purchase productivity tools using $TASK tokens.

### Core Concept

Think of InsightQuest as "Duolingo + ChatGPT + GitHub Copilot + Token Economy":

- **Earn** tokens by completing productive tasks
- **Purchase** AI agents to automate workflows
- **Create** and sell your own AI agents
- **Participate** in DAO governance
- **Compete** in productivity contests

## Features

### Task-Based Rewards System
- Complete productivity tasks to earn $TASK tokens
- LeetCode problem solving
- Educational content consumption
- Daily login streaks

### Verification Layer
- AI-based verification of task completion
- Community verification system
- Proof submission and validation

### AI Agent Marketplace
- Purchase AI agents using $TASK tokens
- Deploy and monetize your own AI agents
- Revenue sharing: 97.5% to creators, 2.5% platform fee

### Zappy Chat
- Personal AI assistant for planning and brainstorming
- Customizable features with $TASK tokens

### Contests & Challenges
- Participate in productivity competitions
- Win token rewards and recognition

### Leaderboard & Gamification
- XP system and level progression
- Public leaderboard

## Technical Architecture

### Frontend
- React with Vite
- Tailwind CSS
- ShadCN UI components
- Context API for state management

### Backend
- Node.js with FastAPI
- Authentication via MetaMask
- Firebase Firestore & Storage
- Gemini AI integration

### Blockchain Integration
- ethers.js for Ethereum interaction
- Solidity smart contracts
- Sepolia testnet (initial), Ethereum mainnet (planned)

## Getting Started

### Prerequisites
- Node.js 16+
- MetaMask wallet
- Bun package manager (recommended)

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/insight-quest-rewards.git
cd insight-quest-rewards
```

2. Install dependencies
```bash
bun install
```

3. Run the development server
```bash
bun run dev
```

4. Build for production
```bash
bun run build
```

## Tokenomics

### $TASK Token Overview
- **Token Type**: ERC-20
- **Total Supply**: 1,000,000,000 (1B)
- **Network**: Sepolia Testnet (initial), Ethereum Mainnet (later)
- **Unlock Duration**: 3 years

### Token Allocation

| Category | Percentage | Amount | Unlock Schedule |
|----------|------------|--------|-----------------|
| User Rewards (REWARD POOL) | 45% | 450M | Linear over 3 years |
| Ecosystem Growth | 20% | 200M | Vesting + DAO-controlled |
| Team & Founders (TREASURY) | 15% | 150M | 1-year cliff + 3-year vesting |
| Investors / Strategic | 10% | 100M | Strategic rounds only |
| Community | 5% | 50M | First 6-12 months |
| Treasury & DAO Ops | 5% | 50M | Controlled by DAO |

### Token Utility
1. **AI Feature Access**: Pay for premium AI tools
2. **Marketplace Transactions**: Buy AI agents
3. **Contest Entry**: Join premium challenges
4. **Customization**: Purchase avatars and UI enhancements
5. **Governance**: Voting rights on platform decisions
6. **Developer Rewards**: Earn from creating AI agents
7. **Staking**: Earn multipliers and exclusive access

### Token Sinks (Burns/Locks)
- Percentage of AI agent purchases burned
- Fees for AI validation features
- Staking for rewards multipliers
- DAO proposal fees

## Revenue Model

InsightQuest generates revenue through multiple transparent channels that benefit both the platform and the community:

### 1. AI Agent Marketplace Commission (2.5%)
- Platform takes a 2.5% commission on all AI agent transactions
- Transparent fee structure visible in smart contracts
- Annual Projection (Year 2): 500,000 $TASK (based on 20M $TASK marketplace volume)

### 2. Premium Feature Subscriptions
- Users pay for premium features:
  - AI verification tools: 10-50 $TASK/month
  - Advanced analytics: 30-100 $TASK/month
  - Priority verification: 5-20 $TASK/transaction
  - Custom UI themes: 50-200 $TASK one-time
- Annual Projection: 3M $TASK (5% of 100,000 users at avg 50 $TASK/month)

### 3. Enterprise API Integration Fees
- Implementation fee: 5,000-50,000 $TASK
- Annual license: 10,000-100,000 $TASK
- Per-transaction fee: 0.5-1% of rewards
- Annual Projection: 300,000 $TASK (10 clients at avg 30,000 $TASK each)

### 4. Contest Platform Fees
- Contest creation fee (10% to platform)
- Entry fees (5-10% retained)
- Brand sponsorship fees (5-15%)
- Annual Projection: 250,000 $TASK (500 contests, avg 5,000 $TASK turnover, 10% fee)

### 5. Token Transaction Fees
- 0.5-1% on non-reward token transactions
- Split: 40% burn, 30% treasury, 30% reward pool
- Annual Projection: 250,000 $TASK (50M transaction volume at 0.5%)

### 6. Staking Program Revenue
- 10% of staking rewards to treasury
- Annual Projection: 500,000 $TASK

### Treasury Management
Revenue allocation through the DAO:
- **Development Fund**: 40% - Platform improvements
- **Buyback Fund**: 30% - Token buybacks and burns
- **Reward Pool**: 20% - Additional user rewards
- **Contingency Reserve**: 10% - Emergency fund

### Revenue Growth Projection

| Year | Projected Users | Projected Revenue ($TASK) | Main Revenue Sources |
|------|-----------------|--------------------------|---------------------|
| 1    | 50,000          | 1M                       | Marketplace fees, Premium subscriptions |
| 2    | 200,000         | 5M                       | Marketplace, Enterprise API, Contests |
| 3    | 500,000         | 15M                      | Enterprise solutions, Platform fees, Staking |
| 4    | 1,000,000       | 30M                      | Full ecosystem integration, B2B solutions |
| 5    | 2,000,000       | 60M                      | Platform-as-a-Service, Cross-chain integration |

## Smart Contracts

### $TASK Token Contract
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract TaskToken is ERC20, Ownable, Pausable {
    // Token distribution variables
    uint256 public userRewardPool;
    uint256 public ecosystemGrowthPool;
    uint256 public teamFoundersPool;
    uint256 public investorsPool;
    uint256 public communityPool;
    uint256 public treasuryPool;
    
    // Vesting schedules
    uint256 public vestingStart;
    uint256 public vestingDuration = 1095 days; // 3 years
    
    // Constructor with initial allocations
    constructor() ERC20("Task Token", "TASK") {
        // Set initial allocations
        userRewardPool = 450_000_000 * (10 ** decimals());
        ecosystemGrowthPool = 200_000_000 * (10 ** decimals());
        teamFoundersPool = 150_000_000 * (10 ** decimals());
        investorsPool = 100_000_000 * (10 ** decimals());
        communityPool = 50_000_000 * (10 ** decimals());
        treasuryPool = 50_000_000 * (10 ** decimals());
        
        vestingStart = block.timestamp;
        
        // Initial mint to contract owner (DAO treasury)
        _mint(owner(), totalSupply());
    }
    
    // Key functions
    function distributeRewards(address user, uint256 amount) external onlyOwner whenNotPaused {
        require(amount <= availableRewardTokens(), "Exceeds available reward tokens");
        _transfer(owner(), user, amount);
    }
    
    function availableRewardTokens() public view returns (uint256) {
        // Linear vesting calculation
        uint256 elapsed = block.timestamp - vestingStart;
        if (elapsed >= vestingDuration) {
            return userRewardPool;
        }
        return (userRewardPool * elapsed) / vestingDuration;
    }
    
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }
    
    function _beforeTokenTransfer(address from, address to, uint256 amount) internal override whenNotPaused {
        super._beforeTokenTransfer(from, to, amount);
    }
}
```

### AI Agent Marketplace Contract
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./TaskToken.sol";

contract AgentMarketplace is Ownable, ReentrancyGuard {
    TaskToken public taskToken;
    
    uint256 public platformFeePercent = 25; // 2.5% (25/1000)
    uint256 public burnPercent = 10; // 1% (10/1000)
    uint256 public constant PERCENT_DIVISOR = 1000;
    
    struct Agent {
        address creator;
        uint256 price;
        string metadataURI;
        bool isActive;
    }
    
    mapping(uint256 => Agent) public agents;
    uint256 public nextAgentId = 1;
    
    event AgentCreated(uint256 indexed agentId, address indexed creator, uint256 price);
    event AgentPurchased(uint256 indexed agentId, address indexed buyer, address indexed seller, uint256 amount);
    event TokensBurned(uint256 amount);
    
    constructor(address _taskToken) {
        taskToken = TaskToken(_taskToken);
    }
    
    function createAgent(uint256 price, string memory metadataURI) external returns (uint256) {
        uint256 agentId = nextAgentId++;
        
        agents[agentId] = Agent({
            creator: msg.sender,
            price: price,
            metadataURI: metadataURI,
            isActive: true
        });
        
        emit AgentCreated(agentId, msg.sender, price);
        return agentId;
    }
    
    function purchaseAgent(uint256 agentId) external nonReentrant {
        Agent storage agent = agents[agentId];
        require(agent.isActive, "Agent not active");
        
        uint256 price = agent.price;
        address seller = agent.creator;
        
        // Calculate fees
        uint256 platformFee = (price * platformFeePercent) / PERCENT_DIVISOR;
        uint256 burnAmount = (price * burnPercent) / PERCENT_DIVISOR;
        uint256 sellerAmount = price - platformFee - burnAmount;
        
        // Transfer tokens
        require(taskToken.transferFrom(msg.sender, address(this), price), "Token transfer failed");
        
        // Pay seller
        require(taskToken.transfer(seller, sellerAmount), "Seller payment failed");
        
        // Burn tokens
        taskToken.burn(burnAmount);
        emit TokensBurned(burnAmount);
        
        emit AgentPurchased(agentId, msg.sender, seller, price);
    }
    
    function withdrawPlatformFees() external onlyOwner {
        uint256 balance = taskToken.balanceOf(address(this));
        require(balance > 0, "No fees to withdraw");
        require(taskToken.transfer(owner(), balance), "Fee withdrawal failed");
    }
    
    function setFeePercents(uint256 _platformFeePercent, uint256 _burnPercent) external onlyOwner {
        require(_platformFeePercent + _burnPercent <= PERCENT_DIVISOR, "Total fees too high");
        platformFeePercent = _platformFeePercent;
        burnPercent = _burnPercent;
    }
    
    function deactivateAgent(uint256 agentId) external {
        Agent storage agent = agents[agentId];
        require(msg.sender == agent.creator || msg.sender == owner(), "Not authorized");
        agent.isActive = false;
    }
    
    function reactivateAgent(uint256 agentId) external {
        Agent storage agent = agents[agentId];
        require(msg.sender == agent.creator, "Not authorized");
        agent.isActive = true;
    }
}
```

## Future Roadmap

### Phase 1: Decentralized Storage
- IPFS/Arweave integration for fully decentralized storage
- Smart contract data storage for critical information

### Phase 2: Enhanced Security & Compliance
- FractalID integration with Polygon for KYC verification
- Smart contracts for AI agent ownership and usage rights
- Security measures to prevent agent misuse

### Phase 3: Platform Monitoring & Analytics
- Web3-based analytics for outage and downtime detection
- Real-time platform performance monitoring
- Public dashboard for system metrics

### Phase 4: Cross-Chain Expansion
- Support for Solana, BNB Chain, and Sui
- Multiple token pairs: TASK/SUI, TASK/SOL, TASK/BNB, TASK/USDT
- Gas fee optimization with layer-2 solutions

### Phase 5: Business Model Enhancement
- Enterprise solutions for corporate clients
- API integration services for other platforms
- Developer SDK for the InsightQuest ecosystem

## Contributing

We welcome contributions to InsightQuest! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to get involved.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
