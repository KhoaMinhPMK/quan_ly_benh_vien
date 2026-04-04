"""
Deploy script for MedBoard VPS.
Usage:
  python deploy.py              # Full: pull + build server + build client + restart
  python deploy.py server       # Pull + build server only + restart
  python deploy.py client       # Pull + build client only
  python deploy.py pull         # Pull only
  python deploy.py logs         # Show PM2 logs
  python deploy.py status       # Show PM2 status
  python deploy.py cmd "..."    # Run arbitrary command on VPS
"""
import sys
import paramiko
import time

HOST = "160.30.113.26"
PORT = 22
USER = "Administrator"
PASS = "mWm8mY5KUawr"
PROJECT = r"C:\inetpub\wwwroot\quanlybenhvien"

_client = None


def get_client():
    global _client
    if _client is None or _client.get_transport() is None or not _client.get_transport().is_active():
        _client = paramiko.SSHClient()
        _client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        _client.connect(HOST, port=PORT, username=USER, password=PASS,
                        timeout=15, look_for_keys=False, allow_agent=False)
    return _client


def close_client():
    global _client
    if _client:
        _client.close()
        _client = None


def run(cmd, timeout=120):
    client = get_client()
    _, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode("utf-8", errors="replace").strip()
    err = stderr.read().decode("utf-8", errors="replace").strip()
    code = stdout.channel.recv_exit_status()
    return out, err, code


def step(label, cmd, timeout=120):
    print(f"\n{'='*60}")
    print(f"  {label}")
    print(f"{'='*60}")
    out, err, code = run(cmd, timeout)
    if out:
        print(out)
    if err and code != 0:
        print(f"[STDERR] {err}")
    if code != 0:
        print(f"[FAILED exit={code}]")
        return False
    print(f"[OK]")
    return True


def deploy_full():
    ok = step("Git Pull", f"cd {PROJECT} && git pull")
    if not ok:
        return

    step("Install Server deps",
         f"cd {PROJECT}\\server && npm install", timeout=120)

    step("Build Server (tsc)",
         f"cd {PROJECT}\\server && npm run build", timeout=180)

    step("Install Client deps",
         f"cd {PROJECT}\\client && npm install", timeout=120)

    step("Build Client (vite)",
         f"cd {PROJECT}\\client && npm run build", timeout=180)

    step("Restart PM2 medboard-api",
         "pm2 restart medboard-api --update-env")

    time.sleep(2)
    step("Health Check",
         f"cd {PROJECT} && curl -s http://localhost:3011/api/health")


def deploy_server():
    step("Git Pull", f"cd {PROJECT} && git pull")
    step("Build Server (tsc)",
         f"cd {PROJECT}\\server && npm run build", timeout=180)
    step("Restart PM2 medboard-api",
         "pm2 restart medboard-api --update-env")
    time.sleep(2)
    step("Health Check",
         f"cd {PROJECT} && curl -s http://localhost:3011/api/health")


def deploy_client():
    step("Git Pull", f"cd {PROJECT} && git pull")
    step("Build Client (vite)",
         f"cd {PROJECT}\\client && npm run build", timeout=180)


def pull_only():
    step("Git Pull", f"cd {PROJECT} && git pull")


def show_logs():
    out, err, _ = run("pm2 logs medboard-api --lines 30 --nostream")
    print(out)
    if err:
        print(err)


def show_status():
    out, _, _ = run("pm2 status")
    print(out)


if __name__ == "__main__":
    arg = sys.argv[1] if len(sys.argv) > 1 else "full"

    try:
        if arg == "full":
            deploy_full()
        elif arg == "server":
            deploy_server()
        elif arg == "client":
            deploy_client()
        elif arg == "pull":
            pull_only()
        elif arg == "logs":
            show_logs()
        elif arg == "status":
            show_status()
        elif arg == "cmd":
            cmd = " ".join(sys.argv[2:])
            out, err, code = run(cmd)
            if out:
                print(out)
            if err:
                print(f"[STDERR] {err}")
            print(f"[EXIT: {code}]")
        else:
            print(__doc__)
    finally:
        close_client()
