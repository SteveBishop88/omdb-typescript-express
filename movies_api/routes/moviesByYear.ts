'use strict';

import { Database } from 'sqlite3';
import { Request, Response } from 'express';

export const getMoviesByYear = (db: Database, req: Request, res: Response): void => {
    const year = parseInt(req.params.year, 10);
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = 50;
    const offset = (page - 1) * limit;
    const sortOrder = (req.query.sort as string)?.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    if (isNaN(year)) {
        res.status(400).send({ error: 'Invalid year provided in the URL.' });
        return;
    }

    const query = `
        SELECT
            movieId,
            imdbId,
            title,
            genres,
            releaseDate,
            budget
        FROM movies
        WHERE STRFTIME('%Y', releaseDate) = ?
        ORDER BY releaseDate ${sortOrder}
        LIMIT ? OFFSET ?;
    `;

    db.all(query, [year.toString(), limit, offset], (err: Error | null, rows: any[]) => {
        if (err) {
            res.status(500).send(JSON.stringify({ error: err.message }));
            return;
        }

        if (rows.length === 0 && page > 1) {
            res.status(404).send({ message: `No more movies found for the year ${year} on this page.` });
            return;
        } else if (rows.length === 0 && page === 1) {
            res.status(404).send({ message: `No movies found for the year ${year}.` });
            return;
        }

        const formattedRows = rows.map(movie => ({
            ...movie,
            budget: movie.budget !== null ? `$${movie.budget.toLocaleString()}` : null,
        }));

        res.send(formattedRows);
    });
};