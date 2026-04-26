'use strict';

import { Database } from 'sqlite3';
import { Request, Response } from 'express';
import fetch from 'node-fetch';

interface Movie {
    movieId: number;
    imdbId: string;
    title: string;
    overview: string | null;
    productionCompanies: string | null;
    releaseDate: string | null;
    budget: number | null;
    revenue: number | null;
    runtime: number | null;
    language: string | null;
    genres: string | null;
    status: string | null;
}

interface Rating {
    source: string;
    value: string;
}

interface MovieDetails {
    imdbId: string;
    title: string;
    overview: string | null;
    releaseDate: string | null;
    budget: string | null;
    runtime: number | null;
    genres: string | null;
    language: string | null;
    productionCompanies: string | null;
    poster?: string;
    averageRating?: number;
    ratings: Rating[];
}

interface OmdbResponse {
    Ratings?: {
        Source: string;
        Value: string;
    }[];
    Plot?: string;
    Poster?: string;
    Response: string;
    Error?: string;
}

export const getMovieDetails = async (moviesDb: Database, ratingsDb: Database, req: Request, res: Response): Promise<void> => {
    const movieId = req.params.movieId;

    const movieQuery = `
        SELECT
            imdbId,
            title,
            overview,
            releaseDate,
            budget,
            runtime,
            genres,
            language,
            productionCompanies
        FROM movies
        WHERE movieId = ?;
    `;

    moviesDb.get(movieQuery, [movieId], async (err, movie: Movie) => {
        if (err) {
            return res.status(500).send({ error: err.message });
        }
        if (!movie) {
            return res.status(404).send({ message: 'Movie not found' });
        }

        let formattedProductionCompanies: string | null = null;
        if (movie.productionCompanies) {
            try {
                const companies = JSON.parse(movie.productionCompanies);
                if (Array.isArray(companies)) {
                    formattedProductionCompanies = companies.map(company => company.name).join(', ');
                } else if (typeof companies === 'object' && companies !== null && companies.name) {
                    formattedProductionCompanies = companies.name;
                } else {
                    formattedProductionCompanies = movie.productionCompanies; // Fallback to raw string if unexpected format
                }
            } catch (error) {
                console.error('Error parsing productionCompanies from database:', error);
                formattedProductionCompanies = movie.productionCompanies; // Fallback to raw string on error
            }
        }

        const movieDetails: MovieDetails = {
            imdbId: movie.imdbId,
            title: movie.title,
            overview: movie.overview,
            // releaseDate: movie.releaseDate,
            releaseDate: movie.releaseDate
            ? new Date(movie.releaseDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
            : null,
            budget: movie.budget !== null ? `$${movie.budget.toLocaleString()}` : null,
            runtime: movie.runtime,
            genres: movie.genres,
            language: movie.language,
            productionCompanies: formattedProductionCompanies,
            ratings: [],
        };

        const ratingsQuery = 'SELECT * FROM ratings WHERE movieId = ?';
        await new Promise<void>((resolve, reject) => {
            ratingsDb.all(ratingsQuery, [movieId], (err, rows: any[]) => {
                if (err) {
                    console.error('Error fetching local ratings:', err);
                } else if (rows && rows.length > 0) {
                    // 1. Calculate the average
                    const totalRating = rows.reduce((sum, row) => sum + row.rating, 0);
                    const avg = totalRating / rows.length;
                    movieDetails.averageRating = avg;

                    // 2. Instead of a loop for every row, push ONE summary rating
                    movieDetails.ratings.push({ 
                        source: 'Local Users', 
                        value: `${avg.toFixed(1)} / 5 (${rows.length} votes)` 
                    });
                }
                resolve();
            });
        });

        const apiKey = process.env.OMDB_API_KEY as string;
        const omdbUrl = `http://www.omdbapi.com/?i=${movie.imdbId}&apikey=${apiKey}`;

        try {
            const omdbResponse = await fetch(omdbUrl);
            const omdbData = await omdbResponse.json() as OmdbResponse;

            // Check if the OMDB API returned a successful response
            if (omdbData.Response === 'True') {
                
                // Add this line to map the poster
                movieDetails.poster = omdbData.Poster !== 'N/A' ? omdbData.Poster : undefined;
                // Enrichment 1: Description Fallback
                // If local database has no overview, use the OMDb Plot
                if (!movieDetails.overview && omdbData.Plot) {
                    movieDetails.overview = omdbData.Plot;
                }

                // Enrichment 2: All Available Ratings
                // This maps IMDb, Metacritic, and Rotten Tomatoes automatically
                if (omdbData.Ratings) {
                    omdbData.Ratings.forEach(externalRating => {
                        movieDetails.ratings.push({ 
                            source: externalRating.Source, 
                            value: externalRating.Value 
                        });
                    });
                }
            } else if (omdbData.Response === 'False' && omdbData.Error) {
                console.warn(`OMDB API Error for IMDb ID ${movie.imdbId}: ${omdbData.Error}`);
            }
        } catch (error) {
            console.error('Error fetching from OMDB:', error);
        }

        try {
            movieDetails.genres = movie.genres ? JSON.parse(movie.genres).map((g: { name: string }) => g.name).join(', ') : null;
        } catch (error) {
            console.error('Error parsing genres:', error);
            movieDetails.genres = movie.genres;
        }

        res.send(movieDetails);
    });
};