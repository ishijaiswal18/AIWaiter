# AIWaiter Backend Documentation

This document provides a detailed overview of the AIWaiter backend, including its architecture, setup, and key components.

## Architecture

The backend follows a **Model-View-Presenter (MVP)** architecture, which separates the application's concerns into three distinct layers:

-   **Models (`models/`)**: This layer is responsible for data access and storage. It contains functions for querying the mock database (e.g., `menuItem.getAll()`, `order.create()`).
-   **Views (`views/`)**: This layer handles incoming HTTP requests and routes them to the appropriate presenter. It's the entry point for all API calls.
-   **Presenters (`presenters/`)**: This layer contains the core business logic of the application. It acts as an intermediary between the models and the views, processing data and formatting it for the response.

**Data Flow:** The typical data flow for a request is: `View -> Presenter -> Model`. The presenter may also call other presenters to orchestrate more complex workflows.

## Setup & Run

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Environment Variables:**
    Create a `.env` file in the `backend` directory and add the following variables:
    ```
    LIVEKIT_API_KEY=your_api_key
    LIVEKIT_API_SECRET=your_api_secret
    PORT=5000
    ```

3.  **Start the Server:**
    ```bash
    npm start
    ```
    The server will run on the port specified in the `.env` file (defaulting to 5000).

## API Endpoints

The backend exposes a RESTful API for managing menu items, orders, and users.

-   **Health Check:**
    -   `GET /health`: Checks the health of the backend server.
-   **LiveKit Token:**
    -   `POST /get-token`: Generates a LiveKit access token for a user.
-   **Menu:**
    -   `GET /menu`: Retrieves the full menu.
    -   `GET /menu/specials`: Retrieves the daily specials.
-   **Orders:**
    -   `POST /orders`: Creates a new order.
    -   `GET /orders/:orderId`: Retrieves the status of an order.

## Key Files

-   `app.js`: The main Express application file, where middleware is configured and routes are mounted.
-   `server.js`: The entry point for the backend, which starts the HTTP server.
-   `utils/config.js`: Loads and manages environment variables.
-   `utils/logger.js`: Provides a simple logging utility.
-   `views/`: Contains the route handlers for each API endpoint.
-   `presenters/`: Contains the business logic for each feature.
-   `models/`: Contains the data models and mock database.
