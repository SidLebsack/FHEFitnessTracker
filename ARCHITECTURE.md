# Conviction Markets Advanced - Architecture Documentation

## Overview

Conviction Markets Advanced is a next-generation privacy-preserving prediction market platform built on Zama's Fully Homomorphic Encryption (FHE) technology. It extends the original Conviction Markets with enterprise-grade features including refund mechanisms, timeout protection, price obfuscation, and optimized homomorphic computation.

## 🏗️ Core Architecture

### System Layers

```
┌─────────────────────────────────────────────────────┐
│         User Interface Layer                        │
│  (React Frontend + Web3 Wallet Integration)        │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│      Smart Contract Layer                           │
│  (Solidity ^0.8.24 + FHE Operations)               │
│  - ConvictionMarketsAdvanced.sol (Primary)         │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│      FHE Encryption Layer                           │
│  (Zama fhEVM - Homomorphic Computation)            │
│  - Encrypted Vote Tallies (euint64)                │
│  - Conditional Operations (FHE.select, FHE.eq)    │
│  - Privacy-Preserving Comparisons                  │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│      Gateway Layer                                  │
│  (Decryption Oracle + Callback Mechanism)          │
│  - Asynchronous Decryption Requests                │
│  - Signature Verification                          │
│  - Callback-Based Result Delivery                  │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│      Blockchain Layer                               │
│  (Ethereum Sepolia Testnet)                        │
│  - Decentralized Storage                           │
│  - Immutable Audit Trail                           │
│  - Transaction Finality                            │
└─────────────────────────────────────────────────────┘
```

## 📋 Key Components

### 1. Smart Contract Structure

#### ConvictionMarketsAdvanced.sol

**Primary Responsibilities:**
- Market creation and management
- Encrypted vote casting with FHE
- Decryption request orchestration
- Prize distribution and refund processing
- Timeout protection and audit logging

**Key State Structures:**

```solidity
struct BetInfo {
    address creator;
    uint256 platformStake;           // Platform fee (0.02 ETH)
    uint256 voteStake;               // Min stake per vote (0.005 ETH)
    uint256 createdTime;
    uint256 expiryTime;              // Market closure time
    bool isResolved;
    euint64 yesVotes;                // Encrypted YES tally
    euint64 noVotes;                 // Encrypted NO tally
    uint64 revealedYes;              // Decrypted YES count
    uint64 revealedNo;               // Decrypted NO count
    uint256 prizePool;
    bool yesWon;
    uint256 decryptionRequestId;
    DecryptionStatus decryptionStatus;
    uint256 refundDeadline;          // Last refund claim time
    uint256 priceObfuscationFactor;  // Division privacy protection
    bool isRefundTriggered;          // Timeout-based trigger
}
```

### 2. Workflow Architecture

#### Market Lifecycle

```
Phase 1: Market Creation
├─ Creator pays platform fee (0.02 ETH)
├─ Define vote stake minimum (≥0.005 ETH)
├─ Set market duration (5 min - 30 days)
└─ Calculate refund deadline (expiry + 2 days)

Phase 2: Voting Period
├─ Users submit encrypted votes via Gateway
├─ Vote type (0=No, 1=Yes) encrypted
├─ Weights aggregated homomorphically
├─ FHE operations: FHE.add, FHE.select, FHE.eq
└─ No information leakage during voting

Phase 3: Market Expiry & Decryption Request
├─ Creator can request tally decryption
├─ Gateway receives decryption request
├─ Off-chain decryption computation
├─ Signature verification (FHE.checkSignatures)
└─ Callback-based result delivery

Phase 4: Prize Distribution
├─ Winners claim proportional prize
├─ Ties trigger automatic refunds
├─ Timeout protection refunds if no resolution
├─ Decryption failure triggers refunds
└─ All claims verified and audit-logged

Phase 5: Refund Window
├─ 48-hour window after market expiry
├─ Refund eligible if:
│  ├─ Market resulted in tie
│  ├─ Decryption timeout triggered
│  └─ Decryption failed (marked by owner)
└─ Automatic timeout protection kicks in
```

#### Gateway Callback Pattern

