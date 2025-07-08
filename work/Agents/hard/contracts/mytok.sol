// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MyToken {
    // State variables
    string public name = "MyToken";
    string public symbol = "MTK";
    uint8 public decimals = 18;
    uint256 public totalSupply;

    // Mapping to keep track of token balances
    mapping(address => uint256) public balanceOf;

    // Mapping to keep track of token allowance
    mapping(address => mapping(address => uint256)) public allowance;

    // Event to log token transfers
    event Transfer(address indexed from, address indexed to, uint256 value);

    // Event to log token approvals
    event Approval(address indexed owner, address indexed spender, uint256 value);

    // Constructor to initialize the total supply
    constructor() {
        totalSupply = 1_000_000 * (10 ** uint256(decimals));
        balanceOf[msg.sender] = totalSupply;
    }

    // Function to transfer tokens
    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value, "Insufficient balance");
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    // Function to approve a spender to transfer tokens on behalf of the owner
    function approve(address _spender, uint256 _value) public returns (bool success) {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    // Function to transfer tokens from one account to another on behalf of the owner
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[_from] >= _value, "Insufficient balance");
        require(allowance[_from][msg.sender] >= _value, "Allowance exceeded");
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;
        emit Transfer(_from, _to, _value);
        return true;
    }
}