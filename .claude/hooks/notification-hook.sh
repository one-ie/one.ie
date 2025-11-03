#!/bin/bash

# Notification Hook - ONE Platform
# Sends development notifications via console, system, or file
# Aligned with 6-dimension ontology
#
# DIMENSION MAPPING (by inference range):
#   Infer 1-10:   🏗️  Foundation & Setup
#   Infer 11-20:  📦  Backend Schema (things)
#   Infer 21-30:  🎨  Frontend UI (things)
#   Infer 31-40:  🔗  Integration (connections)
#   Infer 41-50:  👤  Auth & Authorization (people)
#   Infer 51-60:  🧠  Knowledge & RAG (knowledge)
#   Infer 61-70:  ✅  Quality & Testing (events)
#   Infer 71-80:  🎭  Design & Wireframes (things)
#   Infer 81-90:  ⚡  Performance (events)
#   Infer 91-100: 🚀  Deployment (groups)
#
# ONTOLOGY DIMENSIONS:
#   - groups: Multi-tenant containers (friend circles → governments)
#   - people: Authorization & governance (4 roles)
#   - things: All entities (66+ types)
#   - connections: All relationships (25+ types)
#   - events: All actions & state changes (67+ types)
#   - knowledge: Labels, embeddings, RAG

set -e

# Source the logger
source "$CLAUDE_PROJECT_DIR/.claude/hooks/hook-logger.sh"

# Configuration
EVENT="${1:-}"
MESSAGE="${2:-}"
TYPE="${3:-info}"        # info, success, warning, error
CHANNEL="${4:-console}"  # console, system, file, all

# Log start
log_message "INFO" "notification-hook: $EVENT ($TYPE) via $CHANNEL"
START_TIME=$(get_time_ms)

# Load inference context if available
INFERENCE_STATE="$CLAUDE_PROJECT_DIR/.claude/state/inference.json"
CURRENT_INFERENCE="Unknown"
FEATURE_NAME="Unknown Feature"
ORGANIZATION="Unknown Org"

if [ -f "$INFERENCE_STATE" ]; then
  if command -v jq &> /dev/null; then
    CURRENT_INFERENCE=$(jq -r '.current_inference // "Unknown"' "$INFERENCE_STATE" 2>/dev/null || echo "Unknown")
    FEATURE_NAME=$(jq -r '.feature_name // "Unknown Feature"' "$INFERENCE_STATE" 2>/dev/null || echo "Unknown Feature")
    ORGANIZATION=$(jq -r '.organization // "Unknown Org"' "$INFERENCE_STATE" 2>/dev/null || echo "Unknown Org")
  fi
fi

# Map inference to dimension and emoji
get_dimension_info() {
  local inference=$1
  local dimension=""
  local emoji=""
  local phase=""

  if [ "$inference" = "Unknown" ]; then
    echo "❓|unknown|General"
    return
  fi

  # Map inference ranges to 6-dimension ontology
  if [ "$inference" -ge 1 ] && [ "$inference" -le 10 ]; then
    dimension="foundation"
    emoji="🏗️"
    phase="Foundation & Setup"
  elif [ "$inference" -ge 11 ] && [ "$inference" -le 20 ]; then
    dimension="things"
    emoji="📦"
    phase="Backend Schema (things)"
  elif [ "$inference" -ge 21 ] && [ "$inference" -le 30 ]; then
    dimension="things"
    emoji="🎨"
    phase="Frontend UI (things)"
  elif [ "$inference" -ge 31 ] && [ "$inference" -le 40 ]; then
    dimension="connections"
    emoji="🔗"
    phase="Integration (connections)"
  elif [ "$inference" -ge 41 ] && [ "$inference" -le 50 ]; then
    dimension="people"
    emoji="👤"
    phase="Auth & Authorization (people)"
  elif [ "$inference" -ge 51 ] && [ "$inference" -le 60 ]; then
    dimension="knowledge"
    emoji="🧠"
    phase="Knowledge & RAG"
  elif [ "$inference" -ge 61 ] && [ "$inference" -le 70 ]; then
    dimension="events"
    emoji="✅"
    phase="Quality & Testing (events)"
  elif [ "$inference" -ge 71 ] && [ "$inference" -le 80 ]; then
    dimension="things"
    emoji="🎭"
    phase="Design & Wireframes (things)"
  elif [ "$inference" -ge 81 ] && [ "$inference" -le 90 ]; then
    dimension="events"
    emoji="⚡"
    phase="Performance (events)"
  elif [ "$inference" -ge 91 ] && [ "$inference" -le 100 ]; then
    dimension="groups"
    emoji="🚀"
    phase="Deployment (groups)"
  else
    dimension="unknown"
    emoji="❓"
    phase="Unknown Phase"
  fi

  echo "$emoji|$dimension|$phase"
}

# Console notification with ontology context
send_console() {
  local msg="$1"
  local type="$2"

  # Get dimension info
  local dim_info=$(get_dimension_info "$CURRENT_INFERENCE")
  local dim_emoji=$(echo "$dim_info" | cut -d'|' -f1)
  local dimension=$(echo "$dim_info" | cut -d'|' -f2)
  local phase=$(echo "$dim_info" | cut -d'|' -f3)

  # Build context line
  local context="[Infer $CURRENT_INFERENCE] $dim_emoji $phase"

  case "$type" in
    "success") echo "✅ $msg" ;;
    "warning") echo "⚠️  $msg" ;;
    "error")   echo "❌ $msg" ;;
    *)         echo "ℹ️  $msg" ;;
  esac

  # Show ontology context
  echo "   $context | 🏢 $ORGANIZATION | 🎯 $FEATURE_NAME"
}

