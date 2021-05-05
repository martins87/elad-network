// A Web3Provider wraps a standard Web3 provider, which is
// what Metamask injects as window.ethereum into each page
(async () => {
    await window.ethereum.enable();
})();

var userAccount = '';
var userBalance = 0;
var provider = new ethers.providers.Web3Provider(window.ethereum);

// Factory Contract
const factoryContract = {
	address: "0xD853DE197Dde468613e425cB3689269994B78426", // Ropsten
	ABI: [
		'function createProperty(string memory _symbol, string memory _name, uint256 _supplyOfTokens, address payable _owner) public returns (address)',
		'function totalTokens() public view returns(uint256)',
		'function getTokenAddress(uint8 index) public view returns (address)'
	]
}
const factoryInstance = new ethers.Contract(factoryContract.address, factoryContract.ABI, provider);

const loadAccount = async () => {
    provider.listAccounts().then(accounts => {
		console.log('accounts:', accounts);
        userAccount = accounts[0];
		
        provider.getBalance(userAccount).then(balance => {
			userBalance = +ethers.utils.formatEther(balance);
        });
    
        return;
    });
}

const loadPropertyData = async () => {
	var propertyName = document.getElementById('nome').innerHTML;

	// first we get number of tokens created
    const totalTokens = await factoryInstance.totalTokens();

	// now we get tokens addresses
	for(let i = 0; i < totalTokens; i++) {
		let address = await factoryInstance.getTokenAddress(i);
		console.log(`Token ${i} address:`, address);

		// Property Token Contract
		var propertyTokenContract = {
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
				'function myBalance() public view returns (uint256)',
				'function tokensLeft() public view returns(uint256)',
				'function propertyDetails() public view returns(string memory, string memory, uint256, uint256, uint256, address)',
				'function getOwner() public view returns (address)'
			]
		}
		var propertyTokenInstance = new ethers.Contract(propertyTokenContract.address, propertyTokenContract.ABI, provider);

		// finally we get data from each token
		const tokenDetails = await propertyTokenInstance.propertyDetails();
		[tokenName, tokenSymbol, totalSupply, tokensBought, tokensLeft, propertyOwner] = tokenDetails;
		console.log('token name:', tokenName);

		if(propertyName == tokenName) {
			console.log('BINGO!');

			$('#totalSupply_1').text(totalSupply);
			$('#totalSupply_2').text(totalSupply);
		
			$('#tokensLeft_1').text(tokensLeft);
			$('#tokensLeft_2').text(tokensLeft);

			const userTokenBalance = await propertyTokenInstance.balanceOf(userAccount);
			$('#myBalance_1').text(userTokenBalance);
			$('#myBalance_2').text(userTokenBalance);

			break;
		}
	}
}

loadAccount();
loadPropertyData();

/**
 * Detects if account was changed on MetaMask and updates property's info
 */
window.ethereum.on('accountsChanged', async () => {
	loadAccount();
	loadPropertyData();
})

function buyTokens() {
	var propertyName = document.getElementById('nome').innerHTML

	// first we get number of tokens created
    factory.totalTokens(function(error, number) {

        // now we get tokens addresses
        for(var i = 0; i < number; i++) {
            factory.tokens(i, function(error, address) {

				// instance of target token
                var targetTokenAddress = address
				var targetToken = propertyTokenABI.at(targetTokenAddress)

				targetToken.name(function(error, name) {
					if(propertyName == name) {
						var ethAmount = Number( $('#ethAmount').val() )

						if(ethAmount + 0.001 <= Number(accountBalance)) {
							let txObject = {
								'value' : web3.toWei(ethAmount, 'ether')
							}
	
							// call function buyTokens() from contract
							targetToken.buyTokens.sendTransaction(txObject, function(error, result){
								if(error) {
									console.log(error)
								} else {
									alert('Your token purchase transaction has been broadcasted.\ntx hash: ' + result)
								}
							})
						} else {
							alert('Insufficient funds')
						}

					}
				})
            })
        }
    })
}

function formatNumber(number) {
    return number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}