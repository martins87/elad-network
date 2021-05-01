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
	address: "0x62C58DA52c86c6Fc5722F1893960eaB9C28d3b5A", // Ropsten
	ABI: [
		'function createProperty(string memory _symbol, string memory _name, uint256 _supplyOfTokens, address payable _owner) public returns (address)',
		'function totalTokens() public view returns(uint256)'
	]
}
const factoryInstance = new ethers.Contract(factoryContract.address, factoryContract.ABI, provider);

var userAccount;
var userBalance;

(() => {
    provider.listAccounts().then(accounts => {
        userAccount = accounts[0];
		console.log('[createProperty.js] account:', userAccount);
    
        provider.getBalance(userAccount).then(balance => {
            userBalance = +ethers.utils.formatEther(balance);
			console.log('[createProperty.js] balance:', userBalance);
        });
    });
})();

const createToken = async () => {
	var propertyName = $('#_propertyName').val();
	var propertyPrice = $('#_propertyPrice').val();
	var propertyAddress = $('#_propertyAddress').val();
	var tokenSymbol = $('#_tokenSymbol').val();
	var tokenTotalSupply = $('#_totalSupply').val();
	var propertyDescription = $('#_propertyDescription').val();
	var owner = '0x1B40648125c6f35fb13618BD275770D11911E0a8';
	// var tokenPrice = Math.floor(propertyPrice/tokenTotalSupply);
	var image = $('#imageInput').val();

	var isDataValid = validateFields(tokenSymbol, propertyName, propertyPrice, tokenTotalSupply, propertyAddress, propertyDescription, image);

	if(isDataValid) {
		try {
			createProperty(tokenSymbol, propertyName, tokenTotalSupply, owner);
		} catch (error) {
			console.log('Error calling contract function createProperty:', error);
			return;
		}
	} else {
		return;
	}
}

const validateFields = (symbol, name, price, supply, address, description, image) => {
	if(name.length == 0) {
		alert('Please provide a value for the field Property Name.');
		return false;
	}
	if(price.length == 0) {
		alert('Please provide a value for the field Price.');
		return false;
	}
	if(address.length == 0) {
		alert('Please provide a value for the field Address.');
		return false;
	}
	if(symbol.length == 0) {
		alert('Please provide a value for the field Token Symbol.');
		return false;
	}
	if(supply.length == 0) {
		alert('Please provide a value for the field Token Total Supply.');
		return false;
	}
	if(!/^\d+$/.test(supply)) {
		alert('Property Price is not valid: ' + supply + '.');
		return false;
	}
	if(description.length == 0) {
		alert('Please provide a value for the field Property Description.');
		return false;
	}
	if(image.length == 0) {
		alert('Please select an image to upload.');
		return false;
	}
	return true;
}

const createProperty = async (symbol, tokenName, supply, owner) => {
	console.log('symbol:', symbol);
	console.log('tokenName:', tokenName);
	console.log('supply:', supply);
	console.log('owner:', owner);
	try {
		const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner();
		const writeInstance = new ethers.Contract(factoryContract.address, factoryContract.ABI, signer);
		const txResponse = await writeInstance.createProperty(symbol, tokenName, supply, owner);
		console.log('txResponse:', txResponse);
		alert(`Contract being created. Transaction hash: ${txResponse.hash}`);
		const txReceipt = await txResponse.wait();
		console.log('txReceipt:', txReceipt);
		alert(`Property token created. Please check last transaction of contract ${txReceipt.to}`);
		// return txReceipt;
	} catch (error) {
		console.log('Error writing to contract:', error);
		return null;
	}
}
