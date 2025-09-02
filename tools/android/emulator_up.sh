#!/usr/bin/env bash
set -euo pipefail

# --- Config ---
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
export ANDROID_SDK_ROOT="${ANDROID_SDK_ROOT:-$ANDROID_HOME}"
export PATH="$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:/opt/homebrew/bin"

echo "[emu] ANDROID_HOME=$ANDROID_HOME"
command -v adb >/dev/null 2>&1 || { echo "[emu] adb not found in PATH"; exit 1; }

echo "[emu] adb: $(command -v adb)"
adb kill-server >/dev/null 2>&1 || true
adb start-server >/dev/null
echo "[emu] adb server started"

devices="$(adb devices | awk 'NR>1 && $2=="device" {print $1}')"

if [ -z "$devices" ]; then
  echo "[emu] no online devices, trying to start an AVD…"
  if ! command -v emulator >/dev/null 2>&1; then
    echo "[emu] emulator binary not found at $ANDROID_HOME/emulator. Open Android Studio → Device Manager and install an AVD."
    exit 1
  fi

  AVD_NAME="$(emulator -list-avds | head -n 1 || true)"
  if [ -z "$AVD_NAME" ]; then
    echo "[emu] No AVD defined. Create one in Android Studio (ARM64 image for Apple Silicon)."
    exit 1
  fi

  echo "[emu] starting AVD: $AVD_NAME"
  echo "[emu] emulator path: $(command -v emulator)"
  echo "[emu] AVD list: $(emulator -list-avds)"
  
  # Start emulator with more verbose output
  nohup emulator @"$AVD_NAME" -netdelay none -netspeed full -verbose >/tmp/emu.log 2>&1 &
  EMU_PID=$!
  echo "[emu] emulator started with PID: $EMU_PID"
  
  echo "[emu] waiting for device to appear… (max 60s)"
  # Wait up to ~60s for device to be online (reduced from 120s)
  for i in {1..60}; do
    devices="$(adb devices | awk 'NR>1 && $2=="device" {print $1}')"
    if [ -n "$devices" ]; then 
      echo "[emu] device found after ${i}s: $devices"
      break
    fi
    if [ $((i % 10)) -eq 0 ]; then
      echo "[emu] still waiting... (${i}/60s)"
      echo "[emu] adb devices output:"
      adb devices
    fi
    sleep 1
  done
  if [ -z "$devices" ]; then
    echo "[emu] ERROR: device did not come online after 60s"
    echo "[emu] emulator log:"
    tail -20 /tmp/emu.log
    echo "[emu] adb devices:"
    adb devices
    echo "[emu] killing emulator process $EMU_PID"
    kill $EMU_PID 2>/dev/null || true
    exit 1
  fi

  # Wait for boot complete
  echo "[emu] waiting for boot completion…"
  for i in {1..120}; do
    booted="$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')"
    if [ "$booted" = "1" ]; then break; fi
    sleep 1
  done
fi

echo "[emu] devices online:"
adb devices

# Useful reverse for Metro (some stacks need it)
adb reverse tcp:8081 tcp:8081 >/dev/null 2>&1 || true

echo "[emu] launching app via Expo on Android…"
npx --yes expo start --android
