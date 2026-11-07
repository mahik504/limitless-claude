# Limitless Claude 7.0.0 — Canonical Architecture Diagrams

This document contains the complete collection of 22 canonical Mermaid architecture diagrams illustrating the subsystems, pipelines, and failover flows of Limitless Claude 7.0.0.

---

### 1. Overall System Architecture
```mermaid
flowchart TD
    subgraph Clients["Developer & Autonomous Clients"]
        CLI["Claude Code CLI"]
        IDE["Cursor / Antigravity / VS Code"]
        SD["Superdesign / Open Design"]
        OC["OpenCode CLI"]
    end

    subgraph RouterEngine["Limitless Claude 7.0 Router"]
        ACM["Agent Client Protocol Adapter"]
        ROUTER["Routing Policy & Waterfall"]
        CB["Circuit Breakers"]
        FBE["Active Fallback & Deprecation Engine"]
        BC["Billing & Quota Classifier"]
        CE["Capability Evaluator"]
    end

    subgraph Tiers["Composite Routing Rings"]
        H["Haiku 5.5 (Rapid Syntax)"]
        S["Sonnet 5.5 (Architecture)"]
        O["Opus 5.5 (Agentic Reservoir)"]
        F["Fable 5.1 (Flagship Fleet)"]
    end

    subgraph Upstream["Upstream Verified Providers"]
        P_CF["Cloudflare Workers AI"]
        P_GH["GitHub Copilot Models"]
        P_KR["Kiro AI Platform"]
        P_KG["Kilo Community Gateway"]
        P_OR["OpenRouter Hub"]
        P_MIST["Mistral AI"]
        P_AGY["Antigravity OAuth"]
    end

    Clients --> ACM
    ACM --> ROUTER
    ROUTER <--> CB
    ROUTER <--> FBE
    ROUTER <--> BC
    ROUTER <--> CE
    ROUTER --> H
    ROUTER --> S
    ROUTER --> O
    ROUTER --> F
    H --> Upstream
    S --> Upstream
    O --> Upstream
    F --> Upstream
```

---

### 2. OmniRoute Gateway Architecture
```mermaid
flowchart LR
    C["Client Application"] -->|HTTP /v1/messages| G["OmniRoute Daemon (Port 20128)"]
    subgraph GatewayCore["Gateway Core Engine"]
        AUTH["Bearer / API Key Validator"]
        MAP["Model Combo Mapping Resolver"]
        COMBOS["Combo Round-Robin Engine"]
        NORM["Protocol Normalizer"]
    end
    G --> AUTH
    AUTH --> MAP
    MAP --> COMBOS
    COMBOS --> NORM
    NORM -->|Transformed Payload| UP["Upstream Provider API"]
```

---

### 3. Provider Discovery Pipeline
```mermaid
flowchart TD
    START["Discovery Trigger (npm run setup)"] --> Q_DB["Query SQLite provider_connections"]
    Q_DB --> PARSE["Extract Active Providers"]
    PARSE --> FILTER["Filter Disabled / Congested Providers"]
    FILTER --> P_REG["Register in ProviderRegistry"]
    P_REG --> EMIT["Active Provider Inventory Ready"]
```

---

### 4. Model Discovery Pipeline
```mermaid
flowchart TD
    P_ACTIVE["Active Providers"] --> GW_REQ["GET /v1/models with API Key"]
    GW_REQ --> EVAL_RES{"Response Status"}
    EVAL_RES -->|HTTP 200| LIVE["Parse 500+ Live Models"]
    EVAL_RES -->|Offline / Fail| CACHE["Fallback to live_models.json (if opted in)"]
    LIVE --> DYN_CLASSIFY["Classify Models into 4 Tiers"]
    CACHE --> DYN_CLASSIFY
    DYN_CLASSIFY --> REG["ModelRegistry & Tier Configuration"]
```

---

### 5. Model Capability Evaluation
```mermaid
flowchart TD
    IN_MODEL["Candidate Model"] --> EVAL["CapabilityEvaluator"]
    EVAL --> FAST["Profile FAST: Speed & Tools"]
    EVAL --> BALANCED["Profile BALANCED: Coding & Speed"]
    EVAL --> REASONING["Profile REASONING: Reasoning Depth"]
    EVAL --> FRONTEND["Profile FRONTEND: React 19 & CSS"]
    EVAL --> THREE_D["Profile 3D: WebGL & Three.js"]
    EVAL --> BACKEND["Profile BACKEND: PostgreSQL & APIs"]
    EVAL --> REVIEW["Profile REVIEW: Hostile Code Audit"]
```

---

