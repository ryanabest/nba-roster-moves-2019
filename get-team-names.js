const request = require('request');
const fs = require('fs');
const cheerio = require('cheerio');


function getNames() {
  return new Promise(function (resolve, reject) {
    let teamNames = [];
    request.get('https://www.basketball-reference.com/leagues/NBA_2018_ratings.html', function(error, response, body) {
      if (!error && response.statusCode == 200) {
          let $ = cheerio.load(body);
          let table = $('td.left ').each(function(i,elem) {
            let teamAcr = $('a',elem).eq(0).attr('href').split('/')[2];
            teamNames.push(teamAcr)
          })
      } else {console.log("Request failed!")}
      resolve(teamNames);
    });
  })
}

let allTeams = getNames();
allTeams.then(function(result) {
  console.log(result)
}, function(err) {
  console.log(err);
})
