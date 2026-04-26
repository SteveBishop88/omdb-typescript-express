'use strict';
import dotenv from 'dotenv';
dotenv.config(); // This loads the variables from .env into process.env

import express, { Request, Response } from 'express';
import * as genres from './routes/genres';
import * as ratings from './routes/ratings';
import * as movies from './routes/movies';
import * as movieDetails from './routes/movieDetails';
import * as moviesByYear from './routes/moviesByYear';
import * as moviesByGenre from './routes/moviesByGenre'; 
import { Database, OPEN_READONLY } from 'sqlite3';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

const ratingsDB = new Database('./movies_api/db/ratings.db', OPEN_READONLY, (err: Error | null) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Ratings database opened successfully');
    }
});

const moviesDB = new Database('./movies_api/db/movies.db', OPEN_READONLY, (err: Error | null) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Movies database opened successfully');
    }
});

app.use(express.json());

// Serve static files from the root directory (where index.html and movies.html are located)
app.use(express.static(path.join(__dirname, '.')));


app.get('/genres/all', (req: Request, res: Response) => {
    genres.getGenreList(moviesDB, req, res);
});

app.get('/heartbeat', (req: Request, res: Response) => {
    res.send('Have fun with the project!');
});

app.get('/ratings/:movieId', (req: Request, res: Response) => {
    ratings.getRating(ratingsDB, req, res);
});

app.get('/movies/all', (req: Request, res: Response) => {
    movies.getAllMovies(moviesDB, req, res);
});

app.get('/movies/:movieId', (req: Request, res: Response) => {
    movies.getMovie(moviesDB, req, res);
});

app.get('/movies/:movieId/details', async (req: Request, res: Response) => {
  await movieDetails.getMovieDetails(moviesDB, ratingsDB, req, res);
});

app.get('/movies/year/:year', (req: Request, res: Response) => {
    moviesByYear.getMoviesByYear(moviesDB, req, res);
});

app.get('/movies/genre/:genre', (req: Request, res: Response) => {
    moviesByGenre.getMoviesByGenre(moviesDB, req, res);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});