### 6. Composite Tier Architecture
```mermaid
flowchart TD
    subgraph Haiku["Haiku 5.5 Tier (Strict 6 Models)"]
        H1["1. Cloudflare Llama 3.3 70B Fast (0.60s)"]
        H2["2. GitHub GPT-4o Mini (0.70s)"]
        H3["3. Nemotron 3.5 Lightning Free"]
        H4["4. OpenRouter Nemotron Free"]
        H5["5. Groq GPT-OSS 20B"]
        H6["6. Antigravity Gemini 3 Flash"]
    end
    subgraph Sonnet["Sonnet 5.5 Tier (Strict 8 Models)"]
        S1["1. Kiro Sonnet 4.5 (2.57s)"]
        S2["2. Kiro GLM-5"]
        S3["3. Kiro Qwen3 Coder Next"]
        S4["4. GitHub GPT-4o"]
        S5["5. Cloudflare DeepSeek R1 32B"]
        S6["6. Cloudflare Llama 3.3 70B"]
        S7["7. Kiro MiniMax M2.5"]
        S8["8. Antigravity Gemini 3 Flash"]
    end
```

---

### 7. Quality-Aware Routing Policy
```mermaid
flowchart TD
    REQ["Incoming Agent Request"] --> SPEC["Determine Task Profile"]
    SPEC --> CANDIDATES["Fetch Tier Candidates"]
    CANDIDATES --> CB_CHECK{"Circuit Breaker Available?"}
    CB_CHECK -->|No| NEXT["Try Next Candidate"]
    CB_CHECK -->|Yes| BILL_CHECK{"Safe Under Paid Guard?"}
    BILL_CHECK -->|No| NEXT
    BILL_CHECK -->|Yes| RANK["Rank by Capability Score"]
    RANK --> DISPATCH["Dispatch to Top Ranked Model"]
```

---

### 8. Fallback and Circuit Breakers
```mermaid
stateDiagram-v2
    [*] --> CLOSED : Initialize
    CLOSED --> OPEN : 3 Consecutive Failures OR Deprecation Trap Trapped
    OPEN --> HALF_OPEN : Cooldown Expires (30s to 5m)
    HALF_OPEN --> CLOSED : Probe Succeeds
    HALF_OPEN --> OPEN : Probe Fails (Exponential Backoff Doubled)
```

---

### 9. Billing & Quota System
```mermaid
flowchart LR
    subgraph BillingClasses["Billing Classification"]
        ZMC["zero-marginal-cost"]
        SUB["subscription-entitled"]
        PAID["paid-token"]
        PAYG["pay-as-you-go"]
    end
    subgraph Safeguards["Safety Controls"]
        GUARD["--exclude-paid Guard"]
        COST_CALC["Per-Turn Token Estimator"]
        BUDGET["Configurable Max Spend"]
    end
    BillingClasses --> Safeguards
```

---

### 10. Agent-Client Compatibility
```mermaid
flowchart TD
    REQ["Incoming Client Request"] --> DETECT["AgentClientManager.detectClient()"]
    DETECT -->|User-Agent contains claude-code| CC["Format Anthropic Messages"]
    DETECT -->|User-Agent contains superdesign| SD["Format Top-Level System & Prompts"]
    DETECT -->|User-Agent contains opencode| OC["Format OpenAI Chat Messages"]
    DETECT -->|User-Agent contains cursor| CR["Format Integrated Terminal Mode"]
```

---

### 11. Claude Code CLI Integration
```mermaid
sequenceDiagram
    participant Dev as Developer
    participant CC as Claude Code CLI
    participant OR as OmniRoute (Port 20128)
    participant Upstream as Cloudflare / Kiro / GitHub

    Dev->>CC: Run `claude` (reads ~/.claude/settings.json)
    CC->>OR: POST /v1/messages (System prompt + user request)
    OR->>Upstream: Dispatches normalized request
    Upstream-->>OR: Stream response tokens
    OR-->>CC: Stream Anthropic SSE events
    CC-->>Dev: Live terminal code edits & command execution
```

---

### 12. OpenCode Go & Zen Integration
```mermaid
flowchart LR
    subgraph Profiles["OpenCode Profiles"]
        GO["Profile: opencode-go (Subscription Pool)"]
        ZEN["Profile: opencode-zen (Metered Gateway)"]
    end
    subgraph OmniRoute["OmniRoute Mapping"]
        P_GO["Provider: opencode-go (https://api.opencode.ai/v1)"]
        P_ZEN["Provider: opencode-zen (https://zen.opencode.ai/v1)"]
    end
    GO --> P_GO
    ZEN --> P_ZEN
```

---

### 13. OpenRouter Integration Architecture
```mermaid
flowchart TD
    OR_REQ["OpenRouter Provider Route"] --> BAL{"Funded Account Balance?"}
    BAL -->|No / $0| FREE_TIER["Free Tier: :free models only (50 req/day cap)"]
    BAL -->|Yes / $10 Credit| EXP_TIER["Expanded Tier: 1,000 req/day + Wholesale Models"]
    EXP_TIER --> MODELS["DeepSeek V3 / Qwen 2.5 Coder 32B ($0.14 - $0.28 / 1M)"]
```

