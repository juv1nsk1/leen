# LEEN Protocol – Lend with Any Token

This project was developed as part of the **FinTech & Blockchain 564** course at **Duke University**, under the guidance of Professor **John Church**.

LEEN (Lend with Any Token) is a decentralized lending protocol that allows any ERC-20 token to become collateral for borrowing stablecoins. The protocol empowers token issuers to create their own isolated lending pools, enabling utility and demand without relying on speculative staking or inflationary rewards.

## 📁 Project Structure

The root of the repository includes a `contracts/` directory with the following components:

▸ `LeenFactory.sol` 
Responsible for creating and managing individual lending pools.  
Each token can have a unique pool, created and configured through this factory.  
It handles the mapping between tokens and pools and maintains the list of deployed pool addresses.

▸ `LeenPool.sol`
The core lending contract for each token.  
Each pool accepts a specific ERC-20 token as collateral and allows users to borrow stablecoins like USDT.  
Key features:
- Overcollateralized borrowing
- Custom collateral ratio, interest rate, and liquidation threshold
- Protocol fee on loan origination
- Liquidation via bot-executed triggers
- Auto-reinvestment option for pool interest

    ### Tests

    juvinski@mutr3t4 contracts % npx hardhat test

    LeenPool Tests

    ✔ should allow deposit and track balance

    ✔ should allow borrowing within collateral ratio

    ✔ should prevent over-borrowing

    ✔ should apply 1% fee on borrow

    ✔ should allow repay and reduce debt


### ▸ `dapp/`  
  React + Next.js 13 frontend application that connects to the smart contracts.  
  Allows users to create and fund pools, approve tokens, and borrow stablecoins.

### ▸ `Whitepaper.pdf`  
  Detailed explanation of the protocol design, motivation, technical architecture, and roadmap.

### ▸ `PitchDeck.pdf`  
  Visual presentation summarizing the problem, solution, market positioning, and protocol functionality.


##  Deployed Contracts

The protocol is live and verified on the **Sepolia testnet**:

- 🏗️ **Factory :**  
  [`0xaCE3302564cbA291Dc72BD5D55B5434Cb801d845`](https://sepolia.etherscan.io/address/0xaCE3302564cbA291Dc72BD5D55B5434Cb801d845#code)

- 🧱 **Pool Example:**  
  [`0xE5d6370Dd99cCfa415d5c480970886799D3DB510`](https://sepolia.etherscan.io/address/0xE5d6370Dd99cCfa415d5c480970886799D3DB510#code)

##  Web Interface

You can explore and interact with the protocol through the LEEN dApp:

 [http://vcm-47408.vm.duke.edu/leen](http://vcm-47408.vm.duke.edu/leen)

##  Purpose

The goal of this project is to explore how long-tail tokens can access DeFi infrastructure without relying on centralized listing decisions or unsustainable incentives. LEEN demonstrates how any project can activate real financial utility using open infrastructure and programmable credit markets.

---

Feel free to fork, deploy your own pool, or contribute to improve it!