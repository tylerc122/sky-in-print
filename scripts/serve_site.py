"""Serve site/ locally the way Vercel does: clean URLs and /cases/<id> going to the case page."""
import http.server
import os
import sys

SITE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "site")


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=SITE, **k)

    def translate_path(self, path):
        clean = path.split("?", 1)[0].split("#", 1)[0]
        if clean.startswith("/cases/"):
            path = "/case.html"
        elif clean != "/" and "." not in os.path.basename(clean):
            path = clean.rstrip("/") + ".html"
        return super().translate_path(path)

    def send_error(self, code, message=None, explain=None):
        # missing pages get the site's own 404, the way Vercel does it
        page = os.path.join(SITE, "404.html")
        if code == 404 and os.path.exists(page):
            body = open(page, "rb").read()
            self.send_response(404)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        super().send_error(code, message, explain)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8766
    http.server.ThreadingHTTPServer(("127.0.0.1", port), Handler).serve_forever()
