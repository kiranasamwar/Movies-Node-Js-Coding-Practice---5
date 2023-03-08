const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();

let dbBase = null;

const dbPath = path.join(__dirname, "moviesData.db");
app.use(express.json());

const initializingDbServer = async () => {
  try {
    dbBase = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running at http://localhost:3000");
    });
  } catch (error) {
    console.log(`Data Base Error is ${error}`);
    process.exit(1);
  }
};
initializingDbServer();

//get the list of all the movies in the database
//API 1

const firstMovieName = (objName) => {
  return {
    movieName: objName.movie_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMovieQuery = `select movie_name from movie;`;
  const getMovieList = await dbBase.all(getMovieQuery);
  response.send(getMovieList.map((each) => firstMovieName(each)));
});

//creat a movie table in moviesData.db
//API 2
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const creatMovieQuery = `insert into movie(director_id,movie_name,lead_actor)
    values(${directorId},'${movieName}','${leadActor}');`;
  const creatMovieResponse = await dbBase.run(creatMovieQuery);
  response.send("Movie Successfully Added");
});

//Return a movie based on the movie Id
//API 3

const convertMovieApi = (objItem) => {
  return {
    movieId: objItem.movie_id,
    directorId: objItem.director_id,
    movieName: objItem.movie_name,
    leadActor: objItem.lead_actor,
  };
};

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieDetails = `select * from movie where movie_id = ${movieId};`;
  const getMovieResponse = await dbBase.get(getMovieDetails);
  response.send(convertMovieApi(getMovieResponse));
});

// update the details of a movie in the table based on the movie Id
//API 4

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQueryTable = `update movie set director_id = ${directorId},
  movie_name = '${movieName}', lead_actor = '${leadActor}' where movie_id = ${movieId};`;
  const updateMovieQueryResponse = await dbBase.run(updateMovieQueryTable);
  response.send("Movie Details Updated");
});

//delete the details of a movie in the movie table based on the movie ID
//API 5

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `delete from movie where movie_id = ${movieId};`;
  const deleteMovieResponse = await dbBase.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//Return a list of all directors in the director table
//API 6

const convertDirectorDb = (objItem) => {
  return {
    directorId: objItem.director_id,
    directorName: objItem.director_name,
  };
};

app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `select * from director;`;
  const grtDirectorResponse = await dbBase.all(getDirectorQuery);
  response.send(grtDirectorResponse.map((each) => convertDirectorDb(each)));
});

// Return a list all movie names directed by a specific director
// API 7

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMovieDirectQuery = `select movie_name as movieName from movie where
    director_id = ${directorId};`;
  const getDirResponse = await dbBase.all(getMovieDirectQuery);
  response.send(getDirResponse);
});

module.exports = app;
