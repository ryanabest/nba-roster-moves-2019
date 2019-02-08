const request = require('request');
const fs = require('fs');
const cheerio = require('cheerio');

class Team {
  constructor(acr,id) {
    this.baseURL = 'https://www.basketball-reference.com/teams/'+acr+'/2019.html';
    this.teamAcronym = acr;
    this.teamID = id;
    this.teamData = [];
  }

  getRostersArrow() {

  }

  getRosters() {
    let baseURL = this.baseURL,
        teamAcronym = this.teamAcronym,
        teamID = this.teamID,
        teamRosters = this.teamData;

    return new Promise(function (resolve,reject) {


      scrapePromise(baseURL)
      .then(function(response) {
        let $ = cheerio.load(response),
            gamePages = [],
            gameData = [],
            firstGamePage = 'https://www.basketball-reference.com/' + $('li.result').eq(0).find('span > a').attr('href');

        // $('li.result').each(function(i,elem) {
        //   gamePages[i] = 'https://www.basketball-reference.com' + $('a',this).attr('href');
        // });

        gamePages.push(firstGamePage);

        let gamesProcessed = 0;

        gamePages.forEach( function (gamePage,gameNumber) {


          // console.log(gamesProcessed,gamePages.length);

          scrapePromise(gamePage)
          .then(function(response) {
            gamesProcessed++;

            let $ = cheerio.load(response),
                playerList = [],
                gameDate;

            // Get Player Roster
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

            // Get Date
            gameDate = new Date($('h1').html().split('Box Score, ')[1]);

            gameData.push({
              team: teamAcronym
              ,team_id: teamID
              ,game_number: gameNumber + 1
              ,game_date: gameDate
              ,roster: playerList
            });

            // console.log
            teamRosters = gameData;
            // resolve(gameData);
            // console.log(gameData);
            if (gamesProcessed === gamePages.length) {
              resolve(gameData);
            };
          })
          .catch(function(error) {
            console.log(error);
          });
        })

      }).catch(function(error) {
        console.log(error)
      })

    })
  }
}

function loadTeams() {
  // let teams = ['HOU'];
  let teams = ['HOU','TOR','GSW','UTA','PHI','OKC','BOS','SAS','POR','MIN','DEN','NOP','IND','CLE','WAS','MIA','LAC','CHO','DET','MIL','LAL','DAL','NYK','BRK','ORL','ATL','MEM','CHI','SAC','PHO']
  // let teams = ['HOU','TOR','GSW','UTA','PHI']
  // let teams = ['OKC','BOS','SAS','POR','MIN']
  // let teams = ['DEN','NOP','IND','CLE','WAS']
  // let teams = ['MIA','LAC','CHO','DET','MIL']
  // let teams = ['LAL','DAL','NYK','BRK','ORL']
  // let teams = ['ATL','MEM','CHI','SAC','PHO']
  let teamRosters = [];
  let teamsProcessed = 0;

  teams.forEach( function(teamAcr,teamNumber) {
    setTimeout(function() {
      let team = new Team(teamAcr,teamNumber);
      console.log('-----------STARTING '+teamAcr+'-----------');
      team.getRosters().then(function(response) {
        teamRosters.push({
          team_name:teamAcr,
          team_id:teamNumber,
          team_rosters:response
        })
        // teamsProcessed++;
        // if(teamsProcessed===teams.length) {
        //   fs.writeFileSync('data/allTeams.json',JSON.stringify(teamRosters));
        // };

        fs.writeFileSync('data/openingDayRosters/'+team.teamAcronym+'.json',JSON.stringify(response));
        console.log('-----------FINISHED '+teamAcr+'-----------');
      }).catch(function(error) {
        console.log(error);
      });
    },5000 * teamNumber);

    // team.getRosters().then(function(response) {
    //   teamRosters.push({
    //     team_name:teamAcr,
    //     team_id:teamNumber,
    //     team_rosters:response
    //   })
    //   teamsProcessed++;
    //   if(teamsProcessed===teams.length) {
    //     fs.writeFileSync('data/allTeams.json',JSON.stringify(teamRosters));
    //   };
    //
    //   // fs.writeFileSync('data/'+team.teamAcronym+'.json',JSON.stringify(response));
    // }).catch(function(error) {
    //   console.log(error);
    // });
  });
  // let teams = [ 'HOU','TOR','GSW','UTA','PHI','OKC','BOS','SAS','POR','MIN','DEN','NOP','IND','CLE','WAS','MIA','LAC','CHO','DET','MIL','LAL','DAL','NYK','BRK','ORL','ATL','MEM','CHI','SAC','PHO']
  // for (let t=0;t<teams.length;t++) {
  //   let team = new Team(teams[t],t);
  //   team.getRosters().then(function(response,teamNumber) {
  //     console.log(teamNumber,);
  //     // fs.writeFileSync('data/'+team.teamAcronym+'.json',JSON.stringify(response));
  //   }).catch(function(error) {
  //     console.log(error);
  //   });
  // }
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

loadTeams();
