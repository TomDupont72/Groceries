@echo off
cd C:\Users\FlowUP\Desktop\Groceries\project
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000