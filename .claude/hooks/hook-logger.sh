#!/bin/bash

# Claude Code Hook Logger - ONE Platform
# Handles logging for hook execution with 6-dimension ontology context
# Logs hook execution as EVENTS with dimension tracking

LOG_FILE="${LOG_FILE:-$CLAUDE_PROJECT_DIR/.claude/hooks.log}"
DEBUG_MODE="${DEBUG_MODE:-false}"
INFERENCE_STATE_FILE="${CLAUDE_PROJECT_DIR}/.claude/state/inference.json"
ONTOLOGY_VERSION="1.0.0"

# Create log directory if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"

# Function to get current inference context from state
get_inference_context() {
  if [ -f "$INFERENCE_STATE_FILE" ]; then
    local current_inference=$(cat "$INFERENCE_STATE_FILE" | grep -o '"current_inference": [0-9]*' | awk '{print $2}')
    echo "${current_inference:-0}"
  else
    echo "0"
  fi
}

# Function to map inference number to dimension
# Based on 100-inference sequence in one/knowledge/todo.md
get_inference_dimension() {
  local inference="$1"

  if [ "$inference" -ge 1 ] && [ "$inference" -le 10 ]; then
    echo "foundation"
  elif [ "$inference" -ge 11 ] && [ "$inference" -le 20 ]; then
    echo "things"  # Backend Schema & Services
  elif [ "$inference" -ge 21 ] && [ "$inference" -le 30 ]; then
    echo "things"  # Frontend Pages & Components
  elif [ "$inference" -ge 31 ] && [ "$inference" -le 40 ]; then
    echo "connections"  # Integration & Connections
  elif [ "$inference" -ge 41 ] && [ "$inference" -le 50 ]; then
    echo "people"  # Authentication & Authorization
  elif [ "$inference" -ge 51 ] && [ "$inference" -le 60 ]; then
    echo "knowledge"  # Knowledge & RAG
  elif [ "$inference" -ge 61 ] && [ "$inference" -le 70 ]; then
    echo "quality"  # Quality & Testing
  elif [ "$inference" -ge 71 ] && [ "$inference" -le 80 ]; then
    echo "design"  # Design & Wireframes
  elif [ "$inference" -ge 81 ] && [ "$inference" -le 90 ]; then
    echo "events"  # Performance & Optimization
  elif [ "$inference" -ge 91 ] && [ "$inference" -le 100 ]; then
    echo "deployment"  # Deployment & Documentation
  else
    echo "unknown"
  fi
}

# Function to detect specialist agent from hook name or context
get_specialist_agent() {
  local hook_name="$1"

  case "$hook_name" in
    *backend*|*mutation*|*query*|*schema*)
      echo "agent-backend"
      ;;
    *frontend*|*component*|*page*|*ui*)
      echo "agent-frontend"
      ;;
    *integration*|*webhook*|*sync*)
      echo "agent-integrator"
      ;;
    *test*|*quality*)
      echo "agent-quality"
      ;;
    *design*|*wireframe*)
      echo "agent-designer"
      ;;
    *clean*|*refactor*)
      echo "agent-clean"
      ;;
    *deploy*|*release*)
      echo "agent-ops"
      ;;
    *problem*|*debug*)
      echo "agent-problem-solver"
      ;;
    *document*|*doc*)
      echo "agent-documenter"
      ;;
    *)
      echo "agent-director"
      ;;
  esac
}

# Function to log messages with ontology context
log_message() {
  local level="$1"
  local message="$2"
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  local inference=$(get_inference_context)
  local dimension=$(get_inference_dimension "$inference")

  # Format: [timestamp] [level] [Infer N] [dimension] message
  echo "[$timestamp] [$level] [Infer $inference] [$dimension] $message" >> "$LOG_FILE"

  if [ "$DEBUG_MODE" = "true" ]; then
    echo "[$timestamp] [$level] [Infer $inference] [$dimension] $message" >&2
  fi
}

# Function to log hook execution as EVENT
log_hook_execution() {
  local hook_name="$1"
  local command="$2"
  local start_time="$3"
  local end_time="$4"
  local exit_code="$5"

  local duration=$((end_time - start_time))
  local inference=$(get_inference_context)
  local dimension=$(get_inference_dimension "$inference")
  local agent=$(get_specialist_agent "$hook_name")
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

  # Create structured event log entry
  local event_log="[$timestamp] [EVENT] hook_executed | "
  event_log+="hook=$hook_name | "
  event_log+="inference=$inference | "
  event_log+="dimension=$dimension | "
  event_log+="agent=$agent | "
  event_log+="duration=${duration}ms | "
  event_log+="exit_code=$exit_code | "
  event_log+="ontology_version=$ONTOLOGY_VERSION"

  echo "$event_log" >> "$LOG_FILE"

  if [ "$DEBUG_MODE" = "true" ]; then
    echo "$event_log" >&2
  fi

  # Log performance warning if execution took too long
  if [ "$duration" -gt 5000 ]; then
    log_message "WARN" "Hook execution exceeded 5 seconds: $hook_name (${duration}ms)"
  fi

  # Log success or failure
  if [ "$exit_code" -eq 0 ]; then
    log_message "INFO" "Hook completed successfully: $hook_name"
  else
    log_message "ERROR" "Hook failed with exit code $exit_code: $hook_name"
  fi
}

# Function to get current time in milliseconds
get_time_ms() {
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    python3 -c "import time; print(int(time.time() * 1000))" 2>/dev/null || echo $(($(date +%s) * 1000))
  else
    # Linux
    echo $(($(date +%s%N) / 1000000))
  fi
}

# Export functions for use in other scripts
export -f log_message
export -f log_hook_execution
export -f get_time_ms
export -f get_inference_context
export -f get_inference_dimension
export -f get_specialist_agent
export LOG_FILE
export DEBUG_MODE
export INFERENCE_STATE_FILE
export ONTOLOGY_VERSION
