"""Desktop launcher for Servant Sheet Creator.
Starts the Flask app and opens the default browser. Designed to work when frozen (PyInstaller).
"""
import os
import sys
import threading
import webbrowser
import socket
from werkzeug.serving import make_server

# Import the Flask app from app.py
from app import app

def _find_free_port(start=5000):
    port = start
    while port < 6000:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(('127.0.0.1', port)) != 0:
                return port
        port += 1
    raise RuntimeError("No free port in range 5000-6000")

class _ServerThread(threading.Thread):
    def __init__(self, flask_app, port):
        super().__init__(daemon=True)
        self.port = port
        self.srv = make_server('127.0.0.1', port, flask_app)
        self.ctx = flask_app.app_context()
        self.ctx.push()

    def run(self):
        self.srv.serve_forever()

    def shutdown(self):
        self.srv.shutdown()


def main():
    port = _find_free_port()
    server = _ServerThread(app, port)
    server.start()
    url = f"http://127.0.0.1:{port}/create"
    # Open browser slightly delayed to ensure server is ready
    threading.Timer(0.8, lambda: webbrowser.open(url)).start()
    print(f"Servant Sheet Creator running at {url}")
    print("Press Ctrl+C to exit.")
    try:
        while True:
            threading.Event().wait(2)
    except KeyboardInterrupt:
        print("Shutting down...")
        server.shutdown()

if __name__ == '__main__':
    main()
