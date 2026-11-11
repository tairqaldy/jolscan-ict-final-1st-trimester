# 0008: Align the API on Python 3.12

**Status:** Proposed for Tair and Nazar's review, 11 November 2026.

The service's S-1 environment and restroom experiments use Python 3.12 and NumPy 2.5.4,
but the Dockerfile and Python CI job used 3.11. NumPy 2.5.4 declares `Requires-Python >=3.12`.

Propose Python 3.12 for the API, Docker base and Python CI. This keeps the direct dependency
versions used in the S-1 API test and the NumPy version used by the restroom experiments.
An alternative is to retain 3.11 and select and retest older packages for both modules.

The temporary [Linux clean-install run](https://github.com/tairqaldy/qarau-ict-final-1st-trimester/actions/runs/42904855203)
installed the pinned API/dev dependencies with Python 3.12 and CPU PyTorch, passed 30 API
tests and checked `/health` with FastAPI's test client. This is not a Docker build or a real
restroom-model inference test. Pillow 12.3.0, used in S-1, remains below version 13 because the
pinned Gradio release requires it; the restroom research environment used Pillow 13.0.0.

Tair and Nazar should review the version choice and the effect on their workflows before merge.
