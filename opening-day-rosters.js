const request = require('request');
const fs = require('fs');
const cheerio = require('cheerio');


class Team {
  constructor(acr) {
    this.baseURL = 'https://www.basketball-reference.com/teams/'+acr+'/2019.html';
    this.teamAcronym = acr;
  }

  printURL() {
    console.log(this.baseURL);
  }

  getFirstGamePage() {
    let teamURL = this.baseURL;
    return new Promise(function(resolve, reject) {
      request.get(teamURL, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            let $ = cheerio.load(body);
            let firstGamePage = 'https://www.basketball-reference.com/' + $('li.result').eq(0).find('span > a').attr('href');
            resolve(firstGamePage);
        } else {console.log("Request failed!")}
      })
    })
  }

  getPlayerRoster(firstGameURL, teamRosters, callback) {
    let teamAcronym = this.teamAcronym;
    return new Promise(function(resolve, reject) {
      let playerList = [];
      request.get(firstGameURL, function(error, response, body) {
        if (!error && response.statusCode == 200) {
          let $ = cheerio.load(body);
          let rosterTable = $('div#all_box_'+teamAcronym.toLowerCase()+'_basic').find('table > tbody > tr')
          rosterTable.each(function (i,elem) {
            if (i !== 5) {
              let playerHeader = $('th',elem),
                  playerID = playerHeader.attr('data-append-csv'),
                  playerName = $('a',playerHeader).text();
              playerList.push({
                 player_id: playerID
                ,player_name: playerName
                ,active: 1
              });
            }
          })

          let inactiveStrong = $('strong').filter(function() {
            return $(this).text().trim() === 'Inactive:'
          })

          let inactiveList = inactiveStrong.parent().html().split('<br>')[0].split('<span>');
          for (let i=0;i<inactiveList.length;i++) {
            if (inactiveList[i].split('<strong>')[1].split('</strong>')[0] === teamAcronym) {
              let players = inactiveList[i].split('</span>')[1].split('</a>');
              // console.log(players);
              for (let p=0;p<players.length-1;p++) {
                let player = players[p].replace(',','').replace('&#xA0;','')
                    ,playerName = player.split('>')[1]
                    ,playerID = player.split('"')[1].split('/')[3].split('.')[0];
                playerList.push({
                   player_id: playerID
                  ,player_name: playerName
                  ,active: 0
                });
              }
            };
          }

          teamRosters.push({
            team: teamAcronym
            ,roster: playerList
          })
          fs.writeFileSync('data/openingDayRosters.json',JSON.stringify(teamRosters));
        } else {console.log("Request failed!")}
      })
    });
    callback();
  }
}

function loadTeams() {
  // let teams = ['HOU']
  let teams = [ 'HOU','TOR','GSW','UTA','PHI','OKC','BOS','SAS','POR','MIN','DEN','NOP','IND','CLE','WAS','MIA','LAC','CHO','DET','MIL','LAL','DAL','NYK','BRK','ORL','ATL','MEM','CHI','SAC','PHO']
  let teamRosters = [];
  for (let t=0;t<teams.length;t++) {
    let team = new Team(teams[t]);

    let firstGamePage = team.getFirstGamePage();
    firstGamePage.then(function(result) {
      team.getPlayerRoster(result,teamRosters);
    }, function(err) {
      console.log(err);
    })
  }
}

loadTeams();
