'use strict';

import { Database } from 'sqlite3';
import { Request, Response } from 'express';

export const getMoviesByGenre = (db: Database, req: Request, res: Response): void => {
    const genre = req.params.genre;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = 50;
    const offset = (page - 1) * limit;

    if (!genre) {
        res.status(400).send({ error: 'Genre not provided in the URL.' });
        return;
    }

    const query = `
        SELECT
            m.movieId,
            m.imdbId,
            m.title,
            m.genres,
            m.releaseDate,
            m.budget
        FROM movies m
        WHERE EXISTS (
            SELECT 1
            FROM JSON_EACH(m.genres) AS genre_entry
            WHERE JSON_EXTRACT(genre_entry.value, '$.name') = ?
        )
        LIMIT ? OFFSET ?;
    `;

    db.all(query, [genre, limit, offset], (err: Error | null, rows: any[]) => {
        if (err) {
            res.status(500).send(JSON.stringify({ error: err.message }));
            return;
        }

        if (rows.length === 0 && page > 1) {
            res.status(404).send({ message: `No more movies found for the genre "${genre}" on this page.` });
            return;
        } else if (rows.length === 0 && page === 1) {
            res.status(404).send({ message: `No movies found for the genre "${genre}".` });
            return;
        }

        const formattedRows = rows.map(movie => ({
            ...movie,
            budget: movie.budget !== null ? `$${movie.budget.toLocaleString()}` : null,
        }));

        res.send(formattedRows);
    });
};