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
	address: "0xe8F28BaFb98C37a09374EDcB67f020Ccdb8FCC9E", // Ropsten
	ABI: [
		'function createProperty(string memory _symbol, string memory _name, uint256 _supplyOfTokens, address payable _owner) public returns (address)',
		'function totalTokens() public view returns(uint256)',
		'function getTokenAddress(uint8 index) public view returns (address)'
	]
}
const factoryInstance = new ethers.Contract(factoryContract.address, factoryContract.ABI, provider);

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
				'constructor(string memory _symbol, string memory _name, uint256 _initialSupply, address payable _owner) public',
				'function totalSupply() public view override returns (uint256)',
				'function balanceOf(address account) public view override returns (uint256)',
				'function transfer(address recipient, uint256 amount) public override returns (bool)',
				'function allowance(address tokenOwner, address spender) public view override returns (uint256)',
				'function approve(address spender, uint256 value) public override returns (bool)',
				'function transferFrom(address sender, address recipient, uint256 amount) public override returns (bool)',
				'function _transfer(address sender, address recipient, uint256 amount) internal',
				'function _approve(address tokenOwner, address spender, uint256 value) internal',
				'function buyTokens() public payable',
				'function myBalance() public view returns (uint balance)',
				'function tokensLeft() public view returns(uint256)',
				'function propertyDetails() public view returns(string memory, string memory, uint256, uint256, uint256)'
			]
		}
		const propertyTokenInstance = new ethers.Contract(propertyTokenContract.address, propertyTokenContract.ABI, provider);

		const balance = await propertyTokenInstance.myBalance();
		console.log(`${userAccount}'s balance: ${balance}`)
		if(balance > 0) {
			// finally we get data from each token
			// property.propertyDetails(function(error, details) {
			// 	// populate table with token details
			// 	var table = document.getElementById("investmentsTable")

			// 	var row = table.insertRow(1)
			// 	var cell0 = row.insertCell(0)
			// 	var cell1 = row.insertCell(1)
			// 	var cell2 = row.insertCell(2)
			// 	var cell3 = row.insertCell(3)
			// 	var cell4 = row.insertCell(4)

			// 	var parsedData = details
			// 	var name = parsedData[0]
			// 	var symbol = parsedData[1]
			// 	var totalSupply = formatNumber(parsedData[2].c[0])
			// 	var tokensBought = formatNumber(balance)
			// 	var tokensLeft = formatNumber(parsedData[4].c[0])
				
			// 	cell0.innerHTML = name + ' (' + symbol + ')'
			// 	cell1.innerHTML = totalSupply
			// 	cell2.innerHTML = tokensBought
			// 	cell3.innerHTML = tokensLeft
			// 	// cell4.innerHTML = "<a href=\"https://kovan.etherscan.io/token/" + address + "\" target=\"_blank\">" + address + "</a>"
			// 	cell4.innerHTML = "<a href=\"https://ropsten.etherscan.io/token/" + address + "\" target=\"_blank\">" + address + "</a>&nbsp;&nbsp;<i class=\"fas fa-external-link-alt\"></i>"
			// })
		}
	}
}

function formatNumber(number) {
    return number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

loadAccountAndBalance();
loadPropertyTokens();

/**
 * Detects if account was changed on MetaMask and updates users's portfolio
 */
 window.ethereum.on('accountsChanged', async () => {
	var node = document.getElementById("tableBody");
	while(node.hasChildNodes()) {
		node.removeChild(node.lastChild);
	}
	
	await loadPropertyTokens();
});