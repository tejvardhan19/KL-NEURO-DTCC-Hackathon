// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VotingSystem {
    // State variables
    address public admin;
    mapping(address => bool) public voters;
    mapping(uint256 => string) public proposals;
    mapping(address => uint256) public votes;
    uint256 public proposalCount;
    uint256 public voteCount;

    // Constructor
    constructor() {
        admin = msg.sender;
    }

    // Function to add a new proposal
    function addProposal(string memory _proposal) public {
        require(msg.sender == admin, "Only admin can add proposals");
        proposals[proposalCount] = _proposal;
        proposalCount++;
    }

    // Function to vote for a proposal
    function vote(uint256 _proposalId) public {
        require(voters[msg.sender] == false, "Already voted");
        require(_proposalId < proposalCount, "Invalid proposal ID");
        voters[msg.sender] = true;
        votes[msg.sender] = _proposalId;
        voteCount++;
    }

    // Function to get the number of votes for a proposal
    function getVotes(uint256 _proposalId) public view returns (uint256) {
        uint256 voteCount = 0;
        for (uint256 i = 0; i < voteCount; i++) {
            if (votes[address(i)] == _proposalId) {
                voteCount++;
            }
        }
        return voteCount;
    }

    // Function to get the winner proposal
    function getWinner() public view returns (uint256) {
        uint256 maxVotes = 0;
        uint256 winnerId = 0;
        for (uint256 i = 0; i < proposalCount; i++) {
            uint256 votes = getVotes(i);
            if (votes > maxVotes) {
                maxVotes = votes;
                winnerId = i;
            }
        }
        return winnerId;
    }
}