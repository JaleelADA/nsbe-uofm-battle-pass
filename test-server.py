#!/usr/bin/env python3
"""
Simple HTTP server for testing the NSBE Battle Pass application
Run with: python3 test-server.py
"""

import http.server
import socketserver
import webbrowser
import os

PORT = 8080

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

def start_server():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print(f"🚀 NSBE Battle Pass Test Server")
        print(f"📍 Serving at: http://localhost:{PORT}")
        print(f"📱 Main App: http://localhost:{PORT}/index.html")
        print(f"🔍 Debug Tool: http://localhost:{PORT}/raw-data-debug.html")
        print(f"\n💡 Press Ctrl+C to stop the server")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print(f"\n✅ Server stopped")

if __name__ == "__main__":
    start_server()