```
┌─────────────────────────────────┐
│  1. requestTallyReveal()        │
│     - Creator initiates reveal  │
│     - FHE.requestDecryption()   │
│     - requestId created         │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  2. Off-Chain Gateway Service   │
│     - Decrypt vote tallies      │
│     - Generate signatures       │
│     - Prepare callback data     │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  3. resolveTallyCallback()      │
│     - Gateway-initiated call    │
│     - Verify signatures         │
│     - Update market state       │
│     - Emit resolution event     │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  4. claimPrize/claimRefund()   │
│     - Users claim their share   │
│     - Prize calculation with    │
│       obfuscation factor        │
└─────────────────────────────────┘
```

## 🔐 Privacy Architecture

### Encryption Model

#### Vote Privacy

```
User Input (plaintext)
    │
    ├─ Vote Type: 0 (No) or 1 (Yes) [plaintext]
    └─ Vote Weight: Amount (encrypted)
       │
       ▼
FHE Encryption
    │
    ├─ externalEuint64 (external encryption)
    └─ FHE.fromExternal() with proof
       │
       ▼
Homomorphic Operations
    │
    ├─ FHE.eq() - Encrypted equality check
    ├─ FHE.select() - Conditional selection
    ├─ FHE.add() - Encrypted summation
    └─ Comparison without decryption
       │
       ▼
Tallies (Encrypted)
    │
    ├─ euint64 yesVotes (encrypted)
    └─ euint64 noVotes (encrypted)
       │
       ▼
Decryption (Only at End)
    │
    └─ Gateway service decrypts
       └─ Signature verification
          └─ Results revealed only to winner logic
```

#### Privacy Guarantees

| Aspect | Protection | Mechanism |
|--------|-----------|-----------|
| **Vote Type** | Visible | Only revealed after market expiry for prize logic |
| **Vote Weight** | Encrypted | FHE homomorphic encryption |
| **Individual Tallies** | Hidden During Voting | Aggregated without individual visibility |
| **Aggregate Results** | Encrypted Until Reveal | Requires decryption and signature proof |
| **Price/Probability** | Obfuscated | Random obfuscation factor added |
| **Division Operations** | Privacy-Preserved | Obfuscation prevents exact ratio inference |

### Threat Model

**Addressed Threats:**

1. **Plaintext Vote Leakage**
   - ❌ Prevented by FHE encryption
   - Votes encrypted before blockchain submission
   - No vote contents visible on-chain

2. **Price Inference Attack**
   - ❌ Prevented by price obfuscation
   - Random factor added to numerator/denominator
   - Prevents probability estimation from on-chain data

3. **Division Information Leak**
   - ❌ Prevented by obfuscation randomization
   - Prize calculation uses obfuscated amounts
   - Actual ratios cannot be computed from public data

4. **Oracle Front-Running**
   - ❌ Prevented by signature verification
   - FHE.checkSignatures ensures authenticity
   - Gateway cannot forge decryption results

5. **Market Permanent Lockup**
   - ❌ Prevented by timeout protection
   - 2-day refund window after market expiry
   - Automatic refund if no decryption received

## 🛡️ Security Architecture

### Input Validation Layer

```solidity
// BetId Validation
modifier validBetId(string memory betId) {
    require(bytes(betId).length > 0 && bytes(betId).length <= 64);
}

// Amount Overflow Protection
modifier validAmount(uint256 amount) {
    require(amount > 0);
    require(amount <= type(uint128).max);
}

// Vote Type Validation
require(voteType == 0 || voteType == 1, "ERR_INVALID_VOTE_TYPE");

// Vote Proof Validation
euint64 weight = FHE.fromExternal(encryptedWeight, inputProof);
```

### Access Control

```
Function Categorization:

├─ Owner Functions
│  ├─ setPlatformStake()
│  ├─ setGatewayAddress()
│  ├─ withdrawPlatformFees()
│  └─ markDecryptionFailed()
│
├─ Gateway Functions
│  └─ resolveTallyCallback() [onlyGateway]
│
├─ Creator Functions
│  └─ requestTallyReveal() [only bet creator]
│
├─ Voter Functions
│  └─ vote() [only if hasVoted check passed]
│
└─ Public Functions
   ├─ createBet() [anyone, but require stake]
   ├─ claimPrize() [only winners]
   ├─ claimRefund() [eligible parties]
   └─ View functions [unrestricted]
```

### Audit Trail

