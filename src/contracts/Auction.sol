pragma solidity >=0.8.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/math/SafeMath.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Context.sol";

contract Auction {
    using SafeMath for uint256;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    
    struct Price {
        uint256 amount;
        uint256 price;
    }
    
    uint256 private _totalSupply;
    uint256 private _tokensBought;
    uint256 private _exchangeRate = 100;
    address payable private _owner;
    mapping (address => uint256) private _balances;
    mapping (address => Price[]) private _auction;
    mapping (address => uint256) private _tokensOnAuction;

    constructor(uint256 initialSupply) {
        _totalSupply = initialSupply;
        _owner = payable(msg.sender);
        _balances[_owner] = _totalSupply;
        addAuction(_owner, _totalSupply, 10000000000000000);
    }
    
    function getOwner() public view returns(address) {
        return _owner;
    }
    
    function getTokensBought() public view returns(uint256) {
        return _tokensBought;
    }
    
    function balanceOf(address addr) public view returns (uint256) {
        return _balances[addr];
    }
    
    function addAuction(uint256 amount, uint256 price) public {
        _auction[msg.sender].push(Price(amount, price));
        _tokensOnAuction[msg.sender] += amount;
    }
    
    function addAuction(address addr, uint256 amount, uint256 price) private {
        _auction[addr].push(Price(amount, price));
        _tokensOnAuction[addr] += amount;
    }
    
    function getTotalOwnerAuctions(address addr) public view returns(uint256){
        return _auction[addr].length;
    }
    
    function getOwnerAuctions(address addr) public view returns(Price[] memory){
        return _auction[addr];
    }

    function getAuction(address addr, uint index) public view returns(Price memory){
        return _auction[addr][index];
    }
    
    function getOwnerTokensOnAuction(address addr) public view returns(uint256) {
        return _tokensOnAuction[addr];
    }
    
    function buy() public payable {
        require(msg.sender != _owner, "Caller can't be contract owner");
        
        uint256 amount = _exchangeRate.mul(msg.value).div(1 ether);
        
        require(amount > 0, "Amount of ether sent less than 1 Finney");
        require(amount <= _balances[_owner], "Contract owner doesn't have enough balance");
        
        _transfer(_owner, msg.sender, amount);
        _owner.transfer(msg.value);
        
        _tokensBought += amount;
        _auction[_owner][0].amount -= amount;
        _tokensOnAuction[_owner] -= amount;
        
        emit Transfer(_owner, msg.sender, amount);
    }
    
    function buyFromAuction(address tokenOwner, uint index, uint256 amount) public payable {
        require(msg.sender != _owner, "Caller can't be contract owner");
        
        // uint256 tokenPrice = _auction[tokenOwner][index].price;
        //uint256 tokens = msg.value.div(amount);
        // TODO verify values are correct
        // uint256 isItRight = msg.value.div(tokenPrice);
        
        // require(tokens > 0, "Amount of ether sent less than 1 Finney");
        // require(tokens <= _balances[owner], "Contract owner doesn't have enough balance");
        
        _transfer(tokenOwner, msg.sender, amount);
        payable(tokenOwner).transfer(msg.value);
        
        _auction[tokenOwner][index].amount -= amount;
        _tokensOnAuction[tokenOwner] -= amount;
        
        emit Transfer(tokenOwner, msg.sender, amount);
    }
    
    function _transfer(address sender, address recipient, uint256 amount) internal {
        require(sender != address(0), "ERC20: transfer from the zero address");
        require(recipient != address(0), "ERC20: transfer to the zero address");

        _balances[sender] = _balances[sender].sub(amount);
        _balances[recipient] = _balances[recipient].add(amount);
        emit Transfer(sender, recipient, amount);
    }
}
