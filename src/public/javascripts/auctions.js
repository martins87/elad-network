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
	address: "0x18cf8a1fE734c7d1782b0E41dF2aAFb41FAFB9Be", // Ropsten
	ABI: [
		'function createProperty(string memory _symbol, string memory _name, uint256 _supplyOfTokens, address payable _owner) public returns (address)',
		'function totalTokens() public view returns(uint256)',
		'function getTokens() public view returns (address[] memory)',
		'function getTokenAddress(uint8 index) public view returns (address)'
	]
}
const factoryInstance = new ethers.Contract(factoryContract.address, factoryContract.ABI, provider);

console.log('[auctions.js] Factory address:', factoryContract.address);

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
	for (let i = 0; i < tokens.length; i++) {
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

		// finally we get data from each token
		const tokenDetails = await propertyTokenInstance.propertyDetails();
		[tokenName, tokenSymbol, totalSupply, tokensBought, tokensLeft, propertyOwner] = tokenDetails;

		// for every auction owner, get all auctions
		for (let j = 0; j < auctionOwners.length; j++) {
			let auctionOwner = auctionOwners[j] + "";
			let totalOwnerAuctions = await propertyTokenInstance.getTotalOwnerAuctions(auctionOwner);
			totalOwnerAuctions = +totalOwnerAuctions.toString();

			console.log(`[auctions.js] Auction owner :`, auctionOwner);
			console.log(`[auctions.js] total owner auctions :`, totalOwnerAuctions);

			// get all owner auctions
			for (let k = 0; k < totalOwnerAuctions; k++) {
				document.getElementById("totalAuctions").value = totalOwnerAuctions;
				let numOfAuctions = document.getElementById("totalAuctions").value;

				let [amount, price] = await propertyTokenInstance.getAuction(auctionOwner, k);
				amount = +amount.toString()
				price = +price.toString()
				console.log(`[auctions.js] Owner auction[${k}] amount:`, amount);
				console.log(`[auctions.js] Owner auction[${k}] price:`, price);

				let cardContent = `
				<div class="card bg-white auction-card" style="width: 20rem; height:400px; max-height:450px; min-height:450px">
					<img class="card-img-top" src="https://blog.architizer.com/wp-content/uploads/111W57__Symmetry_Hrero__FINAL_.0.jpg" alt="Card image cap">
					<div class="card-body">
					<h2 class="token-name">${formatTokenName(tokenName)}</h2>
					<div class="auction-owner">${tokenSymbol} Token: ${formatOwnerAddress(tokenAddress)}</div>
					<div class="auction-owner">Owner: ${formatOwnerAddress(auctionOwner)}</div>
					<span id="propertyAddress"></span>
					<h3 style="color:#000099">${amount} @ ${formatTokenPrice(price)} ETH</h3>
					<a href="#" class="btn btn-success">See auction</a>
					</div>
				</div>
				`;

				let auctions = document.getElementById("auctions");
				let card = document.createElement("div");
				card.innerHTML = cardContent;
				auctions.appendChild(card);
			}
		}
	}
}

const formatNumber = (number) => {
	return number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

const formatOwnerAddress = (address) => {
	return address.substring(0, 6) + '...' + address.substring(address.length-4, address.length);
}

const formatTokenName = (name) => {
	return name.length > 24 ? name.substring(0, 24) + '...' : name;
}

const formatTokenPrice = (price) => {
	console.log('price in ETH:', price/(10**18))
	return price/(10**18);
}

loadAuctions();