// A Web3Provider wraps a standard Web3 provider, which is
// what Metamask injects as window.ethereum into each page
(async () => {
    await window.ethereum.enable();
})();

// Provider from Metamask
const provider = new ethers.providers.Web3Provider(window.ethereum);

// Factory Contract
const factoryContract = {
	address: "0x1d24d62bf046bcb28fa6d0a2ed82b48529034d19", // Ropsten
	ABI: [
		'function createProperty(string memory _symbol, string memory _name, uint256 _supplyOfTokens, address payable _owner) public returns (address)',
		'function totalTokens() public view returns(uint256)',
		'function getTokenAddress(uint8 index) public view returns (address)'
	]
}
const factoryInstance = new ethers.Contract(factoryContract.address, factoryContract.ABI, provider);

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

const createProperty = async (symbol, tokenName, supply, owner) => {
	try {
		const signer = provider.getSigner();
		const writeInstance = new ethers.Contract(FACTORY_CONTRACT_ADDRESS, factoryABI, signer);
		const txResponse = await writeInstance.createProperty(symbol, tokenName, supply, owner);
		const txReceipt = await txResponse.wait();
		console.log('Receipt:', txReceipt);
	} catch (error) {
		console.log('Error writing to contract:', error);
	}
}

const symbol = 'DAN';
const tokenName = 'Daniel Token';
const supply = '4101987';
const owner = '0x937e85Dd15E69d17796C6C4B07f5d76e46d144Ba';

// createProperty(symbol, tokenName, supply, owner);
