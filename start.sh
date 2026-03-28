#!/bin/bash
# CareFlow startup script
# Run: bash start.sh

echo "Starting CareFlow..."

# Start backend in background
backend/venv/bin/uvicorn backend.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
echo "✓ Backend started (PID $BACKEND_PID)"

# Wait for backend to be ready
sleep 3
if curl -s http://localhost:8000/ > /dev/null; then
  echo "✓ Backend is ready at http://localhost:8000"
else
  echo "✗ Backend failed to start"
  exit 1
fi

echo ""
echo "CareFlow is running!"
echo "  Backend:  http://localhost:8000"
echo "  Frontend: run 'cd frontend && npm run dev' in another terminal"
echo ""
echo "Credentials:"
echo "  admin       / admin123"
echo "  dr_smith    / doctor123"
echo "  staff_coord / staff123"
echo ""
echo "Press Ctrl+C to stop."

# Keep running
wait $BACKEND_PID
