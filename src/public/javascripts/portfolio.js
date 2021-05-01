
// INSTANTIATE CONTRACT AND ABI

var account;

// function setAddress() {
//     account = web3.toChecksumAddress(web3.eth.accounts[0]);
// }

// setAddress();

// var TrackerContract = web3.eth.contract();

// var trackerAddress = web3.toChecksumAddress("0x67586de557afdfe140c7ba450bb9ada34bd2aec7");

var Tracker = TrackerContract.at(trackerAddress);

// const latest = web3.eth.getBlockNumber();

var getEvents = true;

// Map within map
var TokenSpecs = new Map();

// web3.eth.defaultAccount = web3.eth.accounts[0];

// var TokenContract = web3.eth.contract();

var allInvestments = [];

function getAllInvestments() {
    Tracker.investmentsArrayLength(account, (error, data) => {
        if (error) throw error;
        else {
            setUp(0, data);
        }
    });
}

// getAllInvestments();

/*
function setUp(length) {
    for (var i = 0; i < length; i++) {
        Tracker.allUserInvestments(account, i, (error, data) => {
            if (error) { throw error; } else {
                //allInvestments.push(data);
                var Token = TokenContract.at(data);
                Token.userDetails(account, (err, result) => {
                    if (!err) {
                        TokenSpecs.set(i, result);
                    }
                });
            }
        });
    }
    console.log(TokenSpecs);
}
*/

function setUp(n, l) {
    if (n != l) {
        Tracker.allUserInvestments(account, n, (error, data) => {
            if (error) { throw error; } else {
                //allInvestments.push(data);
                var Token = TokenContract.at(data);
                Token.userDetails(account, (err, result) => {
                    if (!err) {
                        TokenSpecs.set(n, result);
                    }
                });
            }
        });
        setUp(n+1, l);
    }
    else {
        // console.log(TokenSpecs);
        // buildPortfolio(l);
    }
}

var totalValue = 0;
var totalPaid = 0;
var ROI = 0;
var nTokens = 0;
setTimeout(function(){ 
    var table = document.getElementById("portfolioTable");
    for (var i = 0; i < TokenSpecs.size; i++) {
        var eth = 1000000000000000000;
        var row = table.insertRow(i+1);
        var cell0 = row.insertCell(0);
        var cell1 = row.insertCell(1);
        var cell2 = row.insertCell(2);
        var cell3 = row.insertCell(3);
        var tokenInfo = TokenSpecs.get(i);
        cell0.innerHTML = tokenInfo[0];
        var numberOfTokens = tokenInfo[1].toNumber();
        cell1.innerHTML = numberOfTokens;
        cell2.innerHTML = tokenInfo[2].toNumber()/eth;
        var totalTokenValue = (tokenInfo[1].toNumber() * tokenInfo[2].toNumber())/eth;
        cell3.innerHTML = totalTokenValue;
        totalValue += totalTokenValue;
        totalPaid += tokenInfo[3].toNumber();
        nTokens += numberOfTokens;
    }
    ROI = (totalValue*eth/totalPaid)*100;
    document.getElementById('totalValue').innerHTML = totalValue;
    document.getElementById('nTokens').innerHTML = nTokens;
	document.getElementById('nProperties').innerHTML = TokenSpecs.size;
	if (isNaN(Math.round(ROI))) {
		document.getElementById('roi').innerHTML = 0 + "%";
	}
	else {
		document.getElementById('roi').innerHTML = Math.round(ROI) + "%";
	}
}, 2000);

var tokenArray = [], portfolioArray = [];

/*
function createTable() {
    var table = document.getElementById("table1");
    for (var j = 0; j < data.length; j++) {
        cell0.innerHTML = data[j][0];
        if (data[j][4] == "0x0000000000000000000000000000000000000000") {
            cell1.innerHTML = "Document is not Multi-Sig";        
        }
        else {
            cell1.innerHTML = data[j][4];
        }
        cell2.innerHTML = data[j][1];
        var date = String(new Date((data[j][2].toNumber()) * 1000));
        var finalDate = date.substr(0, 15);
        cell3.innerHTML = finalDate;
    }
    r = false;
}
*/
/*
Token.userDetails(account, (error, data) => {
    TokenSpecs.set(i, data);
});
*/

/*
setTimeout(function(){ 
        var Token; //, name, balance, price;
        for (var i = 0; i < allInvestments.length; i++) {
                Token = TokenContract.at(allInvestments[i]);
                Token.userDetails(account, (error, data) => {
                    TokenSpecs.set(i, data);
                });
        }
        console.log(TokenSpecs);


 }, 5000);

*/

/*
setTimeout(function(){ 
    //function buildPortfolio() {
        var Token; //, name, balance, price;
        for (var i = 0; i < allInvestments.length; i++) {
                Token = TokenContract.at(allInvestments[i]);
                Token.name((error, data) => {
                    tokenArray.push(data);
                });
                Token.balanceOf(account, (error, data) => {
                    tokenArray.push(data.toNumber());
                });
                Token.pricePerTokenInEther((error, data) => {
                    tokenArray.push(data.toNumber() / 1000000000000000000);
                    tokenArray.push(tokenArray[1] * tokenArray[2]);
                });
                //tokenArray = [];
                portfolioArray.push(tokenArray);

        }
        console.log(portfolioArray);
        // makeArray(portfolioArray);
    //}


 }, 5000);

*/

function makeArray(arr) {
    console.log(arr);
}

/*
Tracker.allEvents({
    fromBlock: latest
}, (error, event) => {
    if (getEvents) {
        console.log(event);
    } else { }
});
*/

/*
function createToken(symbol, name, supply, priceElad, priceEth, fallbackAddress) {
    var tx = Factory.createProperty(symbol, name, supply, priceElad, priceEth, fallbackAddress, {
        from: account,
        // gas: "3000000",
        to: factoryAddress,
        // value: checkPrice(0),
        data: ""
    }, function (err, transactionHash) {
        if (!err)
            console.log(transactionHash);
    }
    )
};
*/