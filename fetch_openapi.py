import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

url = "https://elecciones-cea-backend.onrender.com/openapi.json"
try:
    req = urllib.request.Request(url, method="GET")
    resp = urllib.request.urlopen(req, context=ctx)
    data = json.loads(resp.read())
    
    # Extract paths
    for path, methods in data.get("paths", {}).items():
        if "candidat" in path.lower():
            for method in methods:
                print(f"{method.upper()} {path}")
except Exception as e:
    print(f"Error fetching openapi.json: {e}")
