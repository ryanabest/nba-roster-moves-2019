const request = require('request');
const fs = require('fs');
const cheerio = require('cheerio');

init();

function init() {
  loadTeams();
  // console.log(teams.length);
}

function loadTeams() {
  let teams = [];
  let rosterFolder = 'data/OpeningDayRosters/';

  // ONLY ONE //
  // fs.readdir('data/PHI/', function(err,files) {
  //   files.forEach(function(file,index) {
  //     setTimeout(function() {
  //       let team = new Team(file);
  //       console.log('-------------STARTING ' + file + '-------------')
  //       team.loadRoster();
  //       // console.log('-------------ENDING ' + file + '-------------');
  //     },10000 * index)
  //   })
  // });


  // ALL FILES //
  fs.readdir(rosterFolder, function(err,files) {
    files.forEach(function(file,index) {
      setTimeout(function() {
        let team = new Team(file);
        console.log('-------------STARTING ' + file + '-------------')
        team.loadRoster();
        // console.log('-------------ENDING ' + file + '-------------');
      },10000 * index)
    })
  });
}

class Team {
  constructor(file) {
    this.teamFile = 'data/OpeningDayRosters/' + file;
    this.teamAcronym = file.split('.json')[0];
  }

  printInfo() {
    console.log(this.teamFile);
    console.log(this.teamAcronym);
  }

  loadRoster() {
    let rosterRaw = JSON.parse(fs.readFileSync(this.teamFile, 'utf-8'))[0],
        gameDate = new Date(rosterRaw.game_date),
        roster = rosterRaw.roster;

    roster.forEach(function(player,index) {
      let playerID = player.player_id,
          playerURL = 'https://www.basketball-reference.com/players/' + playerID.substring(0,1) + '/' + playerID + '.html';

      setTimeout(function() { loadPlayer(playerURL,gameDate,playerID)}, 500*index )
    })

    // loadPlayer('https://www.basketball-reference.com/players/' + roster[5].player_id.substring(0,1) + '/' + roster[5].player_id + '.html',gameDate,roster[5].player_id)

    // loadPlayer('https://www.basketball-reference.com/players/' + rster[2].)

    function loadPlayer(url,date,playerID) {
      // console.log(url);
      let playerTransactions = [];
      scrapePromise(url)
      .then(function(response) {
        let $ = cheerio.load(response);
        let transactionDiv = $('#content').find('#all_transactions');
        let playerName = $('h1[itemprop=name]').text();
        $ = cheerio.load(transactionDiv.html().split('<!--')[1].split('-->')[0]);

        let transactions = $('p.transaction').filter(function() {
          return new Date($('strong',this).text()) >= gameDate
        }).each( function(i,e) {
          let transactionDate = new Date($('strong',this).text());
          let teamFrom = $('a',this).filter(function() { return typeof $(this).data().attrFrom !== 'undefined' }).attr('data-attr-from');
          let teamTo = $('a',this).filter(function() { return typeof $(this).data().attrTo !== 'undefined' }).attr('data-attr-to');

          // console.log(playerID, i,transactionDate, teamFrom, teamTo);
          if (typeof teamFrom !== 'undefined' | typeof teamTo != 'undefined') { // only look at team changes
            playerTransactions.push({
              transaction_number: i,
              transaction_date: transactionDate,
              team_from: teamFrom,
              team_to: teamTo
            });
          };

          if (playerTransactions.length > 0) {
            let playerData = [];
            playerData.push({
              player_id: playerID,
              player_name: playerName,
              player_transactions: playerTransactions
            });
            console.log('---' + playerID + ' - ' + playerTransactions.length + '---')
            fs.writeFileSync('data/Transactions/'+playerID+'.json',JSON.stringify(playerData));
          }
        });
      })
      .catch(function(error) {
        console.log(error);
      })
    }
  }
}

function scrapePromise(url) {
  return new Promise(function(resolve, reject) {
    request.get(url, function(error, response, body) {
      if (error) {
        reject(error);
      } else if (response.statusCode == 200) {
        resolve(body);
      }
    });
  });
}
