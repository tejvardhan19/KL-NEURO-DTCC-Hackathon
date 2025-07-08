// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ATLAS {
    // State variables
    string public name = "ATLAS";
    string public symbol = "ATLAS";
    uint8 public decimals = 18;
    uint256 public totalSupply;

    // Mapping from address to balance
    mapping(address => uint256) private _balances;

    // Mapping from address to allowed amounts
    mapping(address => mapping(address => uint256)) private _allowances;

    // Event for transfer
    event Transfer(address indexed from, address indexed to, uint256 value);

    // Event for approval
    event Approval(address indexed owner, address indexed spender, uint256 value);

    // Constructor to mint initial supply to deployer
    constructor() {
        _balances[msg.sender] = 300 * (10 ** uint256(decimals));
        totalSupply = 300 * (10 ** uint256(decimals));
    }

    // Function to get the balance of an account
    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    // Function to transfer tokens
    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(_to != address(0), "Invalid address");
        require(_balances[msg.sender] >= _value, "Insufficient balance");

        _balances[msg.sender] -= _value;
        _balances[_to] += _value;

        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    // Function to approve a certain amount of tokens to be spent by another address
    function approve(address _spender, uint256 _value) public returns (bool success) {
        _allowances[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    // Function to transfer tokens from one address to another
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(_from != address(0), "Invalid from address");
        require(_to != address(0), "Invalid to address");
        require(_balances[_from] >= _value, "Insufficient balance");
        require(_allowances[_from][msg.sender] >= _value, "Allowance exceeded");

        _balances[_from] -= _value;
        _balances[_to] += _value;
        _allowances[_from][msg.sender] -= _value;

        emit Transfer(_from, _to, _value);
        return true;
    }
}