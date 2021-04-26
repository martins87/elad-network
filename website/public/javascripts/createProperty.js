// A Web3Provider wraps a standard Web3 provider, which is
// what Metamask injects as window.ethereum into each page
(async () => {
    await window.ethereum.enable();
})();

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

console.log('[createProperty.js] account:', userAccount);
console.log('[createProperty.js] balance:', userBalance);

// Factory Contract
const factoryContract = {
	address: "0x62C58DA52c86c6Fc5722F1893960eaB9C28d3b5A", // Ropsten
	ABI: [
		'function createProperty(string memory _symbol, string memory _name, uint256 _supplyOfTokens, address payable _owner) public returns (address)',
		'function totalTokens() public view returns(uint256)'
	]
}
const factoryInstance = new ethers.Contract(factoryContract.address, factoryContract.ABI, provider);

function create() {
    var symbol = $('#_tokenSymbol').val()
    var name = $('#_propertyName').val()
	// var price = $('#_propertyPrice').val()
	var supply = $('#_totalSupply').val();
	var owner = account;
	// var priceEth = $('#_ethPrice').val()

	var address = $('#_propertyAddress').val()
	var description = $('#_propertyDescription').val()
	var image = $('#imageInput').val()

	console.log('Symbol:', symbol);
	console.log('Name:', name);
	console.log('Supply:', supply);
	console.log('Owner:', owner);

	return;

	var isDataValid = validateFields(symbol, name, supply, address, description, image)

	if(isDataValid) {
		// createToken(symbol, name, supply, priceEth, account);
		createToken(symbol, name, supply, account);
	} else {
		return
	}
}

const createProperty = async (symbol, tokenName, supply, owner) => {
	try {
		const signer = new ethers.providers.Web3Provider(window.ethereum).getSigner();
		const writeInstance = new ethers.Contract(FACTORY_CONTRACT_ADDRESS, factoryABI, signer);
		const txResponse = await writeInstance.createProperty(symbol, tokenName, supply, owner);
		const txReceipt = await txResponse.wait();
		console.log('Receipt:', txReceipt);
	} catch (error) {
		console.log('Error writing to contract:', error);
	}
}

function validateFields(symbol, name, supply, address, description, image) {
	if(name.length == 0) {
		alert('Please provide a value for the field Property Name')
		return false
	}
	if(supply.length == 0) {
		alert('Please provide a value for the field Property Price')
		return false
	}
	if(!/^\d+$/.test(supply)) {
		alert('Property Price is not valid: ' + supply)
		return false
	}
	if(address.length == 0) {
		alert('Please provide a value for the field Property Address')
		return false
	}
	if(symbol.length == 0) {
		alert('Please provide a value for the field Property Token Symbol')
		return false
	}
	if(description.length == 0) {
		alert('Please provide a value for the field Property Description')
		return false
	}
	if(image.length == 0) {
		alert('Please provide a value for the field Property Image')
		return false
	}
	return true
}

// function createToken(symbol, name, supply, priceEth, owner) {
function createToken(symbol, name, supply, owner) {
    // var tx = factory.createProperty(symbol, name, supply, priceEth, owner, {
	var tx = factory.createProperty(symbol, name, supply, owner, {
        from: account,
        to: factoryAddress,
        data: ""
    }, function (error, txHash) {
		if (error) {
			console.log('There was an error creating the token')
			console.log(error)
		} else {
			console.log('tx hash:')
			console.log(txHash);
			// alert("Property being created, please wait to be redirected. This process can take up to a few minutes.");
		}
    })
}
