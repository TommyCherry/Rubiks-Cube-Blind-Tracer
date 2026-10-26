"""Session signing configuration shared by all application workers."""

import secrets


def session_secret(environ):
    key = environ.get("FLASK_SECRET_KEY", "").strip()
    if key:
        return key
    production = (
        environ.get("VERCEL") == "1"
        or environ.get("VERCEL_ENV") in ("production", "preview")
        or environ.get("APP_ENV", "").lower() == "production"
        or environ.get("FLASK_ENV", "").lower() == "production"
    )
    if production:
        raise RuntimeError("FLASK_SECRET_KEY must be set to a stable secret in production.")
    return secrets.token_hex(32)
