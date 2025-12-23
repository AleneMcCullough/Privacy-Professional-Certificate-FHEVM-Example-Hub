// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint32, externalEuint32 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Public Decrypt Single Value
/// @dev Demonstrates public decryption mechanism for making encrypted values publicly visible
contract PublicDecryptSingleValue is SepoliaConfig {

    euint32 private encryptedValue;
    uint32 public decryptedValue;
    bool public isDecrypted;

    event ValueStored(address indexed user);
    event DecryptionRequested(uint256 requestId);
    event ValueDecrypted(uint32 value);

    /// @dev Store encrypted value
    function storeValue(
        externalEuint32 inputValue,
        bytes calldata inputProof
    ) external {
        euint32 encrypted = FHE.fromExternal(inputValue, inputProof);
        encryptedValue = encrypted;

        FHE.allowThis(encrypted);
        FHE.allow(encrypted, msg.sender);

        isDecrypted = false;
        emit ValueStored(msg.sender);
    }

    /// @dev Request public decryption
    /// @notice This initiates a decryption request that will be fulfilled by the KMS
    function requestPublicDecryption() external returns (uint256) {
        require(FHE.isInitialized(encryptedValue), "Value not initialized");

        // In production, this would create a decryption request to the KMS
        // The KMS would decrypt the value and call a callback function
        // For demonstration, we simulate with a requestId
        uint256 requestId = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender)));

        emit DecryptionRequested(requestId);
        return requestId;
    }

    /// @dev Simulate KMS callback (in production, only KMS can call this)
    /// @notice This would be called by the KMS after decryption
    function fulfillDecryption(uint32 plainValue) external {
        decryptedValue = plainValue;
        isDecrypted = true;

        emit ValueDecrypted(plainValue);
    }

    /// @dev Get encrypted value handle
    function getEncryptedValue() external view returns (euint32) {
        return encryptedValue;
    }

    /// @dev Get decrypted value (only available after decryption)
    function getDecryptedValue() external view returns (uint32) {
        require(isDecrypted, "Value not yet decrypted");
        return decryptedValue;
    }

    /// @dev Check if value has been decrypted
    function hasDecrypted() external view returns (bool) {
        return isDecrypted;
    }
}