Every significant action is logged with:
- Action type (CREATE_BET, VOTE_CAST, CLAIM_PRIZE, etc.)
- Actor address
- Bet identifier
- Timestamp

```solidity
event AuditLog(
    string indexed action,
    address indexed actor,
    string betId,
    uint256 timestamp
);
```

## ⚡ Gas Optimization Architecture

### HCU (Homomorphic Computation Units) Optimization

**Estimated Gas Costs:**

| Operation | Type | Gas Cost | Optimization |
|-----------|------|----------|--------------|
| FHE.asEuint64() | Encryption | ~5,000 | Inline where possible |
| FHE.fromExternal() | Import | ~3,000 | Batched in votes |
| FHE.add() | Addition | ~2,500 | Commutative, reorder optimally |
| FHE.eq() | Comparison | ~3,500 | Short-circuit early |
| FHE.select() | Conditional | ~2,000 | Use instead of if/else |
| FHE.checkSignatures() | Verification | ~4,000 | Called once per callback |
| **Market Creation** | - | ~120,000 | HCU-optimized |
| **Vote Casting** | - | ~80,000 | Batched HCU ops |
| **Callback** | - | ~60,000 | Signature + storage |

### Optimization Strategies

1. **Operation Reordering**
   ```solidity
   // Good: Commutative operations grouped
   bet.yesVotes = FHE.add(bet.yesVotes, FHE.select(isYes, weight, zero));
   ```

2. **Conditional Selection Over If-Statements**
   ```solidity
   // Cheaper than if/else
   FHE.select(condition, trueValue, falseValue)
   ```

3. **Signature Verification Batching**
   - Single FHE.checkSignatures() call per callback
   - Handles multiple encrypted values

4. **Storage Access Minimization**
   - Cache bet info in memory
   - Update once at end of transaction

## 📊 Data Flow Architecture

### Vote Submission Flow

```
┌─────────────────┐
│  User Interface │
│  (React + Web3) │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Client-Side FHE Encryption        │
│  - Encrypt vote weight              │
│  - Generate ZK proof                │
│  - Prepare transaction              │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  vote() Function                    │
│  ├─ Input validation                │
│  ├─ FHE.fromExternal() + proof      │
│  ├─ Encrypted weight import         │
│  └─ Homomorphic aggregation         │
│     ├─ FHE.eq() for vote type      │
│     ├─ FHE.select() for choice     │
│     └─ FHE.add() for tally         │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Blockchain Storage                 │
│  - BetInfo updated                  │
│  - Encrypted votes stored           │
│  - Events emitted                   │
└─────────────────────────────────────┘
```

### Prize Calculation Flow with Obfuscation

```
┌──────────────────────────────────────┐
│  User Claims Prize                   │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│  Verify Winner Status                │
│  - Check if market resolved          │
│  - Verify vote for winning side      │
│  - Not already claimed               │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│  Calculate Prize with Obfuscation    │
│                                      │
│  priceObf = random() % 1000 + 1      │
│                                      │
│  numerator = (prizePool × stake)     │
│            + priceObfuscation        │
│                                      │
│  denominator = totalWinningVotes     │
│              + (priceObs / 1000)     │
│                                      │
│  prize = numerator / denominator     │
└────────────┬─────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│  Transfer Prize + Audit Log          │
│  - Safe transfer pattern             │
│  - Event emission                    │
│  - Reentrancy protection             │
└──────────────────────────────────────┘
```

## 🔄 Refund & Timeout Architecture

### Refund Trigger Conditions

```
Refund Eligible When:

1. NORMAL_REFUND
   └─ Condition: revealedYes == revealedNo
   └─ Trigger: Any voter after market resolved
   └─ Amount: Original vote stake

2. TIE_REFUND
   └─ Same as NORMAL_REFUND
   └─ Explicit tie result

3. TIMEOUT_PROTECTION
   └─ Condition: block.timestamp > refundDeadline
   └─ Deadline: expiryTime + 2 days (REFUND_TIMEOUT_BUFFER)
   └─ Trigger: Automatic, no decryption received
   └─ Amount: Full vote stake

4. DECRYPTION_FAILED
   └─ Condition: decryptionStatus == FAILED
   └─ Set By: Owner calling markDecryptionFailed()
   └─ Trigger: Explicit failure marking
   └─ Amount: Full vote stake
```

### Timeout Timeline

