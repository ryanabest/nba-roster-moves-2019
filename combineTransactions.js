const fs = require('fs');
let allTransactions = []

fs.readdir('data/Transactions/', function(err,files) {
  files.forEach(function(file,index) {
    // console.log(file);
    let transaction = JSON.parse(fs.readFileSync('data/Transactions/'+file, 'utf-8'));
    allTransactions.push(transaction[0]);
  });
});

setTimeout(function() {
  // console.log(allTransactions);
  fs.writeFileSync('data/AllTransactions/AllTransactions.json',JSON.stringify(allTransactions));
},5000);
