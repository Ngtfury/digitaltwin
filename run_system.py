import subprocess
import sys
import time
import os
import signal
import webbrowser
import psutil

def free_port(port: int):
    """Ensure port is completely freed before binding."""
    try:
        current_pid = os.getpid()
        for conn in psutil.net_connections(kind='inet'):
            if conn.laddr.port == port and conn.status in ('LISTEN', psutil.CONN_LISTEN):
                if conn.pid and conn.pid != current_pid:
                    print(f"[*] Port {port} is occupied by PID {conn.pid}. Terminating stale process...")
                    try:
                        proc = psutil.Process(conn.pid)
                        proc.kill()
                        proc.wait(timeout=3)
                        print(f"[+] Successfully terminated PID {conn.pid} on port {port}.")
                    except Exception as e:
                        print(f"[!] Warning: Could not kill process {conn.pid}: {e}")
    except Exception as e:
        # Fallback to netstat/taskkill on Windows
        if sys.platform.startswith("win"):
            try:
                cmd = f'powershell -Command "Get-NetTCPConnection -LocalPort {port} -ErrorAction SilentlyContinue | ForEach-Object {{ Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }}"'
                subprocess.run(cmd, shell=True, capture_output=True)
            except Exception:
                pass

def main():
    print("=" * 70)
    print("AI-Driven Cyber Digital Twin Framework")
    print("Base Paper: IEEE ICCST 2025 Reference Framework")
    print("=" * 70)
    
    root_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(root_dir, "backend")
    frontend_dir = os.path.join(root_dir, "frontend")

    # Step 1: Pre-flight port check and auto-clear
    print("[*] Checking port availability...")
    free_port(8000)
    free_port(3000)
    time.sleep(1)

    # Step 2: Start Backend
    print("[1/3] Starting FastAPI Backend on http://127.0.0.1:8000 ...")
    backend_proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000"],
        cwd=backend_dir
    )

    # Wait for backend to warm up models and database
    time.sleep(3)

    # Step 3: Start Frontend
    print("[2/3] Starting Next.js Frontend on http://localhost:3000 ...")
    npm_cmd = "npm.cmd" if sys.platform.startswith("win") else "npm"
    frontend_proc = subprocess.Popen(
        [npm_cmd, "run", "dev", "--", "-p", "3000"],
        cwd=frontend_dir
    )

    time.sleep(4)
    print("[3/3] Opening Dashboard in browser: http://localhost:3000")
    try:
        webbrowser.open("http://localhost:3000")
    except Exception:
        pass

    print("\n" + "=" * 70)
    print("System Online:")
    print("  - Frontend UI (Next.js):     http://localhost:3000")
    print("  - Backend API (FastAPI):    http://127.0.0.1:8000")
    print("  - Interactive OpenAPI Docs: http://127.0.0.1:8000/docs")
    print("  - Default Analyst Account:  analyst / AnalystPassword123!")
    print("  - Default Admin Account:    admin   / AdminPassword123!")
    print("  - Default Auditor Account:  auditor / AuditorPassword123!")
    print("Press Ctrl+C to terminate both servers.")
    print("=" * 70 + "\n")

    def signal_handler(sig, frame):
        print("\nShutting down servers...")
        try:
            backend_proc.terminate()
        except Exception:
            pass
        try:
            frontend_proc.terminate()
        except Exception:
            pass
        free_port(8000)
        free_port(3000)
        sys.exit(0)

    signal.signal(signal.SIGINT, signal_handler)

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        signal_handler(None, None)

if __name__ == "__main__":
    main()
