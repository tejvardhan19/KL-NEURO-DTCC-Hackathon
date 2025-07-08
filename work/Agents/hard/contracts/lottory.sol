// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleLottery {
    address public owner;
    address public winner;
    uint256 public entryFee = 0.1 ether;
    uint256 public numberOfPlayers = 0;
    address[] public players;

    event Entered(address indexed player);
    event WinnerAnnounced(address indexed winner, uint256 indexed prize);

    constructor() {
        owner = msg.sender;
    }

    // Function to enter the lottery
    function enter() public payable {
        require(msg.value == entryFee, "Incorrect entry fee");
        players.push(msg.sender);
        numberOfPlayers++;
        emit Entered(msg.sender);
    }

    // Function to trigger the lottery draw
    function draw() public {
        require(msg.sender == owner, "Only owner can trigger the draw");
        require(numberOfPlayers >= 10, "Not enough players to draw");

        uint256 index = uint256(keccak256(abi.encodePacked(block.timestamp, players))) % numberOfPlayers;
        winner = players[index];

        // Transfer the prize to the winner
        (bool success, ) = winner.call{value: numberOfPlayers * entryFee}("");
        require(success, "Transfer failed");

        // Reset the lottery
        players = new address[](0);
        numberOfPlayers = 0;
        emit WinnerAnnounced(winner, numberOfPlayers * entryFee);
    }
}