import http.server
import socketserver
import os
import sys

PORT = 8000

class QuranWikiHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Serve the local translation JSON if requested
        if self.path == '/quran-data.json':
            parent_dir = os.path.dirname(os.path.abspath(__file__))
            json_path = os.path.join(parent_dir, '..', 'eng-ummmuhammad.json')
            
            if os.path.exists(json_path):
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                with open(json_path, 'rb') as f:
                    self.wfile.write(f.read())
            else:
                self.send_response(404)
                self.end_headers()
                print(f"Error: Translation JSON file not found at {json_path}")
            return
            
        return http.server.SimpleHTTPRequestHandler.do_GET(self)

if __name__ == '__main__':
    # Change working directory to the folder containing index.html
    current_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(current_dir)
    
    # Allow address reuse (prevents "Address already in use" errors on restarts)
    socketserver.TCPServer.allow_reuse_address = True
    
    try:
        with socketserver.TCPServer(("", PORT), QuranWikiHandler) as httpd:
            print("\n========================================================")
            print("📖 Quran Encyclopedia Server Running Successfully!")
            print(f"👉 Open in your web browser: http://localhost:{PORT}")
            print("========================================================\n")
            print("Press Ctrl+C to stop the server.")
            httpd.serve_forever()
    except OSError as e:
        print(f"Error: Could not start server on port {PORT}. {e}")
        print("Make sure no other process is using this port.")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\nStopping QuranWiki server. Goodbye!")
        sys.exit(0)
