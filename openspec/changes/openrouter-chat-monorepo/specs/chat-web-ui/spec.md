## ADDED Requirements

### Requirement: Render a single chat page
The web app SHALL provide a single page that includes:
- a transcript of messages in the current in-memory conversation
- a text input area for composing a message
- a send button
- a loading state while awaiting a response
- an error state that displays failures without crashing

#### Scenario: Initial page load
- **WHEN** the user opens the web app
- **THEN** the transcript and composer are visible

### Requirement: Send messages to the API
When the user sends a message, the web app MUST call `POST /api/chat` with the current conversation messages.
The web app MUST call the API using a relative path (same-origin) and MUST NOT include any API key.

#### Scenario: Sending a message
- **WHEN** the user enters text and clicks Send
- **THEN** the web app issues `POST /api/chat` to `/api/chat` with the messages payload

### Requirement: Update transcript with assistant reply
On a successful API response, the web app MUST append the returned assistant message to the transcript.

#### Scenario: Assistant reply appears
- **WHEN** the API returns a successful assistant `message`
- **THEN** the transcript renders the assistant message content

### Requirement: Loading state
While a request is in flight, the web app MUST present a loading state and MUST prevent duplicate sends.

#### Scenario: Duplicate send prevented
- **WHEN** the user clicks Send while a previous request is still pending
- **THEN** the web app does not create a second in-flight request

### Requirement: Error state
If the API responds with a non-2xx status or a network failure occurs, the web app MUST display an error state and MUST allow the user to try again.

#### Scenario: API error displayed
- **WHEN** the API responds with HTTP 400 or 502
- **THEN** the UI displays an error message and remains usable

### Requirement: No persistence
The web app MUST NOT persist chat history across page reloads (no local storage, indexeddb, or server sessions).

#### Scenario: Reload clears transcript
- **WHEN** the user reloads the page
- **THEN** previously sent messages are not restored
