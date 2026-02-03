// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title Game2048Fee
 * @dev Smart contract to handle game fee collection and distribution for 2048 Mini App
 */
contract Game2048Fee is Ownable, ReentrancyGuard {
    // USDC Token on Base Network
    IERC20 public constant USDC = IERC20(0x833589fcd6edb6e08f4c7c32d4f71b1566da8b16);
    
    // Game configuration
    uint256 public gameFeeAmount = 1000; // 0.001 USDC (6 decimals)
    address public feeRecipient;
    
    // Events
    event GameFeeCollected(address indexed player, uint256 amount, string gameId);
    event GameWinRecorded(address indexed player, uint256 score, string gameId);
    event FeeRecipientUpdated(address indexed newRecipient);
    event GameFeeUpdated(uint256 newAmount);
    
    // Game records
    struct GameRecord {
        address player;
        uint256 score;
        uint256 timestamp;
        bool feePaid;
    }
    
    mapping(string => GameRecord) public gameRecords;
    mapping(address => uint256) public playerGameCount;
    
    constructor(address _feeRecipient) {
        require(_feeRecipient != address(0), "Invalid fee recipient");
        feeRecipient = _feeRecipient;
    }
    
    /**
     * @dev Collect game fee from player
     * @param gameId Unique game session ID
     */
    function payGameFee(string calldata gameId) external nonReentrant {
        require(bytes(gameId).length > 0, "Invalid game ID");
        require(!gameRecords[gameId].feePaid, "Fee already paid for this game");
        
        // Transfer USDC from player to fee recipient
        require(
            USDC.transferFrom(msg.sender, feeRecipient, gameFeeAmount),
            "USDC transfer failed"
        );
        
        // Record the game
        gameRecords[gameId] = GameRecord({
            player: msg.sender,
            score: 0,
            timestamp: block.timestamp,
            feePaid: true
        });
        
        playerGameCount[msg.sender]++;
        
        emit GameFeeCollected(msg.sender, gameFeeAmount, gameId);
    }
    
    /**
     * @dev Record game completion and score
     * @param gameId Unique game session ID
     * @param score Final game score
     */
    function recordGameWin(
        string calldata gameId,
        uint256 score
    ) external nonReentrant {
        GameRecord storage record = gameRecords[gameId];
        require(record.feePaid, "Game fee not paid");
        require(record.player == msg.sender, "Only game player can submit score");
        require(record.score == 0, "Score already recorded");
        
        record.score = score;
        emit GameWinRecorded(msg.sender, score, gameId);
    }
    
    /**
     * @dev Get game record
     */
    function getGameRecord(string calldata gameId) 
        external 
        view 
        returns (GameRecord memory) 
    {
        return gameRecords[gameId];
    }
    
    /**
     * @dev Get player's total games
     */
    function getPlayerGameCount(address player) 
        external 
        view 
        returns (uint256) 
    {
        return playerGameCount[player];
    }
    
    /**
     * @dev Update game fee amount (only owner)
     */
    function updateGameFee(uint256 _newAmount) external onlyOwner {
        require(_newAmount > 0, "Fee must be greater than 0");
        gameFeeAmount = _newAmount;
        emit GameFeeUpdated(_newAmount);
    }
    
    /**
     * @dev Update fee recipient (only owner)
     */
    function updateFeeRecipient(address _newRecipient) external onlyOwner {
        require(_newRecipient != address(0), "Invalid fee recipient");
        feeRecipient = _newRecipient;
        emit FeeRecipientUpdated(_newRecipient);
    }
    
    /**
     * @dev Withdraw any tokens accidentally sent to contract
     */
    function withdrawToken(address token, uint256 amount) external onlyOwner {
        require(IERC20(token).transfer(msg.sender, amount), "Transfer failed");
    }
}
