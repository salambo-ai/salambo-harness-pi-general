# PI Agent Event Catalog

This file catalogs the event surfaces exposed by the installed PI packages in this repo:

- `@mariozechner/pi-coding-agent@0.64.0`
- `@mariozechner/pi-agent-core@0.64.0`
- `@mariozechner/pi-ai@0.64.0`

This is split into four layers because PI uses the word "event" for different things:

1. `AgentSession.subscribe()` / `--mode json` events
2. Nested `assistantMessageEvent` streaming delta events
3. RPC stdout-only protocol records
4. Extension-only lifecycle hook events

For Salambo mapping, the raw objects we currently forward from PI come from `session.subscribe(...)`, so sections 1 and 2 are the primary mapping surface for our integration.

## 1. AgentSession.subscribe() / JSON Mode Events

These are the full `AgentSessionEvent` values emitted by `AgentSession.subscribe()` and written by `pi --mode json` after the session header.

### 1.1 Core agent events

| Type | Fields |
|---|---|
| `agent_start` | none |
| `agent_end` | `messages: AgentMessage[]` |
| `turn_start` | none |
| `turn_end` | `message: AgentMessage`, `toolResults: ToolResultMessage[]` |
| `message_start` | `message: AgentMessage` |
| `message_update` | `message: AgentMessage`, `assistantMessageEvent: AssistantMessageEvent` |
| `message_end` | `message: AgentMessage` |
| `tool_execution_start` | `toolCallId: string`, `toolName: string`, `args: any` |
| `tool_execution_update` | `toolCallId: string`, `toolName: string`, `args: any`, `partialResult: any` |
| `tool_execution_end` | `toolCallId: string`, `toolName: string`, `result: any`, `isError: boolean` |

### 1.2 Session-specific events

| Type | Fields |
|---|---|
| `queue_update` | `steering: readonly string[]`, `followUp: readonly string[]` |
| `compaction_start` | `reason: "manual" | "threshold" | "overflow"` |
| `compaction_end` | `reason: "manual" | "threshold" | "overflow"`, `result: CompactionResult | undefined`, `aborted: boolean`, `willRetry: boolean`, `errorMessage?: string` |
| `auto_retry_start` | `attempt: number`, `maxAttempts: number`, `delayMs: number`, `errorMessage: string` |
| `auto_retry_end` | `success: boolean`, `attempt: number`, `finalError?: string` |

### 1.3 Notes on the top-level event stream

- `message_update` is the only top-level event that carries nested streaming deltas.
- `tool_execution_update.partialResult` is the accumulated partial result so far, not just the delta chunk.
- `agent_end.messages` contains all new messages created during that run.
- `turn_end.toolResults` contains the tool results associated with that turn.
- There is no top-level `extension_error` in `AgentSessionEvent`.
- There is no top-level event for `BashExecutionMessage`; the standalone RPC `bash` command writes session state but does not emit a dedicated session event for that message type.

## 2. Nested assistantMessageEvent Delta Events

These are the full `AssistantMessageEvent` variants that can appear inside top-level `message_update.assistantMessageEvent`.

| Type | Fields |
|---|---|
| `start` | `partial: AssistantMessage` |
| `text_start` | `contentIndex: number`, `partial: AssistantMessage` |
| `text_delta` | `contentIndex: number`, `delta: string`, `partial: AssistantMessage` |
| `text_end` | `contentIndex: number`, `content: string`, `partial: AssistantMessage` |
| `thinking_start` | `contentIndex: number`, `partial: AssistantMessage` |
| `thinking_delta` | `contentIndex: number`, `delta: string`, `partial: AssistantMessage` |
| `thinking_end` | `contentIndex: number`, `content: string`, `partial: AssistantMessage` |
| `toolcall_start` | `contentIndex: number`, `partial: AssistantMessage` |
| `toolcall_delta` | `contentIndex: number`, `delta: string`, `partial: AssistantMessage` |
| `toolcall_end` | `contentIndex: number`, `toolCall: ToolCall`, `partial: AssistantMessage` |
| `done` | `reason: "stop" | "length" | "toolUse"`, `message: AssistantMessage` |
| `error` | `reason: "aborted" | "error"`, `error: AssistantMessage` |

### 2.1 Important nested-event notes

- `start` is the message-stream start signal before content block deltas.
- `contentIndex` points to the assistant message content block being streamed.
- `toolcall_delta` streams tool-call arguments incrementally as text.
- `toolcall_end` is the first nested event that gives the full parsed `toolCall` object.
- `done` and `error` terminate the assistant stream.
- The full assistant-level stop reason enum is:
  - `"stop"`
  - `"length"`
  - `"toolUse"`
  - `"error"`
  - `"aborted"`

## 3. Message and Payload Types Referenced by Events

