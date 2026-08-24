#!/usr/bin/env python3
"""Extend the PythonAnywhere web app expiry.

Free-tier web apps expire on a fixed cycle and are renewed by clicking a button
in the web UI. There is no API endpoint for this — the documented API covers
webapps, consoles, files, schedule and always-on, but nothing for expiry — so
this drives the same form the browser does.

That means session auth with the account password rather than the scoped API
token, and it means the flow depends on PythonAnywhere's login markup. Both are
why this script verifies the outcome instead of assuming a 200 meant success.
"""

from __future__ import annotations

import os
import re
import sys

import requests

BASE = "https://www.pythonanywhere.com"
TIMEOUT = 30

# PythonAnywhere embeds the CSRF token in an inline script rather than a form
# field on every page, so the token is read from there.
CSRF_PATTERN = re.compile(r'Anywhere\.csrfToken\s*=\s*"(\w+)"')


class RenewError(RuntimeError):
    pass


def require_env(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        raise RenewError(f"Missing required environment variable: {name}")
    return value


def csrf_from(html: str, what: str) -> str:
    match = CSRF_PATTERN.search(html)
    if not match:
        raise RenewError(
            f"Could not find a CSRF token on the {what}. "
            "PythonAnywhere most likely changed their page markup, so this "
            "script needs updating."
        )
    return match.group(1)


def log_in(session: requests.Session, username: str, password: str) -> None:
    response = session.get(f"{BASE}/login/", timeout=TIMEOUT)
    response.raise_for_status()
    token = csrf_from(response.text, "login page")

    response = session.post(
        f"{BASE}/login/",
        headers={"Referer": f"{BASE}/login/"},
        data={
            "csrfmiddlewaretoken": token,
            "auth-username": username,
            "auth-password": password,
            "login_view-current_step": "auth",
        },
        timeout=TIMEOUT,
    )
    response.raise_for_status()

    # A failed login re-renders the form at /login/ instead of redirecting.
    if response.url.rstrip("/") != f"{BASE}/user/{username}".rstrip("/"):
        raise RenewError(
            "Login did not reach the dashboard — landed on "
            f"{response.url}. Check PA_USERNAME and PA_PASSWORD. If the account "
            "has two-factor auth enabled, this flow cannot work at all."
        )
    print(f"  logged in as {username}")


def read_expiry(html: str) -> str | None:
    """Best-effort scrape of the expiry date shown on the web apps page."""
    for pattern in (
        r"expiry date[^<]*?is\s*([0-9]{1,2}\s+\w+\s+[0-9]{4})",
        r"will expire on\s*([0-9]{1,2}\s+\w+\s+[0-9]{4})",
        r"expires?\s+on\s*([0-9]{1,2}\s+\w+\s+[0-9]{4})",
        r'id="id_expiry"[^>]*>([^<]+)<',
    ):
        match = re.search(pattern, html, re.IGNORECASE)
        if match:
            return match.group(1).strip()
    return None


def api_expiry(username: str, domain: str, token: str) -> str | None:
    """The token API may expose expiry; the docs do not say, so treat as optional."""
    try:
        response = requests.get(
            f"{BASE}/api/v0/user/{username}/webapps/{domain}/",
            headers={"Authorization": f"Token {token}"},
            timeout=TIMEOUT,
        )
        if response.status_code != 200:
            return None
        payload = response.json()
    except (requests.RequestException, ValueError):
        return None

    for key, value in payload.items():
        if "expir" in key.lower():
            return f"{key}={value}"
    return None


def main() -> int:
    username = require_env("PA_USERNAME")
    password = require_env("PA_PASSWORD")
    domain = os.environ.get("PA_DOMAIN", "").strip() or f"{username}.pythonanywhere.com"
    api_token = os.environ.get("PA_API_TOKEN", "").strip()

    session = requests.Session()
    session.headers["User-Agent"] = "github-actions-renewal/1.0"

    print(f"Renewing {domain}")
    log_in(session, username, password)

    webapps_url = f"{BASE}/user/{username}/webapps/"
    response = session.get(
        webapps_url, headers={"Referer": f"{BASE}/user/{username}/"}, timeout=TIMEOUT
    )
    response.raise_for_status()
    token = csrf_from(response.text, "web apps page")

    before = read_expiry(response.text)
    print(f"  expiry before: {before or 'not found in page'}")

    response = session.post(
        f"{webapps_url}{domain}/extend",
        headers={"Referer": webapps_url},
        data={"csrfmiddlewaretoken": token},
        timeout=TIMEOUT,
    )

    if response.status_code != 200 or response.url.rstrip("/") != webapps_url.rstrip("/"):
        raise RenewError(
            f"Extend request failed — HTTP {response.status_code}, landed on "
            f"{response.url}. Expected a redirect back to {webapps_url}. "
            f"Check that {domain} is spelled correctly and still exists."
        )

    after = read_expiry(response.text)
    print(f"  expiry after:  {after or 'not found in page'}")

    if before and after and before == after:
        raise RenewError(
            f"The extend request was accepted but the expiry date did not move "
            f"(still {after}). The renewal did not take effect."
        )

    if api_token:
        reported = api_expiry(username, domain, api_token)
        if reported:
            print(f"  api reports: {reported}")

    if not after:
        # Not fatal: the redirect is the same signal the browser relies on, but
        # say so plainly rather than implying the date was confirmed.
        print(
            "  NOTE: could not read the expiry date from the page, so success "
            "rests on the redirect alone. Worth confirming manually once."
        )

    print("Renewed.")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (RenewError, requests.RequestException) as error:
        print(f"\nERROR: {error}", file=sys.stderr)
        sys.exit(1)
