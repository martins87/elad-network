var account;

// function setAddress() {
//     account = web3.toChecksumAddress(web3.eth.accounts[0]);
// }

// setAddress();

// var FactoryContract = web3.eth.contract();

var factoryAddress = "0x71f85c2e175df7d258bc7362d45e0f7b38513600";

var Factory = FactoryContract.at(factoryAddress);

// var TokenContract = web3.eth.contract();

var Properties = new Map();

var allProperties = [];

Factory.allUserContracts(account, (error, data) => {
    if (error) throw error;
    else {
        allProperties = data;
    }
});

setTimeout(function(){ 
    getSpecs(0, allProperties.length);
}, 1000);

function getSpecs(n, l) {
    if (n != l) {
        var Token = TokenContract.at(allProperties[n]);
        Token.propertyDetails( (err, result) => {
            if (!err) {
                Properties.set(n, result);
                getSpecs(n+1, l)
            }
        });
    }
    else {
        buildTable();
        // console.log(Properties);
    }

}

/**
 * aqui pegamos a tabela pelo id dela #propertiesTable em manage.jade
 * 4 colunas foram criadas: property name, total supply, tokens bought, market cap
 * 
 * populating table
 * https://www.w3schools.com/jsref/met_table_insertrow.asp
 */
function buildTable() {
    var table = document.getElementById("propertiesTable");
    for (var i = 0; i < Properties.size; i++) {
        var eth = 1000000000000000000;
        var row = table.insertRow(i+1);
        var cell0 = row.insertCell(0);
        var cell1 = row.insertCell(1);
        var cell2 = row.insertCell(2);
        var cell3 = row.insertCell(3);
        cell0.innerHTML = "<b><font size=\"4\"><i class=\"ni ni-building\"></i>&nbsp;&nbsp;&nbsp;" + Properties.get(i)[0] + "</b></font>";
        cell1.innerHTML = Properties.get(i)[1];
        var boughtTokens = Properties.get(i)[1] - Properties.get(i)[3];;
        cell2.innerHTML = boughtTokens;
        cell3.innerHTML = boughtTokens * Properties.get(i)[2].toNumber()/eth;

    }
}