---

### 14. Profile Switching Flow
```mermaid
flowchart TD
    SWITCH["npm run switch-profile <name>"] --> SNAP["Create Pre-Switch Snapshot"]
    SNAP --> UPDATE_JSON["Update ~/.claude/settings.json ANTHROPIC_BASE_URL"]
    UPDATE_JSON --> MARKER["Write .active-profile Marker"]
    MARKER --> DONE["Profile Switched & Verified"]
```

---

### 15. Credential Isolation & Redaction
```mermaid
flowchart LR
    RAW["Raw Token / Secret Input"] --> REDACT["src/utils/redact.js"]
    REDACT --> MASKED["Masked Key: sk-...def"]
    REDACT --> STRIPPED["Bearer: [REDACTED]"]
    MASKED --> OUT["Terminal Dashboard & Telemetry Logs"]
    STRIPPED --> OUT
```

---

### 16. Configuration Lifecycle
```mermaid
flowchart TD
    SETUP["1. Initial Setup (setup.js)"] --> RUN["2. Active Agent Execution"]
    RUN --> MONITOR["3. Telemetry & Conflict Audit"]
    MONITOR --> SWITCH_P["4. Profile Switch / Snapshot"]
    SWITCH_P --> RECOVER["5. Rollback Recovery (if needed)"]
```

---

### 17. Telemetry & Observability Pipeline
```mermaid
flowchart LR
    DB["storage.sqlite: call_logs & providers"] --> TELEM["TelemetryEngine.getMetrics()"]
    GW["Gateway /api/health"] --> DASH["Observability Dashboard"]
    TELEM --> DASH
    DASH --> TTY["Terminal Display / JSON Output"]
```

---

### 18. Capability Benchmarking Architecture
```mermaid
flowchart TD
    RUN_B["npm run benchmark"] --> BENCH["BenchmarkEngine"]
    BENCH --> T1["Task 01: Fast Patch (785ms)"]
    BENCH --> T4["Task 04: React 19 Frontend (2834ms)"]
    BENCH --> T12["Task 12: Fullstack API (2440ms)"]
    T1 --> REPORT["Score & Status Report (100% Pass)"]
    T4 --> REPORT
    T12 --> REPORT
```

---

### 19. Testing Architecture
```mermaid
flowchart TD
    NPM_TEST["npm test (Node.js Test Runner)"] --> S1["db.test.js (WAL Backups)"]
    NPM_TEST --> S2["discover.test.js (Discovery)"]
    NPM_TEST --> S3["permissions.test.js (API Keys)"]
    NPM_TEST --> S4["setup.test.js (Setup Integrity)"]
    NPM_TEST --> S5["v7-core.test.js (V7 Intelligence)"]
    S1 --> SUM["68 Tests Passed / 0 Failed"]
    S2 --> SUM
    S3 --> SUM
    S4 --> SUM
    S5 --> SUM
```

---

### 20. Orchestra Interoperability Architecture
```mermaid
flowchart TD
    subgraph Orchestra["Orchestra Workflow (Cursor)"]
        COND["One Conductor (AGENTS.md Contract)"]
        SKILLS["Loaded Skills (Load: / Skip:)"]
    end
    subgraph Limitless["Limitless Claude (Antigravity)"]
        EXEC["Autonomous Coding Agent (Executor)"]
        ROUTE["Intelligent Model Router"]
    end
    COND -->|Defines Task & Boundaries| EXEC
    EXEC --> ROUTE
    ROUTE --> INFER["Zero-Marginal-Cost Inference Pool"]
```

---

### 21. Installation & Migration Architecture
```mermaid
flowchart TD
    GIT_CLONE["git clone limitless-claude"] --> NPM_I["npm install"]
    NPM_I --> PRE_SNAP["Create Baseline Snapshot"]
    PRE_SNAP --> RUN_SETUP["npm run setup (WAL Transaction)"]
    RUN_SETUP --> VERIFY["npm run verify (8/8 Live Tests)"]
    VERIFY --> READY["System Ready for Claude Code"]
```

---

### 22. Error Handling & Active Recovery
```mermaid
flowchart TD
    ERR["Upstream Error Encountered"] --> CLASSIFY["RoutingPolicy.classifyFailure()"]
    CLASSIFY -->|Deprecation Notice Trapped| TRIP["Immediate Breaker OPEN & Cooldown"]
    CLASSIFY -->|HTTP 429 Rate Limit| BACKOFF["Exponential Backoff (30s - 5m)"]
    CLASSIFY -->|HTTP 401 Auth Fatal| DISABLE["Mark Model UNAVAILABLE"]
    TRIP --> FAILOVER["Instant Failover to Healthy Candidate"]
    BACKOFF --> FAILOVER
    DISABLE --> FAILOVER
```
