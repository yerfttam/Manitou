#!/usr/bin/env python3
"""
Local dev server with clean URL support.
Serves NEW/ at localhost:3456.
Falls back to .html extension if file not found (mirrors Render behavior).
"""
import http.server
import os

DIRECTORY = os.path.join(os.path.dirname(__file__), "NEW")
PORT = 3456

class CleanURLHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        # Strip query string for path lookup
        path = self.path.split("?")[0].split("#")[0]

        # Build filesystem path
        fs_path = os.path.join(DIRECTORY, path.lstrip("/"))

        # If exact file doesn't exist, try adding .html
        if not os.path.exists(fs_path) and not path.endswith(".html"):
            html_path = fs_path + ".html"
            if os.path.exists(html_path):
                self.path = path + ".html" + (self.path[len(path):] or "")

        return super().do_GET()

    def log_message(self, format, *args):
        # Cleaner log output
        print(f"  {self.address_string()} → {args[0]} {args[1]}")

if __name__ == "__main__":
    import socketserver
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), CleanURLHandler) as httpd:
        print(f"Manitou dev server running at http://localhost:{PORT}")
        print(f"Serving: {DIRECTORY}")
        print(f"Ctrl+C to stop\n")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
