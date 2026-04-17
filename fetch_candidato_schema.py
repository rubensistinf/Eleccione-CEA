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
    
    post_candidatos = data["paths"]["/secretaria/candidatos"]["post"]
    print("Request Body schema ref:", post_candidatos["requestBody"]["content"]["application/json"]["schema"]["$ref"])
    schema_name = post_candidatos["requestBody"]["content"]["application/json"]["schema"]["$ref"].split("/")[-1]
    
    schema = data["components"]["schemas"][schema_name]
    print(json.dumps(schema, indent=2))
except Exception as e:
    print(f"Error: {e}")
