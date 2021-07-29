const express = require("express");
const path = require("path");
const app = express();
module.exports = app;

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;

const initializeServerAndDatabase = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server started");
    });
  } catch (e) {
    console.log(`Error: ${e.message}`);
    process.exit(1);
  }
};
initializeServerAndDatabase();

const changeKeyName = (playerDetailsObj) => {
  const { player_id, player_name, jersey_number, role } = playerDetailsObj;
  const changedDetailsObj = {
    playerId: player_id,
    playerName: player_name,
    jerseyNumber: jersey_number,
    role: role,
  };
  return changedDetailsObj;
};

//Get Players API 1
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
        SELECT *
        FROM cricket_team;
    `;
  const playersArray = await db.all(getPlayersQuery);
  const requiredPlayersArray = playersArray.map(changeKeyName);

  response.send(requiredPlayersArray);
});

//Add Player API 2
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const addPlayerQuery = `
        INSERT INTO
        cricket_team (player_name, jersey_number, role)
        VALUES 
        (
        '${playerName}',
        ${jerseyNumber},
        '${role}'
        );
    `;
  const dbResponse = await db.run(addPlayerQuery);
  console.log(dbResponse);
  response.send("Player Added to Team");
});

//Get Player API 3
app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
        SELECT *
        FROM cricket_team
        WHERE player_id = ${playerId};
    `;
  const playerDetails = await db.get(getPlayerQuery);
  const requiredDetails = changeKeyName(playerDetails);
  response.send(requiredDetails);
});

//Update Player API 4
app.put("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerQuery = `
        UPDATE cricket_team
        SET 
        player_name = '${playerName}',
        jersey_number = ${jerseyNumber},
        role = '${role}'
        WHERE player_id = ${playerId};
    `;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//Delete Player API 5
app.delete("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
        DELETE FROM
        cricket_team
        WHERE player_id = ${playerId};
    `;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});
