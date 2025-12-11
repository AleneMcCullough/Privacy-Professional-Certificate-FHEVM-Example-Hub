// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title FHE Counter
/// @dev Demonstrates encrypted counter using FHEVM
contract FHECounter is SepoliaConfig {
    euint32 private _count;

    event CounterIncremented(address indexed user);
    event CounterDecremented(address indexed user);

    function getCount() external view returns (euint32) {
        return _count;
    }

    function increment(euint32 value) external {
        _count = FHE.add(_count, value);
        FHE.allowThis(_count);
        FHE.allow(_count, msg.sender);
        emit CounterIncremented(msg.sender);
    }

    function decrement(euint32 value) external {
        _count = FHE.sub(_count, value);
        FHE.allowThis(_count);
        FHE.allow(_count, msg.sender);
        emit CounterDecremented(msg.sender);
    }
}
