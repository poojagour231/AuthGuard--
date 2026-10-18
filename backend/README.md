
# AuthGuard AI — Backend

## Overview

AuthGuard AI backend provides APIs for website risk analysis,
risk event history, and dashboard summary data.

## Technology Stack

- Python
- FastAPI
- SQLAlchemy
- SQLite
- Pytest

## Project Structure

```text
authguard-backend/
├── main.py
├── database.py
├── models.py
├── requirements.txt
├── test_main.py
├── README.md
└── authguard.db
```

## Requirements

- Python 3.10 or newer
- pip

## Installation

Open a terminal in the project folder and run:

```bash
python -m pip install -r requirements.txt
```

## Start the Server

```bash
python -m uvicorn main:app --reload
```

The local server runs at:

http://127.0.0.1:8000

## API Documentation

Open the interactive API documentation:

http://127.0.0.1:8000/docs

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/v1/health` | Check backend status |
| POST | `/api/v1/risk/analyze` | Analyze submitted metadata and save the result |
| GET | `/api/v1/risk/events` | Retrieve risk event history |
| GET | `/api/v1/risk/events/{event_id}` | Retrieve one event |
| GET | `/api/v1/dashboard/summary` | Retrieve dashboard counts |

## Example Risk Analysis Request

Send a POST request to `/api/v1/risk/analyze`:

```json
{
  "hostname": "example.com",
  "otp_field_detected": false,
  "redirect_count": 0,
  "reputation": "unknown"
}
```

The response includes the risk score, risk level, decision,
reasons, recommended action, event ID, and creation timestamp.

## Run Automated Tests

Stop the running development server if needed, then run:

```bash
python -m pytest -v
```

## Database

Risk events are stored in the local SQLite database file
`authguard.db`. The database and its records are local to
this development setup.

## Privacy

Never submit or store actual OTPs, passwords, session tokens,
cookies, or private message contents.

## Limitations

Risk results depend on the submitted metadata and configured
rules. An `allow` decision does not guarantee that a website
is safe


## System Architecture

```text
User
  |
  v
Frontend
  |
  v
FastAPI Backend
  |
  +----> Rule-Based Risk Assessment
  |              |
  |              v
  |         Risk Result
  |
  +----> SQLite Database
           (Risk Event Storage)

Future Integration:
FastAPI Backend --> AI Model
                     |
                     v
              Model Result or
              Rule-Based Fallback
```

### Backend Components

- **FastAPI:** Handles API requests and responses.
- **Risk Assessment:** Calculates risk scores using the
  currently configured rules.
- **SQLite:** Stores risk-analysis events.
- **AI Model:** Integration is pending.
- **Fallback Mode:** Dedicated model-failure fallback is
  pending implementation and testing.

## Dataset Information

Dataset details must be confirmed with the model team.

- Dataset name: Pending confirmation
- Dataset source: Pending confirmation
- Dataset format: Pending confirmation
- Intended use: To be documented after confirmation