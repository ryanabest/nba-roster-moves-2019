const fs = require('fs');
let allTransactions = [];
let allRosters = [];

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

fs.readdir('data/OpeningDayRosters/', function(err,files) {
  files.forEach(function(file,index) {
    // console.log(file);
    let roster = JSON.parse(fs.readFileSync('data/OpeningDayRosters/'+file, 'utf-8'));
    allRosters.push(roster[0]);
  });
});

setTimeout(function() {
  // console.log(allTransactions);
  fs.writeFileSync('data/AllRosters/AllRosters.json',JSON.stringify(allRosters));
},5000);