These are not extra event types, but they appear inside the emitted events and usually matter for mapping.

### 3.1 AgentMessage union

`AgentMessage` can be:

- `UserMessage`
- `AssistantMessage`
- `ToolResultMessage`
- PI custom message types added by the coding-agent layer

In practice, the PI session machinery also persists and uses:

- `BashExecutionMessage`
- `CustomMessage`
- `BranchSummaryMessage`
- `CompactionSummaryMessage`

### 3.2 Assistant message content block types

Inside `AssistantMessage.content`, PI can emit:

- `text`
- `thinking`
- `toolCall`

These are message content block types, not top-level events.

### 3.3 Tool result shape

`ToolResultMessage` carries:

- `role: "toolResult"`
- `toolCallId: string`
- `toolName: string`
- `content: (TextContent | ImageContent)[]`
- `details?: unknown`
- `isError: boolean`
- `timestamp: number`

## 4. JSON Mode Framing

`pi --mode json` writes one session header line first, then streams `AgentSessionEvent` lines.

### 4.1 Session header record

| Type | Fields |
|---|---|
| `session` | `version?: number`, `id: string`, `timestamp: string`, `cwd: string`, `parentSession?: string` |

Notes:

- Current session version in the installed package is `3`.
- This `session` record is a JSON-mode framing/header record, not part of `AgentSessionEvent`.

### 4.2 Full JSON mode sequence

Typical order:

1. `session` header
2. `agent_start`
3. `turn_start`
4. `message_start`
5. zero or more `message_update`
6. `message_end`
7. zero or more tool execution events
8. `turn_end`
9. `agent_end`

Additional session-level records such as `queue_update`, `compaction_*`, and `auto_retry_*` can appear in between.

## 5. RPC Stdout Records

These are records PI can emit on stdout in `pi --mode rpc`. This layer is broader than `AgentSessionEvent`.

### 5.1 RPC responses

Every command response uses:

| Type | Fields |
|---|---|
| `response` | `id?: string`, `command: string`, `success: boolean`, plus `data` on success or `error` on failure |

`response` is a protocol record, not an `AgentSessionEvent`.

### 5.2 RPC streamed session events

RPC mode forwards all `AgentSessionEvent` values from sections 1 and 2 directly to stdout.

### 5.3 RPC extension UI requests

RPC mode can also emit `extension_ui_request` records when an extension asks the host for UI behavior.

| Method | Fields |
|---|---|
| `select` | `type: "extension_ui_request"`, `id`, `method: "select"`, `title`, `options: string[]`, `timeout?: number` |
| `confirm` | `type: "extension_ui_request"`, `id`, `method: "confirm"`, `title`, `message`, `timeout?: number` |
| `input` | `type: "extension_ui_request"`, `id`, `method: "input"`, `title`, `placeholder?: string`, `timeout?: number` |
| `editor` | `type: "extension_ui_request"`, `id`, `method: "editor"`, `title`, `prefill?: string` |
| `notify` | `type: "extension_ui_request"`, `id`, `method: "notify"`, `message`, `notifyType?: "info" | "warning" | "error"` |
| `setStatus` | `type: "extension_ui_request"`, `id`, `method: "setStatus"`, `statusKey`, `statusText: string \| undefined` |
| `setWidget` | `type: "extension_ui_request"`, `id`, `method: "setWidget"`, `widgetKey`, `widgetLines: string[] \| undefined`, `widgetPlacement?: "aboveEditor" | "belowEditor"` |
| `setTitle` | `type: "extension_ui_request"`, `id`, `method: "setTitle"`, `title` |
| `set_editor_text` | `type: "extension_ui_request"`, `id`, `method: "set_editor_text"`, `text` |

### 5.4 RPC extension_error

RPC mode also emits:

| Type | Fields |
|---|---|
| `extension_error` | `extensionPath: string`, `event: string`, `error: string` |

Important note:

- `extension_error` is documented in `docs/rpc.md` and emitted by `dist/modes/rpc/rpc-mode.js`.
- It is **not** included in the published `dist/modes/rpc/rpc-types.d.ts` union.
- Treat it as a real runtime event even though the generated TypeScript RPC types are incomplete here.

## 6. Proxy Transport Event Surface

If PI is using the lower-level proxy transport in `@mariozechner/pi-agent-core/streamProxy`, there is also a reduced proxy-stream event protocol.

This is not the same as `AgentSession.subscribe()`, but it is a real built-in event surface in the installed packages.

### 6.1 ProxyAssistantMessageEvent

