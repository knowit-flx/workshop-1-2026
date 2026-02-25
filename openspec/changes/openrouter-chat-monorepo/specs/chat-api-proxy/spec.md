## ADDED Requirements

### Requirement: Accept chat requests
The API SHALL expose `POST /api/chat` that accepts a JSON body with:
- `messages`: an array of message objects
- `model` (optional): a model identifier string
- `reasoningEnabled` (optional): boolean

#### Scenario: Minimal valid request
- **WHEN** the client sends `POST /api/chat` with a `messages` array containing at least one `{ role, content }`
- **THEN** the API returns a JSON response with a single assistant `message`

### Requirement: Validate request payload
The API MUST reject invalid request payloads with HTTP 400.
At minimum, validation MUST ensure:
- `messages` exists and is an array
- each `messages[i].role` is one of `system|user|assistant`
- each `messages[i].content` is a string
- if present, each `messages[i].reasoning_details` is accepted as opaque JSON
- if present, `model` is a string
- if present, `reasoningEnabled` is a boolean

#### Scenario: Invalid payload returns 400
- **WHEN** the client sends `POST /api/chat` with a missing or non-array `messages`
- **THEN** the API responds with HTTP 400

### Requirement: Proxy to OpenRouter
The API MUST call OpenRouter on behalf of the client using a server-side API key.
The API MUST NOT require the client to provide any provider credentials.

#### Scenario: Server-side credential use
- **WHEN** the API processes a valid chat request
- **THEN** the upstream provider call uses a server-side `API_KEY` and not a client-supplied key

### Requirement: Model selection
If the request includes `model`, the API MUST use that model.
Otherwise, the API MUST use `MODEL` from the server environment when set; if not set, the API MUST use a documented default model.

#### Scenario: Request model overrides default
- **WHEN** the client sends a valid request with `model: "some/model"`
- **THEN** the API uses `some/model` for the upstream call

### Requirement: Optional reasoning enablement
If the request includes `reasoningEnabled: true`, the API MUST request reasoning from the provider using the provider's supported mechanism.

#### Scenario: Reasoning requested
- **WHEN** the client sends `reasoningEnabled: true`
- **THEN** the upstream request includes reasoning enablement

### Requirement: Preserve reasoning details
If the provider returns assistant `reasoning_details`, the API MUST include `reasoning_details` in its response message without modification.
If the client sends assistant messages that include `reasoning_details`, the API MUST forward those values upstream without modification.

#### Scenario: Provider reasoning details round-trip
- **WHEN** the provider returns an assistant message with `reasoning_details`
- **THEN** the API response includes the same `reasoning_details` value

### Requirement: Response shape
On success, the API MUST respond with JSON in the shape:
`{ "message": { "role": "assistant", "content": string, "reasoning_details"?: unknown } }`.

#### Scenario: Successful response includes assistant message
- **WHEN** the upstream provider returns an assistant message
- **THEN** the API returns HTTP 200 with a `message.role` of `assistant`

### Requirement: Error handling
For upstream/provider failures, the API MUST respond with HTTP 502 and a safe error message.
The API MUST NOT expose provider secrets or raw stack traces in responses.

#### Scenario: Upstream failure returns 502
- **WHEN** the upstream provider call fails
- **THEN** the API responds with HTTP 502 and a non-sensitive error message
