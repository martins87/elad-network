// A Web3Provider wraps a standard Web3 provider, which is
// what Metamask injects as window.ethereum into each page
(async () => {
    await window.ethereum.enable();
})();

var userAccount = '';
var userBalance = 0;
var tokenAddress = '';
var provider = new ethers.providers.Web3Provider(window.ethereum);
var signer = new ethers.providers.Web3Provider(window.ethereum).getSigner();

// Factory Contract
const factoryContract = {
	address: "0xC4C72feac3A285aCca89DbAc16e33ACe0afDBE48", // Ropsten
	ABI: [
		'function createProperty(string memory _symbol, string memory _name, uint256 _supplyOfTokens, address payable _owner) public returns (address)',
		'function totalTokens() public view returns(uint256)',
		'function getTokenAddress(uint8 index) public view returns (address)'
	]
}
const factoryInstance = new ethers.Contract(factoryContract.address, factoryContract.ABI, provider);

// Property Token Contract
const propertyTokenContract = {
	address: '',
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
		'function getAuction(address addr, uint index) public view returns(Price)',
		'function getOwnerTokensOnAuction(address addr) public view returns(uint256)',
		'function buyTokens() public payable',
		'function buyFromAuction(address tokenOwner, uint index, uint256 amount) public payable',
		'function myBalance() public view returns (uint256)',
		'function tokensLeft() public view returns(uint256)',
		'function propertyDetails() public view returns(string memory, string memory, uint256, uint256, uint256, address)',
		'function getOwner() public view returns (address)',
		'function getTotalAuctionOwners() public view returns (uint)'
	]
}
var propertyTokenInstance = null;


const loadAccount = async () => {
    provider.listAccounts().then(accounts => {
        userAccount = accounts[0];
		
        provider.getBalance(userAccount).then(balance => {
			userBalance = +ethers.utils.formatEther(balance);
			$('#ethBalance').text(userBalance);
			console.log('Balance before formatting:', balance);
			console.log('Balance formatted:', userBalance);
			console.log('To Wei:', ethers.utils.parseEther('' + userBalance));
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

		// Property Token Contract
		propertyTokenContract.address = address;
		propertyTokenInstance = new ethers.Contract(propertyTokenContract.address, propertyTokenContract.ABI, provider);

		// finally we get data from each token
		const tokenDetails = await propertyTokenInstance.propertyDetails();
		[tokenName, tokenSymbol, totalSupply, tokensBought, tokensLeft, propertyOwner] = tokenDetails;

		if(propertyName == tokenName) {
			console.log(`Token ${tokenSymbol} found!`);
			tokenAddress = address;

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

const buyTokens = async () => {
	propertyTokenInstance.address = tokenAddress;
	// propertyTokenInstance = new ethers.Contract(propertyTokenContract.address, propertyTokenContract.ABI, provider);
	propertyTokenInstance = new ethers.Contract(propertyTokenContract.address, propertyTokenContract.ABI, signer);
	
	var ethAmount = Number($('#ethAmount').val());
	console.log('ethAmount:', ethAmount);
	console.log('User balance:', userBalance);

	// 1) Compra de tokens funcionar
	// 2) Não ter mais tokens disponíveis
	// 3) Usuário não ter fundos
	if(ethAmount + 0.001 <= Number(userBalance)) {
		let txObject = {
			value: ethers.utils.parseEther("" + ethAmount)
		};

		// call function buyTokens() from contract
		var tx = await propertyTokenInstance.buyTokens(txObject);
		console.log('Response:', tx);
		// targetToken.buyTokens.sendTransaction(txObject, function(error, result){
		// 	if(error) {
		// 		console.log(error)
		// 	} else {
		// 		alert('Your token purchase transaction has been broadcasted.\ntx hash: ' + result)
		// 	}
		// })
		alert('ryco');
	} else {
		alert('Insufficient funds');
	}
}

function formatNumber(number) {
    return number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

/**
 * Detects if account was changed on MetaMask and updates property's info
 */
 window.ethereum.on('accountsChanged', async () => {
	loadAccount();
	loadPropertyData();
});
