// A Web3Provider wraps a standard Web3 provider, which is
// what Metamask injects as window.ethereum into each page
(async () => {
    await window.ethereum.enable();
})();

// Provider from Metamask
// const provider = new ethers.providers.Web3Provider(window.ethereum);
// Provider from Ropsten
const provider = new ethers.getDefaultProvider('ropsten');

// const provider = new ethers.getDefaultProvider('ropsten');
const FACTORY_CONTRACT_ADDRESS = "0x62C58DA52c86c6Fc5722F1893960eaB9C28d3b5A"; // ropsten
const factoryABI = [
	'function createProperty(string memory _symbol, string memory _name, uint256 _supplyOfTokens, address payable _owner) public returns (address)',
	'function totalTokens() public view returns(uint256)'
];
const factoryInstance = new ethers.Contract(FACTORY_CONTRACT_ADDRESS, factoryABI, provider);

const getTotalTokens = async () => {
	try {
		const total = await factoryInstance.totalTokens();
		console.log('[metamask] # of tokens created:', total.toString());
		return total;
	} catch (error) {
		console.log('Error reading from contract:', error);
	}
}

getTotalTokens();
