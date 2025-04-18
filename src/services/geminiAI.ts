import { GoogleGenerativeAI } from "@google/generative-ai";

// API key for Gemini (this would be replaced with real API key in production)
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Initialize the API
const genAI = new GoogleGenerativeAI(API_KEY);

// TaskFi DAO information from the PDF
const taskFiInfo = `
Task-FI is a DAO-based app that regulates on $TASK token, providing user incentives based on productivity and an AI agent marketplace.

Key features include:
- Gamified Productivity App: Earn $TASK by completing tasks like solving LeetCode problems, watching educational videos
- Verification Layer: Manual or AI-based verification of task completion
- Tokenized Reward System: $TASK as currency
- AI Features: Chat with Zappy, use AI tools for productivity
- AI Agent Marketplace: Users can buy or deploy task-specific AI agents

USERS CAN EARN BY STAKING
-$TASK is burned every time users pay for:
-AI Agent use
-Verification tools
-Premium challenge entry
-Avatar customizations
- AI Agent Marketplace: Users can buy or sell AI agents

Even if you’re DAO-run, how will you survive financially?”
- We survive because we're not relying on donations, we generate real
yield:
-% from AI Agent purchases
-% of all $TASK burned goes to DAO treasury
-Paid challenges / tournaments
-Subscriptions for premium dashboards (AI insights, team tools)
-Platform takes 2.5% cut on all AI Agent usage

WHY PEOPLE WILL SUPPLY LIQUIDITY AS A DAO?
-They get voting rights, can take major decisions have the power to propose and
benefit,
-Now not just an investor think like a boss that they own it completely
-No fraudalant activity or transactions as every signature is tracked on blockchain
-Think of it like investing early in Duolingo, but instead of ads, it's powered by
tokens. The community governs it, grows it, and benefits directly from that
growth.

HOW WILL TASK-fi GET FUNDS? -
-Staking
-Brand sponsorships by organising contets
-AI agent marketplace (small fees)
-DAO Based platform ( that provides the base liquidity ) the community controls
everything giving complete transperancy

WHY WOULD ANYONE BUY/USE $TASK TOKEN
-To use AI Agents (most powerful tool now)
-To buy AI services faster than doing it manually
-To stake and earn more $TASK from revenue share
-To vote on platform proposals
-To develop AI Agents and earn passive income


Token Details:
- Token Name: $TASK
- Type: ERC-20
- Total Supply: 1,000,000,000 (1B)
- Unlock Duration: 3 years

Token Allocation:
- User Rewards: 45% (450M)
- Ecosystem Growth: 20% (200M)
- Team & Founders: 15% (150M)
- Investors/Strategic: 10% (100M)
- Community: 5% (50M)
- Treasury & DAO Ops: 5% (50M)

Ways to earn $TASK:
1. Complete tasks
2. Sell AI agents
3. Buy from DEX
4. Share activities on social media
5. Win contests
6. Stake $TASK tokens
7. Login regularly

$TASK Token Use Cases:
- Pay for AI features
- Buy AI agents from marketplace
- Enter challenges
- Customization
- Governance voting
- Use AI Agent Dev API

Revenue Streams:
- AI Agent Sales
- AI Feature Usage
- Premium Task Access
- Enterprise Tier
- App Pro Subscription
- API usage by organizations

DAO Member Benefits:
- Governance Power
- Reward Distribution
- Access to Treasury Grants
- Early Access to Features
- Token Appreciation
- AI Agent Revenue Share

Users can stake $TASK to earn 8-10% APR. The platform takes 2.5-5% cut on AI Agent usage.
`;

// Generate a response using Gemini
export const generateAIResponse = async (prompt: string): Promise<string> => {
  try {
    // For simplicity, we'll use the gemini-flash model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Enhance the prompt with TaskFi information
    const enhancedPrompt = `
      ${taskFiInfo}

      Context: You are Zappy, an AI assistant for InsightQuest, a Web3 platform that helps users 
      learn about blockchain, cryptocurrency, and earn rewards through completing tasks.
      
      Your primary functions:
      1. Educate users about Web3, blockchain technologies, and cryptocurrencies
      2. Help users understand how to complete tasks on the platform
      3. Guide users in earning rewards through the completion of learning activities
      4. Provide personalized learning recommendations based on user interests
      5. Explain technical concepts in simple, approachable language
      6. Explain what is InsightQuest/TaskFi and how users and companies can use our API to use transparent reward system
      7. Tell how InsightQuest has AI agent marketplace where users can buy and sell AI agents on our custom ERC20 network token called TASK token
      
      User's message: ${prompt}
      
      IMPORTANT GUIDELINES:
      - Respond in a helpful, friendly, and informative manner
      - Respond in a cute way like wall-e or a friendly robot that is cute
      - Keep responses concise (under 150 words) and relevant
      - Break down complex concepts into simple explanations
      - Encourage users to complete tasks to earn rewards
      - If you don't know something, be honest and suggest they check the documentation
      - Use emoji occasionally to make conversations engaging 🎯
    `;
    
    const result = await model.generateContent(enhancedPrompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating AI response:", error);
    
    // Fallback to pre-defined responses if Gemini API fails
    return "I'm having trouble connecting to my AI services right now. Let me respond based on what I already know about TaskFi and InsightQuest!";
  }
};

export default { generateAIResponse };
