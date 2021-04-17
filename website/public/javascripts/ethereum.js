// A Web3Provider wraps a standard Web3 provider, which is
// what Metamask injects as window.ethereum into each page
(async () => {
    await window.ethereum.enable();
})();

const provider = new ethers.providers.Web3Provider(window.ethereum);
// const signer = provider.getSigner();
// console.log('signer:', signer);

const loadAccountAndBalance = () => {
    provider.listAccounts().then(accounts => {
        $('#accountAddress').text(accounts[0]);
    
        if (!window.userAccount) {
            window.userAccount = accounts[0];
        }
    
        var userAccount = document.getElementById('accountAddress').innerText || window.account;
    
        provider.getBalance(userAccount).then(balance => {
            var userBalance = +ethers.utils.formatEther(balance);
    
            if (!window.userBalance) {
                window.userBalance = userBalance;
            }
            
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