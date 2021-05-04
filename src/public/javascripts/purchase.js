// A Web3Provider wraps a standard Web3 provider, which is
// what Metamask injects as window.ethereum into each page
(async () => {
    await window.ethereum.enable();
})();

var account = document.getElementById('accountAddress').innerHTML;
console.log('[createProperty.js] account:', account);

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

// Property Token
var propertyTokenABI = ['']

var propertyTokenAddress

function loadPropertyData(address) {
	var propertyName = document.getElementById('nome').innerHTML

	// first we get number of tokens created
    factory.totalTokens(function(error, number) {

        // now we get tokens addresses
        for(var i = 0; i < number; i++) {
            factory.tokens(i, function(error, tokenAddress) {

				// instance of target token
				var targetToken = propertyTokenABI.at(tokenAddress)

				targetToken.name(function(error, name) {
					if(propertyName == name) {

						// do stuff here...

						targetToken.totalSupply(function(error, result) {
							let totalSupply = formatNumber(result)
							$('#totalSupply_1').text(totalSupply)
							$('#totalSupply_2').text(totalSupply)
						})
					
						targetToken.tokensLeft(function(error, result) {
							let tokensLeft = formatNumber(result)
							$('#tokensLeft_1').text(tokensLeft)
							$('#tokensLeft_2').text(tokensLeft)
						})
					
						targetToken.myBalance(function(error, result) {
							let myBalance = formatNumber(result)
							$('#myBalance_1').text(myBalance)
							$('#myBalance_2').text(myBalance)
						})
					}
				})
            })
        }
	})
	
    // get account balance in Ether
    web3.eth.getBalance(address, function(error, res) {
        if(error) {
            console.log(error)
        } else {
            let accountBalance = web3.fromWei(res, 'ether').toFixed(4) + ' ETH'
            $('#ethBalance').text(accountBalance)
        }
	})
}

loadPropertyData(accountAddress)

/**
 * Detects if account was changed on MetaMask and updates property's info
 */
window.ethereum.on('accountsChanged', function(accounts) {
    loadPropertyData(accounts[0])
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