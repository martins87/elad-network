// A Web3Provider wraps a standard Web3 provider, which is
// what Metamask injects as window.ethereum into each page
(async () => {
    await window.ethereum.enable();
})();

const provider = new ethers.providers.Web3Provider(window.ethereum);
// const signer = provider.getSigner();
// console.log('signer:', signer);