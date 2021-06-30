pragma solidity >=0.8.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/math/SafeMath.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/utils/Context.sol";

contract PropertyToken is IERC20 {
    using SafeMath for uint256;
    
    struct Price {
        uint256 amount;
        uint256 price;
    }

    string public symbol;
    string public name;
    uint8 public decimals;
    uint256 private _totalSupply;
    uint256 private _tokensBought;
    address[] private _auctionOwnerAddresses;
    uint256 private _exchangeRate;
    address payable private _owner;

    mapping (address => uint256) private _balances;
    mapping (address => mapping (address => uint256)) private _allowances;
    mapping (address => Price[]) private _auction;
    mapping (address => uint256) private _tokensOnAuction;
    

    constructor(string memory _symbol, string memory _name, uint256 _initialSupply, address payable owner) public {
        symbol = _symbol;
        name = _name;
        decimals = 0;
        _totalSupply = _initialSupply * 10**uint(decimals);
        _exchangeRate = 100;
        _owner = owner;
        _balances[_owner] = _totalSupply;
        addAuction(_owner, _totalSupply, 10000000000000000);
        _auctionOwnerAddresses.push(owner);
        emit Transfer(address(0), _owner, _totalSupply);
    }
    
    function getTokensBought() public view returns(uint256) {
        return _tokensBought;
    }
    
    /**
     * @dev See `IERC20.totalSupply`.
     */
    function totalSupply() public view override returns (uint256) {
        return _totalSupply;
    }

    /**
     * @dev See `IERC20.balanceOf`.
     */
    function balanceOf(address account) public view override returns (uint256) {
        return _balances[account];
    }

    /**
     * @dev See `IERC20.transfer`.
     *
     * Requirements:
     *
     * - `recipient` cannot be the zero address.
     * - the caller must have a balance of at least `amount`.
     */
    function transfer(address recipient, uint256 amount) public override returns (bool) {
        _transfer(msg.sender, recipient, amount);
        return true;
    }
    
    /**
     * @dev See `IERC20.allowance`.
     */
    function allowance(address tokenOwner, address spender) public view override returns (uint256) {
        return _allowances[tokenOwner][spender];
    }
    
    /**
     * @dev See `IERC20.approve`.
     *
     * Requirements:
     *
     * - `spender` cannot be the zero address.
     */
    function approve(address spender, uint256 value) public override returns (bool) {
        _approve(msg.sender, spender, value);
        return true;
    }

    /**
     * @dev See `IERC20.transferFrom`.
     *
     * Emits an `Approval` event indicating the updated allowance. This is not
     * required by the EIP. See the note at the beginning of `ERC20`;
     *
     * Requirements:
     * - `sender` and `recipient` cannot be the zero address.
     * - `sender` must have a balance of at least `value`.
     * - the caller must have allowance for `sender`'s tokens of at least
     * `amount`.
     */
    function transferFrom(address sender, address recipient, uint256 amount) public override returns (bool) {
        _transfer(sender, recipient, amount);
        _approve(sender, msg.sender, _allowances[sender][msg.sender].sub(amount));
        return true;
    }

    /**
     * @dev Moves tokens `amount` from `sender` to `recipient`.
     *
     * This is internal function is equivalent to `transfer`, and can be used to
     * e.g. implement automatic token fees, slashing mechanisms, etc.
     *
     * Emits a `Transfer` event.
     *
     * Requirements:
     *
     * - `sender` cannot be the zero address.
     * - `recipient` cannot be the zero address.
     * - `sender` must have a balance of at least `amount`.
     */
    function _transfer(address sender, address recipient, uint256 amount) internal {
        require(sender != address(0), "ERC20: transfer from the zero address");
        require(recipient != address(0), "ERC20: transfer to the zero address");

        _balances[sender] = _balances[sender].sub(amount);
        _balances[recipient] = _balances[recipient].add(amount);
        emit Transfer(sender, recipient, amount);
    }
    
    /**
     * @dev Sets `amount` as the allowance of `spender` over the `owner`s tokens.
     *
     * This is internal function is equivalent to `approve`, and can be used to
     * e.g. set automatic allowances for certain subsystems, etc.
     *
     * Emits an `Approval` event.
     *
     * Requirements:
     *
     * - `owner` cannot be the zero address.
     * - `spender` cannot be the zero address.
     */
    function _approve(address tokenOwner, address spender, uint256 value) internal {
        require(tokenOwner != address(0), "ERC20: approve from the zero address");
        require(spender != address(0), "ERC20: approve to the zero address");

        _allowances[tokenOwner][spender] = value;
        emit Approval(tokenOwner, spender, value);
    }

    function addAuction(uint256 amount, uint256 price) public {
        if (_auction[msg.sender].length == 0) _auctionOwnerAddresses.push(msg.sender);
        _auction[msg.sender].push(Price(amount, price));
        _tokensOnAuction[msg.sender] += amount;
    }
    
    function addAuction(address addr, uint256 amount, uint256 price) private {
        _auction[addr].push(Price(amount, price));
        _tokensOnAuction[addr] += amount;
    }
    
    function getTotalOwnerAuctions(address addr) public view returns(uint256) {
        return _auction[addr].length;
    }
    
    function getOwnerAuctions(address addr) public view returns(Price[] memory) {
        return _auction[addr];
    }

    function getAuction(address addr, uint index) public view returns(uint256, uint256) {
        return (_auction[addr][index].amount, _auction[addr][index].price);
    }
    
    function getOwnerTokensOnAuction(address addr) public view returns(uint256) {
        return _tokensOnAuction[addr];
    }
    
    /**
     * @dev Implements the buy property token functionality.
     *
     * Receives ether from investor, moves tokens from owner to investor.
     * Ether received is transferred to contract owner.
     *
     * Emits a `Transfer` event.
     *
     * Requirements:
     *
     * - cannot be called by contract owner.
     * - amount of ether should be at least 1 Finney.
     * - amount of tokens to buy must be less or equal contract owner's balance.
     */
    function buyTokens() public payable {
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
        
        _tokensBought += amount;
        _auction[tokenOwner][index].amount -= amount;
        _tokensOnAuction[tokenOwner] -= amount;
        
        emit Transfer(tokenOwner, msg.sender, amount);
    }
    
    /**
     * @dev Returns token balance of calling account
     */
    function myBalance() public view returns (uint256) {
        return _balances[msg.sender];
    }
    
    /**
     * @dev Returns available amount of tokens to buy
     */
    function tokensLeft() public view returns(uint256) {
        return totalSupply() - _tokensBought;
    }
    
    /**
     * @dev Returns some property details
     */
    function propertyDetails() public view returns(string memory, string memory, uint256, uint256, uint256, address) {
        return (name, symbol, _totalSupply, _tokensBought, tokensLeft(), _owner);
    }
    
    /**
     * @dev Returns contract owner address
     */
    function getOwner() public view returns (address) {
        return _owner;
    }
    
    function getTotalAuctionOwners() public view returns (uint) {
        return _auctionOwnerAddresses.length;
    }
    
    function getAuctionOwners() public view returns (address[] memory) {
        return _auctionOwnerAddresses;
    }
    
    /**
     * @dev Doesn't accept ether
     */
    fallback () external payable {
        revert();
    }
    
}

contract PropertyTokenFactory {
    event NewToken(address _contract);
    
    address[] public tokens;
    uint256 private numberOfTokens;
    
    function createProperty(string memory _symbol, string memory _name, uint256 _supplyOfTokens, address payable _owner) public returns (address) {
        PropertyToken tokenContract = new PropertyToken(_symbol, _name, _supplyOfTokens, _owner);
        
        tokens.push(address(tokenContract));
        numberOfTokens++;
        
        emit NewToken(address(tokenContract));
        
        return address(tokenContract);
    }
    
    function totalTokens() public view returns(uint256) {
        return numberOfTokens;
    }
    
    function getTokens() public view returns (address[] memory) {
        return tokens;
    }
    
    function getTokenAddress(uint8 index) public view returns (address) {
        return tokens[index];
    }
}
