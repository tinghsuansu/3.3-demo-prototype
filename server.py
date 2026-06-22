import http.server, os

os.chdir('/Users/jasminesu/Desktop/3.3 demo/0617_prototype (Claude Code)')

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()
    def log_message(self, format, *args):
        pass  # suppress request logs

http.server.test(HandlerClass=NoCacheHandler, port=7331, bind='127.0.0.1')
