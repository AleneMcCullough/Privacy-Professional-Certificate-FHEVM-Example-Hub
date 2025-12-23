// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint64, externalEuint64, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Confidential Vesting Wallet
/// @dev Implements a vesting schedule with encrypted token amounts
/// @notice Tokens vest linearly over time with encrypted balances
contract ConfidentialVestingWallet is SepoliaConfig {

    address public beneficiary;
    uint256 public startTimestamp;
    uint256 public durationSeconds;

    euint64 private totalAllocation;
    euint64 private released;

    event TokensReleased(address indexed beneficiary, uint256 timestamp);
    event VestingScheduleCreated(address indexed beneficiary, uint256 start, uint256 duration);

    constructor(
        address _beneficiary,
        uint256 _startTimestamp,
        uint256 _durationSeconds
    ) {
        require(_beneficiary != address(0), "Invalid beneficiary");
        require(_durationSeconds > 0, "Invalid duration");

        beneficiary = _beneficiary;
        startTimestamp = _startTimestamp;
        durationSeconds = _durationSeconds;

        emit VestingScheduleCreated(_beneficiary, _startTimestamp, _durationSeconds);
    }

    /// @dev Allocate encrypted tokens to vest
    function allocate(
        externalEuint64 encryptedAmount,
        bytes calldata proof
    ) external {
        require(msg.sender == beneficiary, "Only beneficiary");
        require(!FHE.isInitialized(totalAllocation), "Already allocated");

        euint64 amount = FHE.fromExternal(encryptedAmount, proof);

        totalAllocation = amount;
        released = FHE.asEuint64(0);

        FHE.allowThis(totalAllocation);
        FHE.allow(totalAllocation, beneficiary);

        FHE.allowThis(released);
        FHE.allow(released, beneficiary);
    }

    /// @dev Release vested tokens
    function release() external returns (euint64) {
        require(msg.sender == beneficiary, "Only beneficiary");
        require(FHE.isInitialized(totalAllocation), "Not allocated");

        euint64 releasable = _calculateReleasableAmount();

        require(FHE.isInitialized(releasable), "Nothing to release");

        released = FHE.add(released, releasable);

        FHE.allowThis(released);
        FHE.allow(released, beneficiary);

        FHE.allowThis(releasable);
        FHE.allow(releasable, beneficiary);

        emit TokensReleased(beneficiary, block.timestamp);

        return releasable;
    }

    /// @dev Get total allocation (encrypted)
    function getTotalAllocation() external view returns (euint64) {
        return totalAllocation;
    }

    /// @dev Get released amount (encrypted)
    function getReleased() external view returns (euint64) {
        return released;
    }

    /// @dev Get vested amount at current time (encrypted)
    function getVestedAmount() external view returns (euint64) {
        return _calculateVestedAmount();
    }

    /// @dev Calculate vested amount based on time
    function _calculateVestedAmount() internal view returns (euint64) {
        if (block.timestamp < startTimestamp) {
            return FHE.asEuint64(0);
        }

        if (block.timestamp >= startTimestamp + durationSeconds) {
            return totalAllocation;
        }

        uint256 elapsed = block.timestamp - startTimestamp;
        uint256 vestingRatio = (elapsed * 10000) / durationSeconds; // Basis points

        // Calculate vested = totalAllocation * vestingRatio / 10000
        // Simplified calculation - production should use more precise math
        euint64 ratioEncrypted = FHE.asEuint64(uint64(vestingRatio));
        euint64 vested = FHE.mul(totalAllocation, ratioEncrypted);

        // Divide by 10000 (simplified)
        euint64 divisor = FHE.asEuint64(10000);
        vested = FHE.div(vested, divisor);

        return vested;
    }

    /// @dev Calculate releasable amount (vested - released)
    function _calculateReleasableAmount() internal view returns (euint64) {
        euint64 vested = _calculateVestedAmount();

        // releasable = vested - released
        euint64 releasable = FHE.sub(vested, released);

        return releasable;
    }

    /// @dev Check if fully vested
    function isFullyVested() external view returns (bool) {
        return block.timestamp >= startTimestamp + durationSeconds;
    }

    /// @dev Get vesting schedule info
    function getVestingSchedule() external view returns (
        address _beneficiary,
        uint256 _start,
        uint256 _duration,
        uint256 _end
    ) {
        return (
            beneficiary,
            startTimestamp,
            durationSeconds,
            startTimestamp + durationSeconds
        );
    }
}
