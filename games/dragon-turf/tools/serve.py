# Dev server that disables caching, so edited ES modules are always reloaded.
import http.server, sys
class NoCache(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()
port = int(sys.argv[1]) if len(sys.argv) > 1 else 8780
http.server.ThreadingHTTPServer(('', port), NoCache).serve_forever()