| Type | Fields |
|---|---|
| `start` | none |
| `text_start` | `contentIndex: number` |
| `text_delta` | `contentIndex: number`, `delta: string` |
| `text_end` | `contentIndex: number`, `contentSignature?: string` |
| `thinking_start` | `contentIndex: number` |
| `thinking_delta` | `contentIndex: number`, `delta: string` |
| `thinking_end` | `contentIndex: number`, `contentSignature?: string` |
| `toolcall_start` | `contentIndex: number`, `id: string`, `toolName: string` |
| `toolcall_delta` | `contentIndex: number`, `delta: string` |
| `toolcall_end` | `contentIndex: number` |
| `done` | `reason: "stop" | "length" | "toolUse"`, `usage: AssistantMessage["usage"]` |
| `error` | `reason: "aborted" | "error"`, `errorMessage?: string`, `usage: AssistantMessage["usage"]` |

### 6.2 Proxy transport note

- This proxy form is intentionally smaller than `AssistantMessageEvent`.
- The client reconstructs the full `partial` assistant message locally.
- This proxy transport is separate from the main session event stream we currently forward from Salambo.

## 7. Extension-Only Lifecycle Hook Events

These are emitted internally to PI extensions through `pi.on(...)`. They are not the same thing as `session.subscribe(...)` output, but they are part of PI's event surface.

### 7.1 Startup / resource / session-management hooks

- `resources_discover`
- `session_directory`
- `session_start`
- `session_before_switch`
- `session_switch`
- `session_before_fork`
- `session_fork`
- `session_before_compact`
- `session_compact`
- `session_shutdown`
- `session_before_tree`
- `session_tree`

### 7.2 Agent lifecycle / message / tool hooks

- `context`
- `before_provider_request`
- `before_agent_start`
- `agent_start`
- `agent_end`
- `turn_start`
- `turn_end`
- `message_start`
- `message_update`
- `message_end`
- `tool_execution_start`
- `tool_execution_update`
- `tool_execution_end`
- `model_select`
- `tool_call`
- `tool_result`
- `user_bash`
- `input`

### 7.3 Extension-only hook notes

- `tool_call` is mutable and can block tool execution.
- `tool_result` can modify tool results before final emission.
- `before_agent_start` can inject a custom message and/or override the system prompt for the turn.
- `session_before_*` hooks can cancel certain operations.
- These hooks are consumed inside extensions and are not automatically exposed as `AgentSessionEvent`s.

### 7.4 Custom extension event bus

Extensions also get a shared event bus via `pi.events`.

- Built-in event bus names are not fixed here.
- Extensions can emit arbitrary custom names such as `my:event`.
- Because those names are extension-defined and open-ended, they are not enumerable as part of PI's built-in event catalog.

## 8. Exact "Do Not Miss These" Mapping Checklist

If you are building a custom mapping layer for the stream we currently forward from Salambo's PI runner, you must handle all of these:

### 8.1 Top-level streamed events

- `agent_start`
- `agent_end`
- `turn_start`
- `turn_end`
- `message_start`
- `message_update`
- `message_end`
- `tool_execution_start`
- `tool_execution_update`
- `tool_execution_end`
- `queue_update`
- `compaction_start`
- `compaction_end`
- `auto_retry_start`
- `auto_retry_end`

### 8.2 Nested `message_update.assistantMessageEvent` variants

- `start`
- `text_start`
- `text_delta`
- `text_end`
- `thinking_start`
- `thinking_delta`
- `thinking_end`
- `toolcall_start`
- `toolcall_delta`
- `toolcall_end`
- `done`
- `error`

### 8.3 If using CLI protocol modes directly

Also account for:

- JSON mode session header: `session`
- RPC protocol responses: `response`
- RPC extension UI records: `extension_ui_request`
- RPC extension failure records: `extension_error`

### 8.4 If using proxy transport directly

Also account for:

- `ProxyAssistantMessageEvent` variants from section 6

## 9. Source Files Used To Build This Catalog

Installed package files inspected for this catalog:

- `node_modules/@mariozechner/pi-coding-agent/dist/core/agent-session.d.ts`
- `node_modules/@mariozechner/pi-agent-core/dist/types.d.ts`
- `node_modules/@mariozechner/pi-ai/dist/types.d.ts`
- `node_modules/@mariozechner/pi-coding-agent/dist/core/session-manager.d.ts`
- `node_modules/@mariozechner/pi-coding-agent/dist/modes/rpc/rpc-types.d.ts`
- `node_modules/@mariozechner/pi-coding-agent/dist/modes/rpc/rpc-mode.js`
- `node_modules/@mariozechner/pi-coding-agent/dist/modes/print-mode.js`
- `node_modules/@mariozechner/pi-agent-core/dist/proxy.d.ts`
- `node_modules/@mariozechner/pi-agent-core/dist/proxy.js`
- `node_modules/@mariozechner/pi-coding-agent/docs/json.md`
- `node_modules/@mariozechner/pi-coding-agent/docs/rpc.md`
- `node_modules/@mariozechner/pi-coding-agent/dist/core/extensions/types.d.ts`
