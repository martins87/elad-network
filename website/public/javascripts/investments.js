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

// Property Contract ABI
// var propertyTokenABI = web3.eth.contract()

/**
 * Detects if account was changed on MetaMask and updates users's portfolio
 */
// window.ethereum.on('accountsChanged', function(accounts) {
// 	account = web3.toChecksumAddress(accounts[0])

// 	var node = document.getElementById("tableBody");
// 	while(node.hasChildNodes()) {
// 		node.removeChild(node.lastChild);
// 	}
	
// 	loadPropertyTokens()
// })

// get tokens addresses
function loadPropertyTokens() {
    // first we get number of tokens created
    factory.totalTokens(function(error, number) {

        // now we get tokens addresses
        for(var i = 0; i < number; i++) {
            factory.tokens(i, function(error, address) {

				// instance of each token
                var propertyTokenAddress = address
				var property = propertyTokenABI.at(propertyTokenAddress)

				property.myBalance(function(error, balance) {
					if(balance > 0) {
						// finally we get data from each token
						property.propertyDetails(function(error, details) {
							// populate table with token details
							var table = document.getElementById("investmentsTable")

							var row = table.insertRow(1)
							var cell0 = row.insertCell(0)
							var cell1 = row.insertCell(1)
							var cell2 = row.insertCell(2)
							var cell3 = row.insertCell(3)
							var cell4 = row.insertCell(4)
		
							var parsedData = details
							var name = parsedData[0]
							var symbol = parsedData[1]
							var totalSupply = formatNumber(parsedData[2].c[0])
							var tokensBought = formatNumber(balance)
							var tokensLeft = formatNumber(parsedData[4].c[0])
							
							cell0.innerHTML = name + ' (' + symbol + ')'
							cell1.innerHTML = totalSupply
							cell2.innerHTML = tokensBought
							cell3.innerHTML = tokensLeft
							// cell4.innerHTML = "<a href=\"https://kovan.etherscan.io/token/" + address + "\" target=\"_blank\">" + address + "</a>"
							cell4.innerHTML = "<a href=\"https://ropsten.etherscan.io/token/" + address + "\" target=\"_blank\">" + address + "</a>&nbsp;&nbsp;<i class=\"fas fa-external-link-alt\"></i>"
						})
					}
				})
				
            })
        }
    })
}

function formatNumber(number) {
    return number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

loadPropertyTokens()