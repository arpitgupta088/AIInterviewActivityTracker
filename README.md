# AI Interview Activity Tracker

A full-stack interview monitoring and activity tracking application built with **ASP.NET Core Web API**, **MongoDB**, and **React**.

The system captures candidate activity during AI-based interviews, manages interview sessions, records question-level and complete session recordings, stores activity events in MongoDB, generates interview summaries, and provides a responsive dashboard for monitoring interview activity and session details.

The project follows **Clean Architecture** principles with separation of Controllers, Services, Repositories, Models, Validators, Middleware, Background Services, and Database components.

---

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Interview Flow](#interview-flow)
- [Features](#features)
- [MongoDB Collections & Indexes](#mongodb-collections--indexes)
- [API Endpoints](#api-endpoints)
- [Frontend Routes](#frontend-routes)
- [Activity Events Tracked](#activity-events-tracked)
- [Recording System](#recording-system)
- [Event Queue & Beacon Batching](#event-queue--beacon-batching)
- [Background Processing](#background-processing)
- [Validation & Exception Handling](#validation--exception-handling)
- [Performance Optimizations](#performance-optimizations)
- [Configuration](#configuration)
- [Running the Project](#running-the-project)
- [Testing & Verification](#testing--verification)
- [Developed By](#developed-by)

---

## Overview

The AI Interview Activity Tracker consists of two main applications:

| Application | Description |
|---|---|
| **AIInterviewActivityTracker** | ASP.NET Core Web API (.NET 10) with MongoDB integration |
| **AIInterviewDashboard** | React + Vite frontend dashboard and candidate interview interface |

---

## Technology Stack

### Backend

| Technology | Version / Details |
|---|---|
| ASP.NET Core Web API | .NET 10 |
| C# | Language |
| MongoDB | Primary database |
| MongoDB.Driver | `3.10.0` |
| FluentValidation.AspNetCore | `11.3.1` |
| Swashbuckle.AspNetCore (Swagger) | `10.2.3` |
| Microsoft.AspNetCore.OpenApi | `10.0.8` |
| ASP.NET Core Hosted Background Service | Interview summary processing |
| Dependency Injection | Built-in ASP.NET Core DI |

### Frontend

| Technology | Version / Details |
|---|---|
| React | `^19.2.7` |
| Vite | `^8.1.1` |
| JavaScript (ES Modules) | Language |
| Bootstrap | `^5.3.8` |
| React Bootstrap | `^2.10.10` |
| Axios | `^1.18.1` |
| React Router DOM | `^7.18.1` |
| Recharts | `^3.10.0` |
| Lucide React | `^1.25.0` |
| Browser MediaRecorder API | Question & session recording |
| Browser MediaStream API | Camera, microphone & screen capture |
| Beacon API | Reliable batched event delivery on page unload |

---

## Project Structure

```text
AIInterviewActivityTracker/                    ← Solution root
│
├── AIInterviewActivityTracker/                ← ASP.NET Core Web API
│   ├── BackgroundServices/
│   │   └── InterviewSummaryBackgroundService.cs
│   ├── Configurations/
│   │   └── MongoDbSettings.cs
│   ├── Constants/
│   │   └── SystemConstants.cs
│   ├── Controllers/
│   │   ├── ActivityEventController.cs
│   │   ├── DashboardController.cs
│   │   ├── InterviewSessionController.cs
│   │   ├── InterviewSummaryController.cs
│   │   ├── RecordingController.cs
│   │   └── SessionRecordingController.cs
│   ├── Interfaces/
│   │   ├── IActivityEventRepository.cs
│   │   ├── IActivityEventService.cs
│   │   ├── IInterviewSessionRepository.cs
│   │   ├── IInterviewSessionService.cs
│   │   ├── IInterviewSummaryGenerator.cs
│   │   ├── IInterviewSummaryRepository.cs
│   │   ├── IInterviewSummaryService.cs
│   │   ├── IRecordingRepository.cs
│   │   ├── IRecordingService.cs
│   │   ├── ISessionRecordingRepository.cs
│   │   └── ISessionRecordingService.cs
│   ├── Middleware/
│   │   └── GlobalExceptionMiddleware.cs
│   ├── Models/
│   │   ├── ActivityEvent.cs
│   │   ├── ApiResponse.cs
│   │   ├── CreateInterviewSessionRequest.cs
│   │   ├── DashboardStats.cs
│   │   ├── InterviewSession.cs
│   │   ├── InterviewSummary.cs
│   │   ├── Recording.cs
│   │   ├── SessionRecording.cs
│   │   └── UpdateInterviewSessionRequest.cs
│   ├── Properties/
│   ├── Repositories/
│   │   ├── ActivityEventRepository.cs
│   │   ├── InterviewSessionRepository.cs
│   │   ├── InterviewSummaryRepository.cs
│   │   ├── MongoDbContext.cs
│   │   ├── MongoDbIndexes.cs
│   │   ├── RecordingRepository.cs
│   │   └── SessionRecordingRepository.cs
│   ├── Services/
│   │   ├── ActivityEventService.cs
│   │   ├── InterviewSessionService.cs
│   │   ├── InterviewSummaryGenerator.cs
│   │   ├── InterviewSummaryService.cs
│   │   ├── RecordingService.cs
│   │   └── SessionRecordingService.cs
│   ├── Validators/
│   │   ├── ActivityEventValidator.cs
│   │   ├── CreateInterviewSessionRequestValidator.cs
│   │   └── UpdateInterviewSessionRequestValidator.cs
│   ├── wwwroot/
│   │   └── uploads/
│   │       └── session-recordings/
│   ├── Program.cs
│   ├── appsettings.json
│   ├── appsettings.Development.json
│   └── AIInterviewActivityTracker.csproj
│
├── AIInterviewDashboard/                      ← React + Vite Frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   │   ├── ActivityChart.jsx
│   │   │   │   ├── EventTable.jsx
│   │   │   │   ├── FilterBar.jsx
│   │   │   │   ├── SessionSummary.jsx
│   │   │   │   └── StatsCard.jsx
│   │   │   ├── interview/
│   │   │   │   ├── ProgressBar.jsx
│   │   │   │   ├── QuestionPlayer.jsx
│   │   │   │   └── WebcamRecorder.jsx
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   └── Sidebar.jsx
│   │   │   └── session/
│   │   │       ├── InterviewSummaryCard.jsx
│   │   │       ├── SessionEventTable.jsx
│   │   │       ├── SessionInfo.jsx
│   │   │       └── SessionRecordings.jsx
│   │   ├── data/
│   │   ├── hooks/
│   │   │   └── useInterviewActivityTracking.js
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Events.jsx
│   │   │   ├── InterviewComplete.jsx
│   │   │   ├── InterviewIntro.jsx
│   │   │   ├── InterviewLanding.jsx
│   │   │   ├── InterviewPermission.jsx
│   │   │   ├── InterviewQuestion.jsx
│   │   │   ├── SessionDetails.jsx
│   │   │   └── Sessions.jsx
│   │   ├── services/
│   │   │   ├── activityTracker.js
│   │   │   ├── apiClient.js
│   │   │   ├── dashboardService.js
│   │   │   ├── eventQueue.js
│   │   │   ├── interviewService.js
│   │   │   └── recordingService.js
│   │   ├── styles/
│   │   │   ├── dashboard.css
│   │   │   └── globals.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   └── .env
│
├── AIInterviewActivityTracker.slnx
├── .gitignore
└── README.md
```

---

## Architecture

```text
┌───────────────────────────────────────────┐
│   React Dashboard / Browser Interview UI  │
│   (Vite + React + Axios + Beacon API)     │
└──────────────────┬────────────────────────┘
                   │
                   │  HTTP / Axios / Beacon API
                   ▼
┌───────────────────────────────────────────┐
│         ASP.NET Core Web API              │
│              Controllers                  │
└──────────────────┬────────────────────────┘
                   │
                   ▼
┌───────────────────────────────────────────┐
│               Services                    │
│          Business Logic Layer             │
└──────────────────┬────────────────────────┘
                   │
                   ▼
┌───────────────────────────────────────────┐
│             Repositories                  │
│          Data Access Layer                │
└──────────────────┬────────────────────────┘
                   │
                   ▼
┌───────────────────────────────────────────┐
│               MongoDB                     │
│   AIInterviewTrackerDb                    │
└───────────────────────────────────────────┘
```

The application follows a layered **Repository-Service** pattern with full **Dependency Injection** throughout.

---

## Interview Flow

```text
Interview Landing
       │
       ▼
Permission Request
(Camera · Microphone · Screen Sharing)
       │
       ▼
Introduction
       │
       ▼
Interview Questions
  ├── Question Video Playback
  ├── Candidate Recording (MediaRecorder)
  └── Next Question
       │
       ▼
  More Questions
       │
       ▼
Interview Complete
  ├── Stop Question Recording → Upload
  ├── Stop Session Recording → Upload
  ├── Update Session Status → COMPLETED
  └── Log INTERVIEW_COMPLETED
```

Throughout the interview, activity events are queued and flushed to the backend against the active `SessionId`, `CandidateId`, and `InterviewId`.

---

## Features

### Backend Features

- **Interview Session Management** — Create, retrieve, and update interview sessions
- **Activity Event Tracking** — Single event logging, batch upload, and Beacon API support
- **Beacon Batch Endpoint** — Accepts batched events as a JSON-encoded form field for reliable delivery on page unload
- **Dashboard Statistics** — Total sessions, active sessions, total events
- **Recent Activity Events** — Configurable event limit (no full history load)
- **Session Activity Timeline** — Ordered event timeline per session
- **Activity Search & Filtering** — Session ID search, event type filter, date range, server-side pagination
- **Server-Side Pagination** — Configurable page size (default: 20), total count returned
- **Question-Level Recording** — Upload, stream, and delete per-question recordings
- **Complete Session Recording** — Screen + audio session recording upload, stream, and delete
- **Interview Summary Generation** — Duplicate-prevention, on-demand and background generation
- **Background Hosted Service** — Auto-generates summaries for completed sessions every 60 seconds
- **Global Exception Middleware** — Consistent JSON error responses, no implementation detail leakage
- **FluentValidation** — DTO validation for all request models
- **Dependency Injection** — Scoped/singleton services; MongoDB client registered as Singleton
- **MongoDB Indexing** — Session, event type, timestamp, compound, and TTL indexes
- **Swagger / OpenAPI** — Full API documentation available in Development mode
- **CORS Configuration** — Configured to allow all origins, methods, and headers

### Frontend Features

#### Activity Tracking Services

The frontend uses two dedicated services to reliably track and deliver events:

- **`activityTracker.js`** — Singleton module that initialises the event queue per session, registers global error listeners (`error`, `unhandledrejection`), and flushes pending events via the Beacon API on page hide.
- **`eventQueue.js`** — Manages a local event queue persisted in `localStorage`. Automatically flushes batches via the Beacon API when the batch size threshold (10 events) is reached.

#### Interview Activity Tracking (`useInterviewActivityTracking.js`)

The hook tracks the following browser and interview events automatically:

| Category | Events |
|---|---|
| Page | Page Load, Page Leave |
| Window | Window Focus, Window Blur |
| Tab | Tab Visibility Change, Tab Switched, Tab Returned |
| Fullscreen | Fullscreen Enter, Fullscreen Exit |
| Network | Network Offline, Network Online |
| Permissions | Camera, Microphone, Screen Sharing Granted/Denied |
| Screen Share | Screen Share End |
| Interview | Interview Start, Interview Completion, Interview Abort |
| Question | Video Completion, Video Playback Failure, Question Replay, Next Question, Question Completion |
| Recording | Recording Start, Recording Stop, Recording Upload |
| Session | Session Recording Upload |
| Errors | Application Error, Unhandled Promise Rejection |

#### React Dashboard

- Dashboard statistics overview
- Recent activity events panel
- Activity distribution bar chart (Recharts)
- Interview sessions list with server-side pagination
- Session details with full timeline
- Question recordings with in-browser playback
- Complete session recording player
- Recording deletion
- Interview summary card
- Activity search (Session ID / Event Type)
- Event type filter and date range filter
- Server-side pagination
- Responsive layout with sidebar navigation

---

## MongoDB Collections & Indexes

### Collections

#### `InterviewSessions`

| Field | Description |
|---|---|
| `SessionId` | Unique session identifier |
| `CandidateId` | Candidate identifier |
| `InterviewId` | Interview identifier |
| `StartTime` | Session start timestamp |
| `EndTime` | Session end timestamp |
| `Status` | `IN_PROGRESS` / `COMPLETED` / `ABORTED` |
| `CreatedAt` | Record creation timestamp |

#### `ActivityEvents`

| Field | Description |
|---|---|
| `Id` | MongoDB document ID |
| `SessionId` | Associated session |
| `CandidateId` | Associated candidate |
| `EventType` | Type of activity event |
| `Module` | Source module of the event |
| `Timestamp` | Event occurrence time |
| `CreatedAt` | Record creation time |
| `MetadataJson` | Additional event metadata (JSON string) |

#### `InterviewSummaries`

| Field | Description |
|---|---|
| `SessionId` | Associated session |
| `CandidateId` | Associated candidate |
| `TotalEventsCount` | Total event count |
| `ErrorEventsCount` | Suspicious/error event count |
| `IsAbortedByCandidate` | Whether the candidate aborted the interview |
| `LastActiveTimestamp` | Last recorded activity time |
| `SummaryNotes` | Generated summary notes |
| `CreatedAt` / `UpdatedAt` | Timestamps |

#### `Recordings`

| Field | Description |
|---|---|
| `SessionId` | Associated session |
| `CandidateId` | Associated candidate |
| `QuestionNumber` | Question number for this recording |
| `FileName` | Recording file name |
| `FilePath` | Physical file path |
| `ContentType` | MIME type |
| `FileSize` | Size in bytes |
| `CreatedAt` | Upload timestamp |

#### `SessionRecordings`

| Field | Description |
|---|---|
| `SessionId` | Associated session |
| `CandidateId` | Associated candidate |
| `FileName` | Recording file name |
| `FilePath` | Physical file path |
| `ContentType` | MIME type |
| `FileSize` | Size in bytes |
| `StartedAt` | Recording start time |
| `EndedAt` | Recording end time |
| `CreatedAt` | Upload timestamp |

### MongoDB Indexes

#### ActivityEvents

| Index | Purpose |
|---|---|
| `SessionId` | Efficient session-based event retrieval |
| `EventType` | Event type filtering |
| `Timestamp` | Time-based queries and recent event retrieval |
| `IX_SessionId_Timestamp` (Compound) | Ordered session timeline queries |
| `TTL_ActivityEvents` | Auto-expire events after **30 days** |

#### SessionRecordings

| Index | Purpose |
|---|---|
| `IX_SessionRecordings_SessionId` | Session-based recording retrieval |
| `IX_SessionRecordings_CreatedAt` | Recording sort by creation time |

---

## API Endpoints

### Interview Session APIs

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/sessions` | Create interview session |
| `GET` | `/api/v1/sessions` | Get all sessions (paginated) |
| `GET` | `/api/v1/sessions/{sessionId}` | Get session by ID |
| `PATCH` | `/api/v1/sessions/status` | Update session status |

### Activity APIs

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/activities` | Log single activity event |
| `POST` | `/api/v1/activities/batch` | Batch upload activity events |
| `GET` | `/api/v1/activities/session/{sessionId}` | Get events by session |
| `POST` | `/api/v1/activities/beacon` | Beacon API — single event (form-encoded) |
| `POST` | `/api/v1/activities/beacon-batch` | Beacon API — batch events (JSON-encoded form field) |
| `GET` | `/api/v1/activities/search` | Search / filter / paginate events |

**Search query parameters:** `sessionId`, `eventType`, `startDate`, `endDate`, `page`, `pageSize`

### Dashboard APIs

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/dashboard/stats` | Dashboard statistics |
| `GET` | `/api/v1/dashboard/recent-events` | Recent activity events |
| `GET` | `/api/v1/dashboard/timeline/{sessionId}` | Session activity timeline |

### Interview Summary APIs

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/interview-summaries/{sessionId}` | Get interview summary |
| `POST` | `/api/v1/interview-summaries/generate/{sessionId}` | Generate interview summary |
| `GET` | `/api/v1/interview-summaries/count` | Get summary count |

### Question Recording APIs

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/recordings/upload/{sessionId}` | Upload question recording |
| `GET` | `/api/v1/recordings/session/{sessionId}` | Get session recordings |
| `GET` | `/api/v1/recordings/{recordingId}/stream` | Stream recording |
| `DELETE` | `/api/v1/recordings/{recordingId}` | Delete recording |

### Session Recording APIs

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/session-recordings/upload/{sessionId}` | Upload complete session recording |
| `GET` | `/api/v1/session-recordings/session/{sessionId}` | Get session recording |
| `GET` | `/api/v1/session-recordings/{recordingId}/stream` | Stream session recording |
| `DELETE` | `/api/v1/session-recordings/{recordingId}` | Delete session recording |

### API Response Structure

All endpoints return a consistent response envelope via `ApiResponse<T>`:

```json
{
  "success": true,
  "data": { },
  "message": "..."
}
```

---

## Frontend Routes

| Route | Page | Description |
|---|---|---|
| `/` | Dashboard | Statistics, recent events, activity chart |
| `/events` | Events | Paginated activity event search & filter |
| `/sessions` | Sessions | All interview sessions |
| `/sessions/:sessionId` | Session Details | Full session view with recordings & timeline |
| `/interview` | Interview Landing | Start interview flow |
| `/interview/permission` | Permission Request | Camera / mic / screen share permissions |
| `/interview/intro` | Introduction | Interview introduction screen |
| `/interview/questions` | Interview Questions | Question video + candidate recording |
| `/interview/complete` | Interview Complete | Completion confirmation |

---

## Recording System

### Question-Level Recordings

- Each interview question has an individual candidate response recording.
- The browser **MediaRecorder API** captures the candidate's response as a `.webm` file.
- Uploaded via `FormData` to the backend with `sessionId`, `candidateId`, and `questionNumber` as query parameters.
- Backend stores the physical file and recording metadata in MongoDB.
- Supports: **Start, Stop, Upload, Stream, Delete**.

### Complete Session Recording

- Records the entire interview session combining **screen sharing video** and **candidate microphone audio**.
- Begins after required permissions are granted and continues throughout the session.
- Supports: **Upload, Stream, Delete**.
- Uses **MediaRecorder** + **MediaStream** browser APIs.
- Screen share end is detected via the `ended` event on the display video track.

### Recording Data Flow

```text
Camera / Microphone / Screen
            │
            ▼
       MediaRecorder
            │
            ▼
        WebM Blob
            │
            ▼
      FormData Upload
            │
            ▼
   /api/v1/recordings/upload/{sessionId}
   /api/v1/session-recordings/upload/{sessionId}
            │
            ▼
    Recording Service → File Storage + MongoDB Metadata
```

---

## Event Queue & Beacon Batching

Activity events generated during an interview are not sent individually in real time. Instead, they flow through a **client-side queue** before being delivered reliably to the backend.

```text
logEvent() / ActivityTracker.trackEvent()
            │
            ▼
       EventQueue (localStorage)
            │
            ├── Batch threshold reached (10 events)
            │         │
            │         ▼
            │   sendBeaconBatch() → POST /api/v1/activities/beacon-batch
            │
            └── Page hide / unload
                      │
                      ▼
              flushWithBeacon() → POST /api/v1/activities/beacon-batch
```

- **`EventQueue`** — Persists events in `localStorage` with a monotonically increasing sequence number. Auto-flushes when the batch size threshold is reached.
- **`ActivityTracker`** — Singleton that initialises and owns the `EventQueue`, registers global error and page-hide listeners, and exposes `trackEvent()` and `flush()`.
- **`apiClient.sendBeaconBatch()`** — Serialises the event array as a JSON-encoded `FormData` field and delivers it via `navigator.sendBeacon()`.
- **`POST /api/v1/activities/beacon-batch`** — Backend endpoint that deserialises the JSON payload, validates each event with FluentValidation, and persists the batch.

---

## Background Processing

The `InterviewSummaryBackgroundService` is an ASP.NET Core **Hosted Background Service** that:

1. Runs continuously while the application is running
2. Creates a DI service scope per cycle
3. Retrieves completed interview sessions without existing summaries
4. Generates and stores summaries for each session
5. Handles errors per individual session without crashing the service
6. Waits **60 seconds** before the next cycle

```text
Hosted Background Service
          │
          ▼
  Find Completed Sessions (no summary)
          │
          ▼
  Generate Summary (duplicate check)
          │
          ▼
     Store Summary
          │
          ▼
    Wait 60 seconds
          │
          └──────────────────► Repeat
```

---

## Validation & Exception Handling

### FluentValidation

Validation is implemented for all request models:

**Activity Event**
- `SessionId` — Required
- `CandidateId` — Required
- `EventType` — Required
- `Module` — Required
- Maximum length validation
- Metadata length validation

**Create Interview Session Request**
- `SessionId` — Required
- `CandidateId` — Required
- `InterviewId` — Required
- Maximum length validation

**Update Interview Session (Status)**
- Status must be one of: `IN_PROGRESS`, `COMPLETED`, `ABORTED`

### Global Exception Middleware

```text
ArgumentException          →  400 Bad Request
KeyNotFoundException       →  404 Not Found
UnauthorizedAccessException→  401 Unauthorized
Unhandled Exception        →  500 Internal Server Error
```

All error responses are returned as structured JSON via `ApiResponse`.

---

## Performance Optimizations

| Optimization | Details |
|---|---|
| MongoDB Indexes | Session, event type, timestamp queries |
| Compound Index (`IX_SessionId_Timestamp`) | Ordered session timeline queries |
| TTL Index (`TTL_ActivityEvents`) | Auto-removes events after 30 days |
| Client-Side Event Queue | Events batched in `localStorage` before transmission |
| Beacon API Batch Endpoint | Multiple events sent in one `sendBeacon` call |
| Batch Event Upload | Multiple events in one API request |
| Server-Side Pagination | Only the requested page is returned |
| Recent Event Limit | Dashboard loads only N recent events |
| Parallel Dashboard Requests | Stats + recent events fetched concurrently |
| Parallel Session Detail Requests | Session info, events, recordings fetched concurrently |
| MongoDB Singleton Client | Single MongoDB connection reused across requests |

---

## Configuration

### Backend — `appsettings.json`

```json
{
  "MongoDbSettings": {
    "ConnectionString": "mongodb://localhost:27017",
    "DatabaseName": "AIInterviewTrackerDb",
    "InterviewSessionCollection": "InterviewSessions",
    "ActivityEventsCollection": "ActivityEvents",
    "InterviewSummaryCollection": "InterviewSummaries",
    "SessionRecordingCollection": "SessionRecordings"
  }
}
```

Update `ConnectionString` to match your local or deployment MongoDB instance.

> **Note:** All `MongoDbSettings` fields are eagerly validated on startup. The application will fail to start if any setting is missing or empty.

### Frontend — `.env`

```env
VITE_API_BASE_URL=https://localhost:7026/api/v1
```

Update this value when deploying to a different environment.

---

## Running the Project

### Prerequisites

Ensure the following are installed:

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) + npm
- [MongoDB](https://www.mongodb.com/try/download/community) (local instance or connection string)
- Visual Studio 2022+ / VS Code

### Backend Setup

```bash
# Navigate to backend project
cd AIInterviewActivityTracker

# Restore NuGet packages
dotnet restore

# Build the project
dotnet build

# Run the API
dotnet run
```

**Swagger UI (Development mode):**

```
https://localhost:7026/swagger
```

Use Swagger to explore, inspect, and test all API endpoints.

### Frontend Setup

```bash
# Navigate to frontend project
cd AIInterviewDashboard

# Install npm dependencies
npm install

# Start the Vite development server
npm run dev
```

**Dashboard:**

```
http://localhost:5173
```

### Frontend Scripts

| Script | Command | Description |
|---|---|---|
| Development | `npm run dev` | Start Vite dev server with HMR |
| Build | `npm run build` | Production bundle |
| Lint | `npm run lint` | ESLint check |
| Preview | `npm run preview` | Preview production build |

---

## Testing & Verification

The application has been tested across the following areas:

### Backend

- Interview Session CRUD operations
- Session status update validation
- Single and batch activity event logging
- Beacon API single-event endpoint
- Beacon API batch endpoint (JSON-encoded form field)
- Activity search, filtering, and pagination
- Dashboard statistics API
- Recent activity events API
- Session activity timeline API
- Interview summary generation
- Duplicate summary prevention
- Background summary service
- Question recording upload, streaming, and deletion
- Complete session recording upload, streaming, and deletion
- FluentValidation on all request models
- Global exception middleware
- MongoDB data storage and retrieval
- MongoDB index creation and usage
- TTL retention policy
- Fail-fast MongoDbSettings validation on startup

### Frontend

- Dashboard overview and chart
- Activity Events page with search, filter, and pagination
- Interview Sessions list with pagination
- Session Details (info, timeline, summary, recordings)
- Recording playback and deletion
- Interview Landing → Permissions → Introduction → Questions flow
- Question video playback and replay
- Candidate question recording (MediaRecorder)
- Complete session recording (screen + audio)
- Screen share ended detection and interview abort
- Interview completion flow
- Client-side event queue (`EventQueue`) with `localStorage` persistence
- Beacon batch delivery on page unload (`ActivityTracker`)
- Browser activity tracking (all event types)
- Application error and unhandled promise rejection tracking
- Tab switching detection
- Network online/offline events
- Fullscreen enter/exit events
- Responsive layout

---

## Developed By

| | |
|---|---|
| **Developer** | Arpit Gupta |
| **Project** | AI Interview Activity Tracker |
| **Backend** | ASP.NET Core Web API · C# · .NET 10 · MongoDB |
| **Frontend** | React 19 · Vite · JavaScript · Bootstrap 5 · Recharts |
| **APIs** | Axios · Beacon API · MediaRecorder API · MediaStream API |