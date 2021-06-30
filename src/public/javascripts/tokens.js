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

// get tokens addresses
const loadPropertyTokens = async () => {
    // first we get number of tokens created
    const totalTokens = await factoryInstance.totalTokens();
	
	// now we get tokens addresses
	for(let i = 0; i < totalTokens; i++) {
		let address = await factoryInstance.getTokenAddress(i);
		console.log(`Token ${i} address:`, address);

		// Property Token Contract
		const propertyTokenContract = {
			address: address,
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

		// finally we get data from each token
		const tokenDetails = await propertyTokenInstance.propertyDetails();
		console.log('Token details: ', tokenDetails);
		[tokenName, tokenSymbol, totalSupply, tokensBought, tokensLeft, propertyOwner] = tokenDetails;

		// populate table with token details
		var table = document.getElementById("tokensTable");
		var row = table.insertRow(1);
		var cell0 = row.insertCell(0);
		var cell1 = row.insertCell(1);
		var cell2 = row.insertCell(2);
		var cell3 = row.insertCell(3);
		var cell4 = row.insertCell(4);
		var cell5 = row.insertCell(5);

		cell0.innerHTML = tokenName + ' (' + tokenSymbol + ')';
		cell1.innerHTML = totalSupply;
		cell2.innerHTML = tokensBought;
		cell3.innerHTML = tokensLeft;
		cell4.innerHTML = "<a href=\"https://ropsten.etherscan.io/token/" + address + "\" target=\"_blank\">" + formatAddress(address) + "</a>&nbsp;&nbsp;<i class=\"fas fa-external-link-alt\"></i>";
		cell5.innerHTML = "<a href=\"https://ropsten.etherscan.io/address/" + propertyOwner + "\" target=\"_blank\">" + formatAddress(propertyOwner) + "</a>&nbsp;&nbsp;<i class=\"fas fa-external-link-alt\"></i>";
	}
}

const formatNumber = (number) => {
    return number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

const formatAddress = (address) => {
	return address.substring(0, address.length/2.5) + '...';
}

loadPropertyTokens();