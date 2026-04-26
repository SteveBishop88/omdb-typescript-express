Movie API Portfolio Project

A full-stack movie discovery application built with Node.js, TypeScript, and Express. This project demonstrates the ability to orchestrate data from multiple sources—including local SQLite databases and external APIs—into a clean, paginated web interface.


🚀 The Gist

This app provides a searchable library of movies with real-time rating aggregation. It is designed for zero-config setup, shipping with pre-populated SQLite databases so you can get it running immediately without external database dependencies.

    Backend: TypeScript / Express.js

    Database: SQLite3 (Local file-based)

    Frontend: Vanilla JS / HTML5 / CSS3 (Inter UI)

    Integrations: OMDB API (Rotten Tomatoes scores) & Internal Ratings API

🛠️ Set Up & Installation

    Clone the repo

    Install dependencies:
    Bash

    npm install

    Environment Setup:

        Ensure Sqlite3 is installed on your system.

        (Optional) Add your OMDB API key to the configuration if prompted.

    Run the application:
    Bash

    npm run dev

    Access the App:

        Main UI: http://localhost:3000

        API Heartbeat: http://localhost:3000/heartbeat

✅ Completed Features (Developer Notes)

I have implemented the following user stories and technical requirements:
Core Infrastructure

    TypeScript Migration: Ported the initial boilerplate to a strictly typed Express environment.

    Routing: Modularized routing system using Express Router for scalability.

    UI/UX: Created a responsive, modern frontend using CSS variables and a "back-to-main" navigation flow.

Implemented Stories

    Story 1: Global Movie List

        Paginated endpoint (50 per page) with database-driven results.

        Formatted currency for budgets and sanitized JSON genre tags for readability.

    Story 2: Detailed Movie Insights

        Aggregated data from movies.db, local ratings, and external OMDB API calls.

        Created a dedicated details view with poster support.

    Story 3: Chronological Year Search

        Added support for year-based filtering with toggleable sort order (ASC/DESC).

    Story 4: Genre Discovery

        Implemented a dynamic genre selection tool and filtering endpoint.

🏗️ Technical Considerations

    12-Factor Ready: Designed with environment separation and stateless logic in mind.

    Data Orchestration: Demonstrates handling of asynchronous data fetching from multiple concurrent sources (SQL + REST).

    Clean Code: Leverages TypeScript interfaces to ensure data integrity across the API and Frontend.

How to Use this as a Template:

Feel free to use the existing db/movies.db to test SQL queries:
Bash

sqlite3 movies_api/db/movies.db
.tables
.schema movies
