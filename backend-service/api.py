"""Token-authenticated JSON API for the analytics dashboard.

The dashboard itself is server-rendered and authenticated with a session
cookie and a CSRF form, which a native mobile client cannot use. These helpers
add a bearer-token scheme alongside it: the client trades the admin password
for a signed, expiring token and sends it on every request.

The token carries no secret of its own — it is signed with the app's secret key,
so revoking every issued token is a matter of rotating that key.
"""

import os
import time
from functools import wraps

from flask import jsonify, request
from itsdangerous import BadSignature, SignatureExpired, URLSafeTimedSerializer

TOKEN_SALT = "analytics-api-v1"
TOKEN_MAX_AGE = 60 * 60 * 24 * 30  # 30 days

# A password endpoint open to the internet needs some brake on guessing. This is
# per-process and resets on reload, which is enough for a single-worker host.
_FAILURES = {}
_MAX_FAILURES = 8
_LOCKOUT_WINDOW = 15 * 60


def _serializer(secret_key):
    return URLSafeTimedSerializer(secret_key, salt=TOKEN_SALT)


def admin_password():
    return os.environ.get("ADMIN_PASSWORD", "")


def issue_token(secret_key):
    return _serializer(secret_key).dumps({"role": "admin", "issued": int(time.time())})


def token_is_valid(secret_key, token):
    try:
        _serializer(secret_key).loads(token, max_age=TOKEN_MAX_AGE)
        return True
    except (BadSignature, SignatureExpired):
        return False


def _client_key():
    return request.headers.get("X-Forwarded-For", request.remote_addr or "unknown").split(",")[0].strip()


def note_failure():
    key = _client_key()
    now = time.time()
    attempts = [t for t in _FAILURES.get(key, []) if now - t < _LOCKOUT_WINDOW]
    attempts.append(now)
    _FAILURES[key] = attempts


def is_locked_out():
    key = _client_key()
    now = time.time()
    attempts = [t for t in _FAILURES.get(key, []) if now - t < _LOCKOUT_WINDOW]
    _FAILURES[key] = attempts
    return len(attempts) >= _MAX_FAILURES


def clear_failures():
    _FAILURES.pop(_client_key(), None)


def require_api_token(secret_key_getter):
    """Guard a JSON route with the bearer token issued by /api/login."""
    def decorator(view):
        @wraps(view)
        def wrapped(*args, **kwargs):
            header = request.headers.get("Authorization", "")
            token = header[7:].strip() if header.lower().startswith("bearer ") else ""
            if not token or not token_is_valid(secret_key_getter(), token):
                response = jsonify({"error": "unauthorized", "message": "Sign in again."})
                response.status_code = 401
                return response
            response = view(*args, **kwargs)
            response.headers["Cache-Control"] = "no-store"
            return response
        return wrapped
    return decorator


def visitor_to_json(row):
    """Shape one visitors row for the client, with stable key names."""
    return {
        "ip": row[0],
        "timestamp": row[1],
        "city": row[2],
        "region": row[3],
        "country": row[4],
        "source": row[5],
        "isRepeatVisitor": (row[6] or "").upper() == "Y",
        "postal": row[7],
        "name": row[8],
        "role": row[9],
        "isMobile": (row[10] or "").upper() == "Y",
    }


def pairs_to_series(rows):
    """[(label, count)] as it comes out of SQLite -> [{label, value}]."""
    return [{"label": row[0], "value": row[1]} for row in rows]
