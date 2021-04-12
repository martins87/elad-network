// A Web3Provider wraps a standard Web3 provider, which is
// what Metamask injects as window.ethereum into each page
(async () => {
    await window.ethereum.enable();
})();

const provider = new ethers.providers.Web3Provider(window.ethereum);
// const signer = provider.getSigner();
// console.log('signer:', signer);

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

// var accountAddress = web3.toChecksumAddress(web3.eth.accounts[0])
// var accountBalance

// function setAccountDetais(address) {
//     $('#accountAddress').text(address)

//     // get account balance in Ether
//     web3.eth.getBalance(address, function (error, res) {
//         if (error) {
//             console.log(error)
//         } else {
//             accountBalance = web3.fromWei(res, 'ether')
//             $('#accountBalance').text(accountBalance.toFixed(4) + ' ETH')
//         }
//     })
// }

// setAccountDetais(accountAddress)

/**
 * Detects if account was changed on MetaMask and updates user's account info
 * https://ethereum.stackexchange.com/questions/42768/how-can-i-detect-change-in-account-in-metamask
 */
// window.ethereum.on('accountsChanged', function (accounts) {
//     setAccountDetais(accounts[0])
// })

/**
 * This also works, but it's inefficient
 */
// setInterval(function() {
//     var account = web3.toChecksumAddress(web3.eth.accounts[0])
//     if(account !== accountAddress) {
//         setAccountDetais(account)
//     }
// }, 100)
