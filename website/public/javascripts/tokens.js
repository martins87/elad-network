// A Web3Provider wraps a standard Web3 provider, which is
// what Metamask injects as window.ethereum into each page
(async () => {
    await window.ethereum.enable();
})();

var account = document.getElementById('accountAddress').innerHTML;
console.log('[createProperty.js] account:', account);

// Factory Contract
const FACTORY_CONTRACT_ADDRESS = "0x62C58DA52c86c6Fc5722F1893960eaB9C28d3b5A"; // ropsten
const factoryABI = [
	'function createProperty(string memory _symbol, string memory _name, uint256 _supplyOfTokens, address payable _owner) public returns (address)',
	'function totalTokens() public view returns(uint256)'
];
const factoryInstance = new ethers.Contract(FACTORY_CONTRACT_ADDRESS, factoryABI, provider);

// Property Contract ABI
// var propertyTokenABI = web3.eth.contract([
// 	{
// 		"constant": true,
// 		"inputs": [],
// 		"name": "propertyDetails",
// 		"outputs": [
// 			{
// 				"name": "",
// 				"type": "string"
// 			},
// 			{
// 				"name": "",
// 				"type": "string"
// 			},
// 			{
// 				"name": "",
// 				"type": "uint256"
// 			},
// 			{
// 				"name": "",
// 				"type": "uint256"
// 			},
// 			{
// 				"name": "",
// 				"type": "uint256"
// 			}
// 		],
// 		"payable": false,
// 		"stateMutability": "view",
// 		"type": "function"
// 	},
// 	{
// 		"constant": true,
// 		"inputs": [],
// 		"name": "name",
// 		"outputs": [
// 			{
// 				"name": "",
// 				"type": "string"
// 			}
// 		],
// 		"payable": false,
// 		"stateMutability": "view",
// 		"type": "function"
// 	},
// 	{
// 		"constant": false,
// 		"inputs": [
// 			{
// 				"name": "spender",
// 				"type": "address"
// 			},
// 			{
// 				"name": "value",
// 				"type": "uint256"
// 			}
// 		],
// 		"name": "approve",
// 		"outputs": [
// 			{
// 				"name": "",
// 				"type": "bool"
// 			}
// 		],
// 		"payable": false,
// 		"stateMutability": "nonpayable",
// 		"type": "function"
// 	},
// 	{
// 		"constant": true,
// 		"inputs": [],
// 		"name": "totalSupply",
// 		"outputs": [
// 			{
// 				"name": "",
// 				"type": "uint256"
// 			}
// 		],
// 		"payable": false,
// 		"stateMutability": "view",
// 		"type": "function"
// 	},
// 	{
// 		"constant": false,
// 		"inputs": [
// 			{
// 				"name": "sender",
// 				"type": "address"
// 			},
// 			{
// 				"name": "recipient",
// 				"type": "address"
// 			},
// 			{
// 				"name": "amount",
// 				"type": "uint256"
// 			}
// 		],
// 		"name": "transferFrom",
// 		"outputs": [
// 			{
// 				"name": "",
// 				"type": "bool"
// 			}
// 		],
// 		"payable": false,
// 		"stateMutability": "nonpayable",
// 		"type": "function"
// 	},
// 	{
// 		"constant": true,
// 		"inputs": [],
// 		"name": "decimals",
// 		"outputs": [
// 			{
// 				"name": "",
// 				"type": "uint8"
// 			}
// 		],
// 		"payable": false,
// 		"stateMutability": "view",
// 		"type": "function"
// 	},
// 	{
// 		"constant": true,
// 		"inputs": [
// 			{
// 				"name": "account",
// 				"type": "address"
// 			}
// 		],
// 		"name": "balanceOf",
// 		"outputs": [
// 			{
// 				"name": "",
// 				"type": "uint256"
// 			}
// 		],
// 		"payable": false,
// 		"stateMutability": "view",
// 		"type": "function"
// 	},
// 	{
// 		"constant": true,
// 		"inputs": [],
// 		"name": "tokensBought",
// 		"outputs": [
// 			{
// 				"name": "",
// 				"type": "uint256"
// 			}
// 		],
// 		"payable": false,
// 		"stateMutability": "view",
// 		"type": "function"
// 	},
// 	{
// 		"constant": true,
// 		"inputs": [],
// 		"name": "owner",
// 		"outputs": [
// 			{
// 				"name": "",
// 				"type": "address"
// 			}
// 		],
// 		"payable": false,
// 		"stateMutability": "view",
// 		"type": "function"
// 	},
// 	{
// 		"constant": true,
// 		"inputs": [],
// 		"name": "symbol",
// 		"outputs": [
// 			{
// 				"name": "",
// 				"type": "string"
// 			}
// 		],
// 		"payable": false,
// 		"stateMutability": "view",
// 		"type": "function"
// 	},
// 	{
// 		"constant": false,
// 		"inputs": [
// 			{
// 				"name": "recipient",
// 				"type": "address"
// 			},
// 			{
// 				"name": "amount",
// 				"type": "uint256"
// 			}
// 		],
// 		"name": "transfer",
// 		"outputs": [
// 			{
// 				"name": "",
// 				"type": "bool"
// 			}
// 		],
// 		"payable": false,
// 		"stateMutability": "nonpayable",
// 		"type": "function"
// 	},
// 	{
// 		"constant": true,
// 		"inputs": [],
// 		"name": "tokensLeft",
// 		"outputs": [
// 			{
// 				"name": "",
// 				"type": "uint256"
// 			}
// 		],
// 		"payable": false,
// 		"stateMutability": "view",
// 		"type": "function"
// 	},
// 	{
// 		"constant": true,
// 		"inputs": [],
// 		"name": "myBalance",
// 		"outputs": [
// 			{
// 				"name": "",
// 				"type": "uint256"
// 			}
// 		],
// 		"payable": false,
// 		"stateMutability": "view",
// 		"type": "function"
// 	},
// 	{
// 		"constant": false,
// 		"inputs": [],
// 		"name": "buyTokens",
// 		"outputs": [],
// 		"payable": true,
// 		"stateMutability": "payable",
// 		"type": "function"
// 	},
// 	{
// 		"constant": true,
// 		"inputs": [
// 			{
// 				"name": "tokenOwner",
// 				"type": "address"
// 			},
// 			{
// 				"name": "spender",
// 				"type": "address"
// 			}
// 		],
// 		"name": "allowance",
// 		"outputs": [
// 			{
// 				"name": "",
// 				"type": "uint256"
// 			}
// 		],
// 		"payable": false,
// 		"stateMutability": "view",
// 		"type": "function"
// 	},
// 	{
// 		"inputs": [
// 			{
// 				"name": "_symbol",
// 				"type": "string"
// 			},
// 			{
// 				"name": "_name",
// 				"type": "string"
// 			},
// 			{
// 				"name": "_initialSupply",
// 				"type": "uint256"
// 			},
// 			{
// 				"name": "_owner",
// 				"type": "address"
// 			}
// 		],
// 		"payable": false,
// 		"stateMutability": "nonpayable",
// 		"type": "constructor"
// 	},
// 	{
// 		"payable": true,
// 		"stateMutability": "payable",
// 		"type": "fallback"
// 	},
// 	{
// 		"anonymous": false,
// 		"inputs": [
// 			{
// 				"indexed": true,
// 				"name": "from",
// 				"type": "address"
// 			},
// 			{
// 				"indexed": true,
// 				"name": "to",
// 				"type": "address"
// 			},
// 			{
// 				"indexed": false,
// 				"name": "value",
// 				"type": "uint256"
// 			}
// 		],
// 		"name": "Transfer",
// 		"type": "event"
// 	},
// 	{
// 		"anonymous": false,
// 		"inputs": [
// 			{
// 				"indexed": true,
// 				"name": "owner",
// 				"type": "address"
// 			},
// 			{
// 				"indexed": true,
// 				"name": "spender",
// 				"type": "address"
// 			},
// 			{
// 				"indexed": false,
// 				"name": "value",
// 				"type": "uint256"
// 			}
// 		],
// 		"name": "Approval",
// 		"type": "event"
// 	}
// ])

// addresses of the tokens
var tokens = []

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
				
                // finally we get data from each token
                property.propertyDetails(function(error, details) {

					// populate table with token details
					var table = document.getElementById("tokensTable")
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
					var tokensBought = formatNumber(parsedData[3].c[0])
					var tokensLeft = formatNumber(parsedData[4].c[0])
					
					cell0.innerHTML = name + ' (' + symbol + ')'
					cell1.innerHTML = totalSupply
					cell2.innerHTML = tokensBought
					cell3.innerHTML = tokensLeft
					// cell4.innerHTML = "<a href=\"https://kovan.etherscan.io/token/" + address + "\" target=\"_blank\">" + address + "</a>"
					cell4.innerHTML = "<a href=\"https://ropsten.etherscan.io/token/" + address + "\" target=\"_blank\">" + address + "</a>&nbsp;&nbsp;<i class=\"fas fa-external-link-alt\"></i>"
                })
            })
        }
    })
}

function formatNumber(number) {
    return number.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

loadPropertyTokens()