// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import { FHE, euint64, ebool, externalEuint64 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Blind Auction
/// @dev Demonstrates a sealed-bid auction using FHEVM
/// @notice Bidders submit encrypted bids that remain private until reveal
contract BlindAuction is SepoliaConfig {
    
    address public auctioneer;
    uint256 public biddingEnd;
    uint256 public revealEnd;
    
    struct Bid {
        euint64 amount;
        bool revealed;
    }
    
    mapping(address => Bid) public bids;
    address public highestBidder;
    euint64 public highestBid;
    
    bool public ended;
    
    event BidPlaced(address indexed bidder);
    event BidRevealed(address indexed bidder);
    event AuctionEnded(address winner);

    modifier onlyBefore(uint256 time) {
        require(block.timestamp < time, "Too late");
        _;
    }

    modifier onlyAfter(uint256 time) {
        require(block.timestamp >= time, "Too early");
        _;
    }

    constructor(uint256 biddingTime, uint256 revealTime) {
        auctioneer = msg.sender;
        biddingEnd = block.timestamp + biddingTime;
        revealEnd = biddingEnd + revealTime;
    }

    /// @dev Place encrypted bid during bidding period
    /// @param bidAmount Encrypted bid amount
    /// @param bidProof Proof for the encrypted bid
    function placeBid(
        externalEuint64 bidAmount,
        bytes calldata bidProof
    ) external onlyBefore(biddingEnd) {
        require(bids[msg.sender].amount._euint64 == 0, "Already bid");
        
        euint64 encryptedBid = FHE.fromExternal(bidAmount, bidProof);
        
        bids[msg.sender] = Bid({
            amount: encryptedBid,
            revealed: false
        });
        
        FHE.allowThis(encryptedBid);
        FHE.allow(encryptedBid, msg.sender);
        
        emit BidPlaced(msg.sender);
    }

    /// @dev Reveal and process bid after bidding ends
    function revealBid() 
        external 
        onlyAfter(biddingEnd) 
        onlyBefore(revealEnd) 
    {
        Bid storage bid = bids[msg.sender];
        require(!bid.revealed, "Already revealed");
        require(FHE.isInitialized(bid.amount), "No bid placed");
        
        bid.revealed = true;
        
        // Compare with current highest bid
        if (!FHE.isInitialized(highestBid)) {
            highestBid = bid.amount;
            highestBidder = msg.sender;
        } else {
            // Update if this bid is higher
            ebool isHigher = FHE.gt(bid.amount, highestBid);
            highestBid = FHE.cmux(isHigher, bid.amount, highestBid);
            highestBidder = FHE.decrypt(isHigher) ? msg.sender : highestBidder;
        }
        
        emit BidRevealed(msg.sender);
    }

    /// @dev End auction after reveal period
    function endAuction() external onlyAfter(revealEnd) {
        require(!ended, "Already ended");
        require(msg.sender == auctioneer, "Only auctioneer");
        
        ended = true;
        emit AuctionEnded(highestBidder);
    }

    /// @dev Get own bid
    function getMyBid() external view returns (euint64) {
        return bids[msg.sender].amount;
    }

    /// @dev Check if bid is revealed
    function isBidRevealed(address bidder) external view returns (bool) {
        return bids[bidder].revealed;
    }
}
