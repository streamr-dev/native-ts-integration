#!/bin/bash

COMMAND="node dist/subscriber.js 0xa000000000000000000000000000000000000000#01"

# Start the command in the background and capture its output
$COMMAND > output.log 2>&1 &

# Get the process ID of the background command and save it to a file
PID=$!
echo $PID > server.pid

# Function to check if the desired output is present
check_output() {
    if grep -q "Ready to receive messages" output.log; then
        return 0
    else
        return 1
    fi
}

# Wait for the desired output or timeout after 30 seconds
timeout=30
counter=0
while ! check_output && [ $counter -lt $timeout ]; do
    sleep 1
    ((counter++))
done

# Check if we got the desired output
if check_output; then
    echo "Server is ready!"
else
    echo "Timeout: Server did not become ready within $timeout seconds"
    kill $PID
    exit 1
fi