```
Market Expiry (expiryTime)
│
├─ T+0s: requestTallyReveal() callable
├─ T+1800s: Decryption processing window
│
T+3600s (1 hour): Callback deadline (should arrive)
│
T+86400s (24 hours): Extended processing window
│
T+172800s (48 hours): refundDeadline reached
│  └─ Automatic refund window opens
│  └─ Users can claim refund without waiting
│
T+259200s (72 hours): Refund window closes
   └─ Users must have claimed
   └─ Unclaimed stakes remain locked
```

## 🔗 Integration Points

### Gateway Integration

**Requirements for Gateway Operator:**

1. **Decryption Service**
   - Decrypt euint64 vote tallies
   - Generate valid signatures matching request

2. **Callback Invocation**
   - Call resolveTallyCallback() with:
     - requestId (from original request)
     - cleartexts (ABI-encoded uint64 values)
     - decryptionProof (signature verification data)
   - Ensure msg.sender is configured gateway address

3. **Timing Requirements**
   - Process requests within 24 hours ideally
   - Handle requests > 24 hours (refund protection activates)
   - Support retry mechanism for failed callbacks

### Frontend Integration

**Key Functions to Call:**

```javascript
// 1. Create market
createBet(betId, voteStake, duration)

// 2. Submit encrypted vote
vote(betId, encryptedWeight, voteType, proof)

// 3. Request decryption (after expiry)
requestTallyReveal(betId)

// 4. Check resolution status
getDecryptionStatus(betId)

// 5. Claim prize or refund
claimPrize(betId)     // For winners
claimRefund(betId)    // For refund-eligible
```

## 📈 Scalability Considerations

### Current Limitations

- **Single bet per transaction**: Vote casting not batched
- **String-based bet IDs**: Could use uint256 for optimization
- **Market count**: No pagination in view functions
- **Vote history**: Not queried efficiently

### Future Optimizations

1. **Batch vote casting**
   - Submit multiple votes in single transaction
   - Reduce gas per vote by ~30%

2. **Indexed bet IDs**
   - Use uint256 instead of strings
   - Enable efficient market enumeration

3. **Vote compression**
   - Pack vote data more efficiently
   - Reduce storage costs

4. **Multi-signature resolutions**
   - Use multiple gateways for decryption
   - Improve availability and trust

## 🧪 Testing Architecture

### Test Categories

1. **Unit Tests**
   - Individual function behavior
   - Edge cases and bounds
   - Error conditions

2. **Integration Tests**
   - Multi-function workflows
   - State consistency
   - Event emissions

3. **Security Tests**
   - Input validation
   - Access control
   - Reentrancy protection

4. **FHE Tests**
   - Encryption/decryption accuracy
   - Homomorphic operation correctness
   - Signature verification

## 📝 Key Design Decisions

### 1. Gateway Callback Pattern vs. Oracle Queries
**Choice:** Gateway Callback Pattern
**Rationale:**
- Asynchronous processing prevents long wait times
- Callback allows batching multiple decryptions
- Signature verification ensures authenticity
- Timeout protection handles failed callbacks

### 2. Price Obfuscation vs. Commitment Schemes
**Choice:** Randomized Obfuscation
**Rationale:**
- Simpler implementation
- Lower gas costs
- Sufficient privacy for application
- No overhead from commitment verification

### 3. 2-Day Refund Window vs. Fixed Deadlines
**Choice:** 2-Day Buffer Window
**Rationale:**
- Reasonable time for gateway processing
- Balances user protection with market closure
- Buffer allows for network delays
- Market not permanently locked

### 4. User-Initiated Refund vs. Automatic Distribution
**Choice:** User-Initiated with Timeout Fallback
**Rationale:**
- Users control their funds
- Automatic refund avoids permanent lockup
- Reduces trust requirements
- Allows users to decide claim timing

## 📚 References

- [Zama FHE Documentation](https://docs.zama.ai/fhevm)
- [Solidity Best Practices](https://docs.soliditylang.org/)
- [EIP-712 Signature Standard](https://eips.ethereum.org/EIPS/eip-712)
- [SafeMath Library Patterns](https://docs.openzeppelin.com/contracts/)

---

**Architecture Version:** 1.0
**Last Updated:** 2024
**Smart Contract Version:** ^0.8.24
