import urllib.request
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

urls = [
    "https://elecciones-cea-backend.onrender.com/secretaria/candidatos",
    "https://elecciones-cea-backend.onrender.com/secretaria/votantes",
    "https://elecciones-cea-backend.onrender.com/admin/elecciones"
]

for url in urls:
    try:
        req = urllib.request.Request(url, method="GET")
        resp = urllib.request.urlopen(req, context=ctx)
        print(f"{url} -> {resp.status}")
    except Exception as e:
        print(f"{url} -> {getattr(e, 'code', e)}")
