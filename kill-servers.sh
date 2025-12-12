#!/bin/bash

# Kill all development servers and processes for QCS Cargo

echo "🔄 Killing all QCS Cargo development processes..."

# Kill all npm run dev processes
echo "Killing npm dev processes..."
pkill -f "npm run dev" 2>/dev/null || true

# Kill all vite processes
echo "Killing Vite processes..."
pkill -f "vite dev" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

# Kill processes on common dev ports
echo "Killing processes on ports 5173-5175..."
for port in 5173 5174 5175; do
    pid=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
        echo "  Killing process $pid on port $port"
        kill -9 $pid 2>/dev/null || true
    fi
done

# Kill PocketBase processes
echo "Killing PocketBase processes..."
pkill -f "pocketbase" 2>/dev/null || true
pkill -f "pocketbase serve" 2>/dev/null || true

# Kill any node processes related to the project
echo "Killing related Node processes..."
pkill -f "qcs-cargo" 2>/dev/null || true

# Wait a moment for processes to die
sleep 2

# Check if any processes are still running
echo "🔍 Checking for remaining processes..."
remaining=""

for port in 5173 5174 5175; do
    pid=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
        remaining="$remaining Port $port (PID: $pid)"
    fi
done

if [ -z "$remaining" ]; then
    echo "✅ All processes killed successfully!"
else
    echo "⚠️  Some processes may still be running: $remaining"
fi

echo "Done!"