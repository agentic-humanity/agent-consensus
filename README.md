# Agent Consensus

Multi-model discussion system - let LLMs debate like a parliament.

## Features

- 🏛️ Two discussion modes:
  - **Proposal-Review**: One model proposes, others review and score (1-10)
  - **Roundtable**: Multiple models discuss in parallel, one summarizes
- 💰 Cost tracking and budget control with OpenRouter pricing
- 📊 Full audit trail: inputs, raw outputs, summaries per round
- 🔄 Streaming responses via Server-Sent Events
- 🛡️ Secure: API keys stored server-side only
- 💾 Persistent storage with SQLite
- 📤 Export discussions as Markdown or JSON

## Tech Stack

- **Backend**: Hono (Node.js/TypeScript)
- **Frontend**: Vue 3 + Vite + Tailwind CSS + Pinia
- **Database**: SQLite via Prisma
- **Provider**: OpenRouter API (with fallback extensibility)
- **Build**: pnpm + Turborepo monorepo

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd agent-consensus
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure OpenRouter API Key**
   ```bash
   cp config/local.json.example config/local.json
   # Edit config/local.json and add your OpenRouter API key
   ```

4. **Start development servers**
   ```bash
   pnpm turbo run dev
   ```
   - API: http://localhost:8888
   - Web: http://localhost:5173

## Discussion Modes

### Proposal-Review Mode
1. Proposer model generates an initial proposal
2. Reviewer models independently evaluate and score (1-10)
3. If average score ≥ threshold (default: 7), discussion completes
4. Otherwise, feedback is collected and proposer revises
5. Repeat for up to max rounds (default: 5)

### Roundtable Mode
1. All participant models provide perspectives in parallel
2. Summarizer model consolidates into final output
3. Single round discussion

## API Endpoints

- `POST /api/sessions` - Create a new discussion session
- `GET /api/sessions` - List sessions (with filtering)
- `GET /api/sessions/:id` - Get session details
- `POST /api/sessions/:id/start` - Start discussion (SSE stream)
- `GET /api/sessions/:id/export` - Export as Markdown
- `GET /api/sessions/:id/export?format=json` - Export as JSON
- `GET /api/models` - Get available models with pricing
- `GET /api/config` - Get public configuration

## Data Model

Sessions contain rounds, which contain events (individual model calls). Each event tracks:
- Raw model output
- Parsed score (if applicable)
- Cost in USD
- Latency
- Timestamps

## Cost Control

- Set budget limit when creating session
- Real-time cost tracking per model call
- Automatic stop when budget exceeded
- Cost estimates shown before starting discussion

## Development

### Prisma Commands
```bash
# Generate Prisma client
pnpm --filter @consensus/api prisma generate

# Push schema changes
pnpm --filter @consensus/api prisma db push

# Reset database (development only)
pnpm --filter @consensus/api prisma migrate reset
```

### Testing
```bash
# Run all tests
pnpm turbo run test

# Run tests for specific package
pnpm --filter @consensus/core test
```

## License

MIT

## Acknowledgments

Inspired by parliamentary debate formats and collective intelligence systems.
Built with Vue 3, Hono, and OpenRouter.