# Conviction Markets Advanced - API Reference

## Overview

This document provides a comprehensive reference for all public functions, events, and data structures in the ConvictionMarketsAdvanced smart contract.

## Table of Contents

1. [Constants](#constants)
2. [State Variables](#state-variables)
3. [Data Structures](#data-structures)
4. [Events](#events)
5. [Modifiers](#modifiers)
6. [Functions](#functions)
   - [Owner Functions](#owner-functions)
   - [Betting Functions](#betting-functions)
   - [Resolution Functions](#resolution-functions)
   - [Claim Functions](#claim-functions)
   - [View Functions](#view-functions)
   - [Testing Functions](#testing-functions)

---

## Constants

```solidity
uint256 public platformStake = 0.02 ether;      // Platform fee for creating markets
uint256 public constant MIN_VOTE_STAKE = 0.005 ether;  // Minimum stake per vote
uint256 public constant MIN_DURATION = 5 minutes;      // Minimum market duration
uint256 public constant MAX_DURATION = 30 days;        // Maximum market duration
uint256 public constant REFUND_TIMEOUT_BUFFER = 2 days;  // Timeout before refund activation
uint256 public constant MAX_PRICE_OBFUSCATION = 1000;    // Max obfuscation factor
uint256 public constant HCU_GAS_COST = 50000;            // Estimated homomorphic operation gas
```

---

## State Variables

| Variable | Type | Description |
|----------|------|-------------|
| `owner` | `address` | Contract owner address |
| `gatewayAddress` | `address` | Authorized gateway for decryption callbacks |
| `platformFees` | `uint256` | Accumulated platform fees available for withdrawal |
| `isTesting` | `bool` | Testing mode flag |
| `isPaused` | `bool` | Emergency pause flag |

---

## Data Structures

### DecryptionStatus

```solidity
enum DecryptionStatus {
    PENDING,    // Waiting for decryption request or callback
    COMPLETED,  // Decryption successful
    FAILED      // Decryption failed, refund available
}
```

### BetInfo

```solidity
struct BetInfo {
    address creator;              // Market creator address
    uint256 platformStake;        // Platform fee paid
    uint256 voteStake;            // Required stake per vote
    uint256 createdTime;          // Market creation timestamp
    uint256 expiryTime;           // Market expiry timestamp
    bool isResolved;              // Market resolution status
    euint64 yesVotes;             // Encrypted YES vote tally
    euint64 noVotes;              // Encrypted NO vote tally
    uint64 revealedYes;           // Decrypted YES vote count
    uint64 revealedNo;            // Decrypted NO vote count
    uint256 prizePool;            // Total prize pool
    bool yesWon;                  // Winner status after resolution
    uint256 decryptionRequestId;  // Gateway request ID
    DecryptionStatus decryptionStatus;  // Current decryption state
    uint256 refundDeadline;       // Timestamp after which refunds are available
    uint256 priceObfuscationFactor;  // Randomized obfuscation value
    bool isRefundTriggered;       // Timeout protection flag
}
```

### UserVoteInfo

```solidity
struct UserVoteInfo {
    uint8 voteType;        // 0 = No, 1 = Yes
    uint256 stakeAmount;   // Amount staked
    uint256 voteTimestamp; // When vote was cast
    bool hasRefunded;      // Claim/refund status
}
```

### GatewayCallbackData

```solidity
struct GatewayCallbackData {
    uint256 requestId;        // Decryption request ID
    string betId;             // Associated bet identifier
    uint256 callbackTimestamp;// When callback was received
    bool processed;           // Processing status
}
```

---

## Events

### BetCreated

```solidity
event BetCreated(
    string indexed betId,
    address indexed creator,
    uint256 platformStake,
    uint256 voteStake,
    uint256 expiryTime,
    uint256 refundDeadline
);
```

Emitted when a new market is created.

**Parameters:**
- `betId`: Unique market identifier
- `creator`: Address of market creator
- `platformStake`: Platform fee paid
- `voteStake`: Required vote stake
- `expiryTime`: Market expiry timestamp
- `refundDeadline`: Refund window deadline

---

### VoteCast

```solidity
event VoteCast(
    string indexed betId,
    address indexed voter,
    uint8 voteType,
    uint256 stakeAmount
);
```

Emitted when a vote is submitted.

**Parameters:**
- `betId`: Market identifier
- `voter`: Voter address
- `voteType`: 0 (No) or 1 (Yes)
- `stakeAmount`: Amount staked

---

### BetResolved

```solidity
event BetResolved(
    string indexed betId,
    bool yesWon,
    uint64 revealedYes,
    uint64 revealedNo,
    uint256 totalPrize
);
```

Emitted when decryption callback resolves the market.

**Parameters:**
- `betId`: Market identifier
- `yesWon`: True if YES votes > NO votes
- `revealedYes`: Decrypted YES count
- `revealedNo`: Decrypted NO count
- `totalPrize`: Total prize pool

---

### PrizeDistributed

```solidity
event PrizeDistributed(
    string indexed betId,
    address indexed winner,
    uint256 amount
);
```

Emitted when a winner claims their prize.

---

### RefundProcessed

```solidity
event RefundProcessed(
    string indexed betId,
    address indexed recipient,
    uint256 amount,
    string reason
);
```

Emitted when a refund is processed.

**Reason Values:**
- `"TIE_REFUND"`: Market ended in tie
- `"TIMEOUT_PROTECTION"`: Decryption timed out
- `"DECRYPTION_FAILED"`: Decryption marked as failed

---

### DecryptionStatusChanged

```solidity
event DecryptionStatusChanged(
    string indexed betId,
    DecryptionStatus status,
    uint256 timestamp
);
```

Emitted when decryption status changes.

---

### TimeoutProtectionTriggered

```solidity
event TimeoutProtectionTriggered(
    string indexed betId,
    uint256 triggerTime
);
```

Emitted when timeout protection activates.

---

### GatewayCallbackReceived

```solidity
event GatewayCallbackReceived(
    uint256 indexed requestId,
    string indexed betId,
    uint256 timestamp
);
```

Emitted when gateway delivers decryption callback.

---

### AuditLog

```solidity
event AuditLog(
    string indexed action,
    address indexed actor,
    string betId,
    uint256 timestamp
);
```

Emitted for audit trail purposes.

**Action Values:**
- `"CREATE_BET"`
- `"VOTE_CAST"`
- `"REQUEST_REVEAL"`
- `"RESOLVE_TALLY"`
- `"CLAIM_PRIZE"`
- `"CLAIM_REFUND"`
- `"SET_GATEWAY"`
- `"SET_PLATFORM_STAKE"`
- `"PAUSE"` / `"UNPAUSE"`
- `"EMERGENCY_WITHDRAW"`

---

### PlatformFeesWithdrawn

```solidity
event PlatformFeesWithdrawn(address indexed to, uint256 amount);
```

Emitted when platform fees are withdrawn.

---

## Modifiers

### onlyOwner

```solidity
modifier onlyOwner();
```

Restricts function to contract owner.

**Reverts with:** `"ERR_NOT_OWNER"`

---

### onlyGateway

```solidity
modifier onlyGateway();
```

Restricts function to authorized gateway.

**Reverts with:** `"ERR_NOT_GATEWAY"`

---

### notPaused

```solidity
modifier notPaused();
```

Blocks execution when contract is paused.

**Reverts with:** `"ERR_CONTRACT_PAUSED"`

---

### validBetId

```solidity
modifier validBetId(string memory betId);
```

Validates bet ID format (1-64 characters).

**Reverts with:** `"ERR_INVALID_BET_ID"`

---

### validAmount

```solidity
modifier validAmount(uint256 amount);
```

Validates amount is positive and below overflow threshold.

**Reverts with:** `"ERR_INVALID_AMOUNT"` or `"ERR_AMOUNT_OVERFLOW"`

---

## Functions

---

## Owner Functions

### setGatewayAddress

```solidity
function setGatewayAddress(address _newGateway) external onlyOwner
```

Update the authorized gateway address.

**Parameters:**
- `_newGateway`: New gateway address (non-zero)

**Emits:** `AuditLog("SET_GATEWAY", ...)`

**Reverts with:** `"ERR_INVALID_GATEWAY"`

---

### setPlatformStake

```solidity
function setPlatformStake(uint256 newStake) external onlyOwner validAmount(newStake)
```

Update platform fee for market creation.

**Parameters:**
- `newStake`: New platform stake amount

**Emits:** `AuditLog("SET_PLATFORM_STAKE", ...)`

---

### setPaused

```solidity
function setPaused(bool paused) external onlyOwner
```

Emergency pause/unpause contract.

**Parameters:**
- `paused`: True to pause, false to unpause

**Emits:** `AuditLog("PAUSE"/"UNPAUSE", ...)`

---

### setTesting

```solidity
function setTesting(bool enabled) external onlyOwner
```

Enable/disable testing mode.

**Parameters:**
- `enabled`: True to enable testing functions

**Emits:** `AuditLog("ENABLE_TESTING"/"DISABLE_TESTING", ...)`

---

### withdrawPlatformFees

```solidity
function withdrawPlatformFees(address payable to) external onlyOwner
```

Withdraw accumulated platform fees.

**Parameters:**
- `to`: Recipient address

**Emits:** `PlatformFeesWithdrawn`, `AuditLog("WITHDRAW_FEES", ...)`

**Reverts with:** `"ERR_INVALID_ADDRESS"`, `"ERR_NO_FEES"`, `"ERR_TRANSFER_FAILED"`

---

### markDecryptionFailed

```solidity
function markDecryptionFailed(string memory betId) external onlyOwner validBetId(betId)
```

Mark a market's decryption as failed, enabling refunds.

**Parameters:**
- `betId`: Market identifier

**Emits:** `DecryptionStatusChanged(FAILED)`, `AuditLog`

**Reverts with:** `"ERR_BET_NOT_FOUND"`, `"ERR_INVALID_STATUS"`

---

### emergencyWithdraw

```solidity
function emergencyWithdraw() external onlyOwner
```

Emergency withdrawal of all contract funds.

**Emits:** `AuditLog("EMERGENCY_WITHDRAW", ...)`

**Reverts with:** `"ERR_TRANSFER_FAILED"`

---

## Betting Functions

### createBet

```solidity
function createBet(
    string memory betId,
    uint256 voteStake,
    uint256 duration
) external payable notPaused validBetId(betId) validAmount(voteStake)
```

Create a new prediction market.

**Parameters:**
- `betId`: Unique market identifier (1-64 characters)
- `voteStake`: Required stake per vote (>= 0.005 ETH)
- `duration`: Market duration in seconds (5 min - 30 days)

**Required Value:** `msg.value == platformStake` (0.02 ETH default)

**Returns:** None (state change)

**Emits:** `BetCreated`, `AuditLog("CREATE_BET", ...)`

**Reverts with:**
- `"ERR_INCORRECT_STAKE"`: Wrong platform fee
- `"ERR_STAKE_TOO_LOW"`: Vote stake below minimum
- `"ERR_INVALID_DURATION"`: Duration out of range
- `"ERR_BET_EXISTS"`: Duplicate bet ID

**Example:**

```javascript
// Create market with 0.01 ETH vote stake, 1 hour duration
const tx = await contract.createBet(
    "prediction-2024-01",  // betId
    ethers.parseEther("0.01"),  // voteStake
    3600,  // duration (1 hour)
    { value: ethers.parseEther("0.02") }  // platform fee
);
```

---

### vote

```solidity
function vote(
    string memory betId,
    externalEuint64 encryptedWeight,
    uint8 voteType,
    bytes calldata inputProof
) external payable notPaused validBetId(betId)
```

Submit an encrypted vote on a market.

**Parameters:**
- `betId`: Market identifier
- `encryptedWeight`: FHE-encrypted vote weight
- `voteType`: 0 for No, 1 for Yes
- `inputProof`: Zero-knowledge proof of valid input

**Required Value:** `msg.value == bet.voteStake`

**Emits:** `VoteCast`, `AuditLog("VOTE_CAST", ...)`

**Reverts with:**
- `"ERR_BET_NOT_FOUND"`: Market doesn't exist
- `"ERR_BET_RESOLVED"`: Market already resolved
- `"ERR_BET_EXPIRED"`: Market has expired
- `"ERR_INCORRECT_STAKE"`: Wrong vote stake
- `"ERR_ALREADY_VOTED"`: Already voted
- `"ERR_INVALID_VOTE_TYPE"`: Vote type not 0 or 1

**Example:**

```javascript
// Prepare encrypted vote
const weight = await fheClient.encrypt64(1);  // Weight of 1
const proof = await fheClient.generateProof(weight);

// Submit vote
const tx = await contract.vote(
    "prediction-2024-01",  // betId
    weight.encrypted,       // encryptedWeight
    1,                      // voteType (Yes)
    proof,                  // inputProof
    { value: ethers.parseEther("0.01") }  // vote stake
);
```

---

## Resolution Functions

### requestTallyReveal

```solidity
function requestTallyReveal(string memory betId) external validBetId(betId)
```

Request decryption of vote tallies (creator only).

**Parameters:**
- `betId`: Market identifier

**Requirements:**
- Market must exist
- Market must be expired
- Market must not be resolved
- Caller must be market creator

**Emits:** `AuditLog("REQUEST_REVEAL", ...)`

**Reverts with:**
- `"ERR_BET_NOT_FOUND"`
- `"ERR_BET_NOT_EXPIRED"`
- `"ERR_ALREADY_RESOLVED"`
- `"ERR_NOT_CREATOR"`

---

### resolveTallyCallback

```solidity
function resolveTallyCallback(
    uint256 requestId,
    bytes memory cleartexts,
    bytes memory decryptionProof
) external onlyGateway
```

Gateway callback to finalize market resolution.

**Parameters:**
- `requestId`: Original decryption request ID
- `cleartexts`: ABI-encoded (uint64, uint64) of revealed votes
- `decryptionProof`: Signature verification proof

**Access:** Gateway only

**Emits:** `BetResolved`, `GatewayCallbackReceived`, `AuditLog`

**Note:** This function is called by the gateway service, not users.

---

## Claim Functions

### claimPrize

```solidity
function claimPrize(string memory betId) external notPaused validBetId(betId)
```

Claim prize as a winning voter.

**Parameters:**
- `betId`: Market identifier

**Requirements:**
- Market must be resolved
- Caller must not have claimed
- Caller must have voted
- Market must not be a tie
- Caller must be on winning side

**Prize Calculation:**
```
obfuscatedNumerator = (prizePool * voteStake) + obfuscationFactor
prize = obfuscatedNumerator / (totalWinningWeight + obfuscationFactor/1000)
```

**Emits:** `PrizeDistributed`, `AuditLog("CLAIM_PRIZE", ...)`

**Reverts with:**
- `"ERR_BET_NOT_RESOLVED"`
- `"ERR_ALREADY_CLAIMED"`
- `"ERR_NOT_VOTED"`
- `"ERR_TIE_USE_REFUND"`
- `"ERR_NOT_WINNER"`
- `"ERR_NO_WINNERS"`
- `"ERR_TRANSFER_FAILED"`

---

### claimRefund

```solidity
function claimRefund(string memory betId) external notPaused validBetId(betId)
```

Claim refund under eligible conditions.

**Parameters:**
- `betId`: Market identifier

**Eligible Conditions:**
1. Market ended in tie
2. Timeout protection triggered (>48 hours past expiry, no resolution)
3. Decryption marked as failed

**Refund Amount:** Original vote stake

**Emits:** `RefundProcessed`, `TimeoutProtectionTriggered` (if applicable), `AuditLog`

**Reverts with:**
- `"ERR_NOT_VOTED"`
- `"ERR_ALREADY_REFUNDED"`
- `"ERR_INELIGIBLE_REFUND"`
- `"ERR_TRANSFER_FAILED"`

---

## View Functions

### getBet

```solidity
function getBet(string memory betId) external view returns (
    address creator,
    uint256 platformStake,
    uint256 voteStake,
    uint256 createdTime,
    uint256 expiryTime,
    bool isResolved,
    uint64 yesVotes,
    uint64 noVotes,
    uint256 prizePool,
    bool yesWon,
    uint256 refundDeadline
)
```

Get comprehensive market information.

**Returns:**
- `creator`: Market creator address
- `platformStake`: Platform fee paid
- `voteStake`: Required vote stake
- `createdTime`: Creation timestamp
- `expiryTime`: Expiry timestamp
- `isResolved`: Resolution status
- `yesVotes`: Revealed YES votes (0 if not resolved)
- `noVotes`: Revealed NO votes (0 if not resolved)
- `prizePool`: Total prize pool
- `yesWon`: Winner status
- `refundDeadline`: Refund deadline timestamp

---

### getDecryptionStatus

```solidity
function getDecryptionStatus(string memory betId) external view returns (
    DecryptionStatus status,
    uint256 requestId,
    bool isRefundTriggered
)
```

Get decryption-related status.

**Returns:**
- `status`: Current decryption status enum
- `requestId`: Decryption request ID (0 if not requested)
- `isRefundTriggered`: True if timeout protection activated

---

### getUserVoteInfo

```solidity
function getUserVoteInfo(string memory betId, address user) external view returns (
    uint8 voteType,
    uint256 stakeAmount,
    uint256 voteTimestamp,
    bool hasRefunded
)
```

Get user's vote information for a market.

**Parameters:**
- `betId`: Market identifier
- `user`: User address

**Returns:**
- `voteType`: 0 (No), 1 (Yes), or 0 if not voted
- `stakeAmount`: Amount staked
- `voteTimestamp`: Vote timestamp
- `hasRefunded`: Claim/refund status

---

### isRefundEligible

```solidity
function isRefundEligible(string memory betId, address user) external view returns (bool)
```

Check if user is eligible for refund.

**Parameters:**
- `betId`: Market identifier
- `user`: User address

**Returns:** True if eligible for refund

---

### getRemainingRefundTime

```solidity
function getRemainingRefundTime(string memory betId) external view returns (int256)
```

Get remaining time until refund window opens.

**Parameters:**
- `betId`: Market identifier

**Returns:** Seconds until refund deadline (0 if already passed)

---

### hasVoted

```solidity
function hasVoted(string betId, address user) external view returns (bool)
```

Check if user has voted on a market.

---

### userVotes

```solidity
function userVotes(string betId, address user) external view returns (UserVoteInfo memory)
```

Get user vote info struct.

---

## Testing Functions

> Note: These functions are only available when `isTesting == true`

### testingMarkVoted

```solidity
function testingMarkVoted(
    string memory betId,
    address voter,
    uint8 voteType,
    uint256 stakeAmount
) external onlyOwner validBetId(betId)
```

Mark a user as having voted (testing only).

**Reverts with:** `"ERR_TESTING_DISABLED"`

---

### testingResolve

```solidity
function testingResolve(
    string memory betId,
    uint64 revealedYes,
    uint64 revealedNo
) external onlyOwner validBetId(betId)
```

Manually resolve a market (testing only).

**Reverts with:** `"ERR_TESTING_DISABLED"`, `"ERR_BET_NOT_FOUND"`

---

## Error Reference

| Error Code | Description | Function(s) |
|------------|-------------|-------------|
| `ERR_NOT_OWNER` | Caller is not contract owner | Owner functions |
| `ERR_NOT_GATEWAY` | Caller is not gateway | resolveTallyCallback |
| `ERR_CONTRACT_PAUSED` | Contract is paused | Most public functions |
| `ERR_INVALID_BET_ID` | Bet ID empty or too long | All bet functions |
| `ERR_INVALID_AMOUNT` | Amount is zero | validAmount modifier |
| `ERR_AMOUNT_OVERFLOW` | Amount exceeds safe maximum | validAmount modifier |
| `ERR_INVALID_GATEWAY` | Gateway address is zero | Constructor, setGateway |
| `ERR_INCORRECT_STAKE` | Wrong ETH amount sent | createBet, vote |
| `ERR_STAKE_TOO_LOW` | Vote stake below minimum | createBet |
| `ERR_INVALID_DURATION` | Duration out of valid range | createBet |
| `ERR_BET_EXISTS` | Bet ID already used | createBet |
| `ERR_BET_NOT_FOUND` | Bet doesn't exist | Most bet operations |
| `ERR_BET_RESOLVED` | Bet already resolved | vote |
| `ERR_BET_EXPIRED` | Bet has expired | vote |
| `ERR_ALREADY_VOTED` | User already voted | vote |
| `ERR_INVALID_VOTE_TYPE` | Vote type not 0 or 1 | vote |
| `ERR_BET_NOT_EXPIRED` | Bet hasn't expired yet | requestTallyReveal |
| `ERR_ALREADY_RESOLVED` | Already resolved | requestTallyReveal, callback |
| `ERR_NOT_CREATOR` | Only creator can call | requestTallyReveal |
| `ERR_BET_NOT_RESOLVED` | Bet not resolved yet | claimPrize |
| `ERR_ALREADY_CLAIMED` | Already claimed prize | claimPrize |
| `ERR_NOT_VOTED` | User didn't vote | claimPrize, claimRefund |
| `ERR_TIE_USE_REFUND` | Tie - use refund instead | claimPrize |
| `ERR_NOT_WINNER` | Not on winning side | claimPrize |
| `ERR_NO_WINNERS` | No votes on winning side | claimPrize |
| `ERR_ALREADY_REFUNDED` | Already refunded | claimRefund |
| `ERR_INELIGIBLE_REFUND` | Not eligible for refund | claimRefund |
| `ERR_INVALID_STATUS` | Invalid decryption status | markDecryptionFailed |
| `ERR_TRANSFER_FAILED` | ETH transfer failed | Various |
| `ERR_NO_FEES` | No fees to withdraw | withdrawPlatformFees |
| `ERR_INVALID_ADDRESS` | Address is zero | withdrawPlatformFees |
| `ERR_TESTING_DISABLED` | Testing mode not enabled | Testing functions |

---

## Gas Estimates

| Function | Estimated Gas | Notes |
|----------|---------------|-------|
| createBet | ~120,000 | Initial storage + FHE setup |
| vote | ~80,000 | FHE operations + storage |
| requestTallyReveal | ~50,000 | Decryption request |
| resolveTallyCallback | ~60,000 | Callback processing |
| claimPrize | ~45,000 | Transfer + state update |
| claimRefund | ~40,000 | Transfer + state update |
| View functions | ~2,000-5,000 | Read-only |

---

## Integration Example

```javascript
import { ethers } from 'ethers';
import { FHEClient } from '@fhevm/sdk';

// Initialize provider and contract
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

// Create market
async function createMarket(betId, duration) {
    const voteStake = ethers.parseEther("0.01");
    const platformFee = ethers.parseEther("0.02");

    const tx = await contract.createBet(betId, voteStake, duration, {
        value: platformFee
    });
    await tx.wait();
}

// Vote on market
async function castVote(betId, voteType, weight) {
    const fheClient = await FHEClient.create();
    const encryptedWeight = await fheClient.encrypt64(weight);
    const proof = await fheClient.generateProof(encryptedWeight);

    const betInfo = await contract.getBet(betId);

    const tx = await contract.vote(
        betId,
        encryptedWeight.data,
        voteType,
        proof,
        { value: betInfo.voteStake }
    );
    await tx.wait();
}

// Check refund eligibility
async function checkRefundStatus(betId) {
    const address = await signer.getAddress();
    const eligible = await contract.isRefundEligible(betId, address);
    const remaining = await contract.getRemainingRefundTime(betId);

    return {
        eligible,
        remainingSeconds: Number(remaining)
    };
}
```

---

**API Version:** 1.0
**Contract Version:** ^0.8.24
