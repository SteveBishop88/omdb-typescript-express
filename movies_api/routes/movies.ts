'use strict';

import { Database } from 'sqlite3';
import { Request, Response } from 'express';

export const getAllMovies = (db: Database, req: Request, res: Response): void => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = 50;
  const offset = (page - 1) * limit;

  const query = `
    SELECT
      movieId,
      imdbId,
      title,
      genres,
      releaseDate,
      budget
    FROM movies
    LIMIT ? OFFSET ?;
  `;

  db.all(query, [limit, offset], (err: Error | null, rows: any[]) => {
    if (err) {
      res.status(500).send(JSON.stringify({ error: err.message }));
      return;
    }

    if (rows.length === 0 && page > 1) {
      res.status(404).send({ message: 'No more movies found on this page.' });
      return;
    } else if (rows.length === 0 && page === 1) {
      res.status(404).send({ message: 'No movies found in the database.' });
      return;
    }

    // Format the budget to dollars (assuming the budget in the database is a number)
    const formattedRows = rows.map(movie => ({
      ...movie,
      budget: movie.budget !== null ? `$${movie.budget.toLocaleString()}` : null,
    }));

    res.send(formattedRows);
  });
};

export const getMovie = (db: Database, req: Request, res: Response): void => {
  const query = `
    SELECT
      movieId,
      imdbId,
      title,
      overview,
      productionCompanies,
      releaseDate,
      budget,
      revenue,
      runtime,
      language,
      genres,
      status
    FROM movies
    WHERE movieId = ?;
  `;

  db.get(query, [req.params.movieId], (err: Error | null, row: any) => {
    if (err) {
      res.status(500).send(JSON.stringify({ error: err.message }));
      return;
    }

    if (!row) {
      res.status(404).send({ message: 'Movie not found' });
      return;
    }

    // Format the budget to dollars for a single movie as well
    const formattedRow = {
      ...row,
      budget: row.budget !== null ? `$${row.budget.toLocaleString()}` : null,
    };

    res.send(formattedRow);
  });
};