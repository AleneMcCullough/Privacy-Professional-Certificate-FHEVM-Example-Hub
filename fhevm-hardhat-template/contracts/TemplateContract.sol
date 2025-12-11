// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Template Contract
/// @dev This is a template contract for FHEVM examples
contract TemplateContract is SepoliaConfig {
    
    euint32 private _value;

    event ValueUpdated(address indexed user);

    function setValue(euint32 value) external {
        _value = value;
        FHE.allowThis(_value);
        FHE.allow(_value, msg.sender);
        emit ValueUpdated(msg.sender);
    }

    function getValue() external view returns (euint32) {
        return _value;
    }
}
