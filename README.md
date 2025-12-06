# Strategy Creator System

A standalone Electron application for creating and analyzing trading strategies using AI.

## Prerequisites

1.  **Universal Trading Engine**: This app depends on the backend service running at `http://localhost:3000`.
    *   Location: `workshops/http-sidecar/universal-trading-engine`
    *   Run: `npm run dev` in that directory.

## How to Run

### Development Mode

Run the Next.js app and Electron wrapper concurrently:

```bash
npm run electron-dev
```

### Build

Build the application for production:

```bash
npm run electron-pack
```

## Features

*   **AI Strategy Analysis**: Convert natural language to trading logic.
*   **PineScript Generation**: Automatically generate PineScript for TradingView.
*   **Backtesting**: Run strategies against historical data.
*   **Strategy Management**: Save and load strategies with version control.
