// A Web3Provider wraps a standard Web3 provider, which is
// what Metamask injects as window.ethereum into each page
(async () => {
    await window.ethereum.enable();
})();

var account = document.getElementById('accountAddress').innerHTML;
var balance = document.getElementById('accountBalance').innerHTML;
console.log('[createProperty.js] account:', account);
console.log('[createProperty.js] balance:', balance);

// Factory Contract
const FACTORY_CONTRACT_ADDRESS = "0x62C58DA52c86c6Fc5722F1893960eaB9C28d3b5A"; // ropsten
const factoryABI = [
	'function createProperty(string memory _symbol, string memory _name, uint256 _supplyOfTokens, address payable _owner) public returns (address)',
	'function totalTokens() public view returns(uint256)'
];
const factoryInstance = new ethers.Contract(FACTORY_CONTRACT_ADDRESS, factoryABI, provider);

const getTotalTokens = async () => {
	try {
		const total = await factoryInstance.totalTokens();
		console.log('[createProperty] # of tokens created:', total.toString());
		return total;
	} catch (error) {
		console.log('Error reading from contract:', error);
	}
}

getTotalTokens();

function createProperty() {
    var symbol = $('#_tokenSymbol').val()
    var name = $('#_propertyName').val()
	var supply = $('#_propertyPrice').val()
	// var supply = $('#_totalSupply').val()
	// var priceEth = $('#_ethPrice').val()

	var address = $('#_propertyAddress').val()
	var description = $('#_propertyDescription').val()
	var image = $('#imageInput').val()

	var isDataValid = validateFields(symbol, name, supply, address, description, image)

	if(isDataValid) {
		// createToken(symbol, name, supply, priceEth, account);
		createToken(symbol, name, supply, account);
	} else {
		return
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

// watch for contract events since last block
// what we want here is the next event emitted, which is the contract creation
// factory.allEvents({
//     fromBlock: latest
// }, (error, event) => {
//     if (true) {
// 		console.log(event.args._contract);
// 		window.alert('Token created!')
// 		window.location = "/properties";
//     }
// });