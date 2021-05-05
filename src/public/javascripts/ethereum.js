// A Web3Provider wraps a standard Web3 provider, which is
// what Metamask injects as window.ethereum into each page
(async () => {
    await window.ethereum.enable();
})();

var userAccount = '';
var userBalance = 0;
var provider = new ethers.providers.Web3Provider(window.ethereum);

const loadAccountAndBalance = () => {
    provider.listAccounts().then(accounts => {
        userAccount = accounts[0];
        $('#accountAddress').text(userAccount);
        
        provider.getBalance(userAccount).then(balance => {
            userBalance = +ethers.utils.formatEther(balance);
            $('#accountBalance').text(userBalance.toFixed(4) + ' ETH');
        });
    
        return;
    });
}

loadAccountAndBalance();

/**
 * Detects if account was changed on MetaMask and updates user's account info
 * https://ethereum.stackexchange.com/questions/42768/how-can-i-detect-change-in-account-in-metamask
 */
window.ethereum.on('accountsChanged', loadAccountAndBalance);