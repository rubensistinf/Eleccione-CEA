import urllib.request
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

urls = [
    ("PUT", "https://elecciones-cea-backend.onrender.com/secretaria/candidatos/1"),
    ("PUT", "https://elecciones-cea-backend.onrender.com/candidatos/1"),
    ("POST", "https://elecciones-cea-backend.onrender.com/secretaria/candidatos/1/foto"),
    ("PATCH", "https://elecciones-cea-backend.onrender.com/secretaria/candidatos/1")
]

for method, url in urls:
    try:
        req = urllib.request.Request(url, method=method)
        resp = urllib.request.urlopen(req, context=ctx)
        print(f"{method} {url} -> {resp.status}")
    except Exception as e:
        status = getattr(e, 'code', str(e))
        print(f"{method} {url} -> {status}")