# System notification (macOS/Linux) with ontology context
send_system() {
  local title="$1"
  local msg="$2"

  # Get dimension info
  local dim_info=$(get_dimension_info "$CURRENT_INFERENCE")
  local dim_emoji=$(echo "$dim_info" | cut -d'|' -f1)
  local dimension=$(echo "$dim_info" | cut -d'|' -f2)
  local phase=$(echo "$dim_info" | cut -d'|' -f3)

  # Build rich notification with context
  local full_title="$dim_emoji ONE: $title"
  local full_msg="$msg

Infer $CURRENT_INFERENCE: $phase
Feature: $FEATURE_NAME
Org: $ORGANIZATION"

  if command -v osascript &> /dev/null; then
    # macOS - escape quotes in message
    local escaped_msg=$(echo "$full_msg" | sed 's/"/\\"/g')
    osascript -e "display notification \"$escaped_msg\" with title \"$full_title\"" 2>/dev/null || true
  elif command -v notify-send &> /dev/null; then
    # Linux
    notify-send "$full_title" "$full_msg" 2>/dev/null || true
  else
    # Fallback to console
    send_console "$title: $msg" "info"
  fi
}

# File notification with ontology context
send_file() {
  local msg="$1"
  local type="$2"

  # Get dimension info
  local dim_info=$(get_dimension_info "$CURRENT_INFERENCE")
  local dim_emoji=$(echo "$dim_info" | cut -d'|' -f1)
  local dimension=$(echo "$dim_info" | cut -d'|' -f2)
  local phase=$(echo "$dim_info" | cut -d'|' -f3)

  local notif_file="$CLAUDE_PROJECT_DIR/.claude/notifications.log"
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

  # Log with full ontology context
  echo "[$timestamp] [$type] $msg" >> "$notif_file"
  echo "  → Inference: $CURRENT_INFERENCE | Dimension: $dimension | Phase: $phase" >> "$notif_file"
  echo "  → Feature: $FEATURE_NAME | Organization: $ORGANIZATION" >> "$notif_file"
}

# Notification templates with ontology awareness
get_template() {
  # Get dimension info for context
  local dim_info=$(get_dimension_info "$CURRENT_INFERENCE")
  local dimension=$(echo "$dim_info" | cut -d'|' -f2)

  case "$1" in
    # Ontology-specific events
    "thing-created")      echo "Created new thing entity in $dimension dimension" ;;
    "connection-added")   echo "Added connection relationship" ;;
    "event-logged")       echo "Logged event in audit trail" ;;
    "knowledge-indexed")  echo "Indexed knowledge for RAG" ;;
    "group-updated")      echo "Updated group configuration" ;;
    "person-authorized")  echo "Authorized person with role" ;;

    # Build events
    "build-start")        echo "Build process started for $dimension" ;;
    "build-success")      echo "Build completed successfully in $dimension" ;;
    "build-failure")      echo "Build failed in $dimension phase" ;;

    # Test events
    "test-success")       echo "All tests passed for $dimension" ;;
    "test-failure")       echo "Some tests failed in $dimension" ;;

    # Security events
    "security-warning")   echo "Security warning detected in $dimension" ;;
    "security-block")     echo "Security block - operation prevented" ;;

    # Session events
    "session-start")      echo "Claude Code session started" ;;
    "session-end")        echo "Claude Code session ended" ;;

    # Inference progress
    "inference-complete") echo "Completed Infer $CURRENT_INFERENCE ($dimension)" ;;
    "inference-start")    echo "Starting Infer $CURRENT_INFERENCE ($dimension)" ;;

    # Agent events
    "agent-invoked")      echo "AI agent invoked for $dimension work" ;;
    "agent-completed")    echo "AI agent completed $dimension task" ;;

    # Deployment events
    "deploy-start")       echo "Deployment started" ;;
    "deploy-success")     echo "Deployment successful" ;;
    "deploy-failure")     echo "Deployment failed" ;;

    # Default
    *)                    echo "${MESSAGE:-$1}" ;;
  esac
}

EXIT_CODE=0
NOTIFICATION_MESSAGE=$(get_template "$EVENT")

# Send notification
case "$CHANNEL" in
  "console")
    send_console "$NOTIFICATION_MESSAGE" "$TYPE"
    ;;
  "system")
    send_system "$EVENT" "$NOTIFICATION_MESSAGE"
    ;;
  "file")
    send_file "$NOTIFICATION_MESSAGE" "$TYPE"
    ;;
  "all")
    send_console "$NOTIFICATION_MESSAGE" "$TYPE"
    send_system "$EVENT" "$NOTIFICATION_MESSAGE"
    send_file "$NOTIFICATION_MESSAGE" "$TYPE"
    ;;
  *)
    echo "❌ Unknown channel: $CHANNEL"
    EXIT_CODE=1
    ;;
esac

# Log notification
if [ $EXIT_CODE -eq 0 ]; then
  log_message "INFO" "Notification sent: $EVENT"
fi

# Log completion
END_TIME=$(get_time_ms)
log_hook_execution "notification-hook" "$EVENT $CHANNEL" "$START_TIME" "$END_TIME" "$EXIT_CODE"

exit $EXIT_CODE
