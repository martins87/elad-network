// A Web3Provider wraps a standard Web3 provider, which is
// what Metamask injects as window.ethereum into each page
(async () => {
	try {
		await window.ethereum.enable();
	} catch (error) {
		console.log('Error opening Metamask:', error);
		alert('Please connect to Metamask');
	}
})();

// Factory Contract
const factoryContract = {
	address: "0x8a9526df84fd69e2926ca6c5b4748a0ceb60430e", // Ropsten
	ABI: [
		'function createProperty(string memory _symbol, string memory _name, uint256 _supplyOfTokens, address payable _owner) public returns (address)',
		'function totalTokens() public view returns(uint256)',
		'function getTokens() public view returns (address[] memory)',
		'function getTokenAddress(uint8 index) public view returns (address)'
	]
}
const factoryInstance = new ethers.Contract(factoryContract.address, factoryContract.ABI, provider);

console.log('[createProperty.js] Factory address:', factoryContract.address);

var userAccount;
var userBalance;

(() => {
    provider.listAccounts().then(accounts => {
        userAccount = accounts[0];
		
        provider.getBalance(userAccount).then(balance => {
			userBalance = +ethers.utils.formatEther(balance);
        });
    });
})();

const loadAuctions = async () => {
    // first we get all tokens created
    const tokens = await factoryInstance.getTokens();
	console.log('[auctions.js] total tokens created:', tokens.length);
	
	// for every token created, we get all auctions
	for(let i = 0; i < tokens.length; i++) {
		let tokenAddress = tokens[i];
		console.log(`[auctions.js] Token ${i} address:`, tokenAddress);
		
		// Property Token Contract
		const propertyTokenContract = {
			address: tokenAddress,
			ABI: [
				'constructor(string memory _symbol, string memory _name, uint256 _initialSupply, address payable owner) public',
				'function getTokensBought() public view returns(uint256)',
				'function totalSupply() public view override returns (uint256)',
				'function balanceOf(address account) public view override returns (uint256)',
				'function transfer(address recipient, uint256 amount) public override returns (bool)',
				'function allowance(address tokenOwner, address spender) public view override returns (uint256)',
				'function approve(address spender, uint256 value) public override returns (bool)',
				'function transferFrom(address sender, address recipient, uint256 amount) public override returns (bool)',
				'function _transfer(address sender, address recipient, uint256 amount) internal',
				'function _approve(address tokenOwner, address spender, uint256 value) internal',
				'function addAuction(uint256 amount, uint256 price) public',
				'function addAuction(address addr, uint256 amount, uint256 price) private',
				'function getTotalOwnerAuctions(address addr) public view returns(uint256)',
				'function getOwnerAuctions(address addr) public view returns(Price[] memory)',
				'function getAuction(address addr, uint index) public view returns(uint256, uint256)',
				'function getOwnerTokensOnAuction(address addr) public view returns(uint256)',
				'function buyTokens() public payable',
				'function buyFromAuction(address tokenOwner, uint index, uint256 amount) public payable',
				'function myBalance() public view returns (uint256)',
				'function tokensLeft() public view returns(uint256)',
				'function propertyDetails() public view returns(string memory, string memory, uint256, uint256, uint256, address)',
				'function getOwner() public view returns (address)',
				'function getTotalAuctionOwners() public view returns (uint)',
				'function getAuctionOwners() public view returns (address[] memory)'
			]
		}
		const propertyTokenInstance = new ethers.Contract(propertyTokenContract.address, propertyTokenContract.ABI, provider);
		
		// auction owners
		let auctionOwners = await propertyTokenInstance.getAuctionOwners();
		console.log(`[auctions.js] Auction owners:`, auctionOwners);
		
		// for every auction owner, get all auctions
		for(let j = 0; j < auctionOwners.length; j++) {
			let auctionOwner = auctionOwners[j] + "";
			let totalOwnerAuctions = await propertyTokenInstance.getTotalOwnerAuctions(auctionOwner);
			totalOwnerAuctions = +totalOwnerAuctions.toString();
			
			console.log(`[auctions.js] Auction owner :`, auctionOwner);
			console.log(`[auctions.js] total owner auctions :`, totalOwnerAuctions);
			
			// get all owner auctions
			for(let k = 0; k < totalOwnerAuctions; k++) {
				let [amount, price] = await propertyTokenInstance.getAuction(auctionOwner, k);
				amount = +amount.toString()
				price = +price.toString()
				console.log(`[auctions.js] Owner auction[${k}] amount:`, amount);
				console.log(`[auctions.js] Owner auction[${k}] price:`, price);
			}
		}
	}
}

const formatNumber = (number) => {
    return number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

const formatAddress = (address) => {
	return address.substring(0, address.length/2.5) + '...';
}

loadAuctions();