// var account = web3.toChecksumAddress(web3.eth.accounts[0])

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