// var account = web3.toChecksumAddress(web3.eth.accounts[0])

// Factory Contract
const factoryContract = {
	address: "0x62C58DA52c86c6Fc5722F1893960eaB9C28d3b5A", // Ropsten
	ABI: [
		'function createProperty(string memory _symbol, string memory _name, uint256 _supplyOfTokens, address payable _owner) public returns (address)',
		'function totalTokens() public view returns(uint256)'
	]
}
const factoryInstance = new ethers.Contract(factoryContract.address, factoryContract.ABI, provider);

// Property Contract ABI
// var propertyTokenABI = web3.eth.contract()

// addresses of the tokens
var tokens = []

// get tokens addresses
function getAddresses() {
    // first we get number of tokens created
    factory.totalTokens(function(error, number) {
        // now we show the addresses
        for(var i = 0; i < number; i++) {
            factory.tokens(i, function(error, address) {
                var propertyTokenAddress = address
                var property = propertyTokenABI.at(propertyTokenAddress)
                // finally we get data from each token
                property.name(function(error, name) {
                    console.log(address + ':\n' + name)
                })
            })
        }
    })
}

getAddresses()