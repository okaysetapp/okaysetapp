# Vercel serverless entry point for the FastAPI backend.
#
# Vercel routes /api/* to this file (per vercel.json). We reuse the
# existing FastAPI app defined in backend/server.py without duplicating
# any routes — the api_router there already mounts everything under /api,
# so paths line up cleanly with the rewrite.

import os
import sys

# Make `backend/` importable so `from server import app` works at runtime.
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from server import app  # noqa: E402  (ASGI app exported for Vercel)
