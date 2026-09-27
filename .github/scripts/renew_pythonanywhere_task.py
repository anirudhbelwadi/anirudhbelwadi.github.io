#!/usr/bin/env python3
"""Extend the expiry of PythonAnywhere scheduled tasks.

Free-tier scheduled tasks expire every four weeks. An expired task stops running
and is re-enabled by clicking a button in the Tasks page, which also pushes the
expiry out again.

The documented token API can list and patch tasks (command, enabled, interval,
hour, minute, description) but exposes no expiry or extend field. Each task in
the list does carry an `extend_url`, so this tries the token against that URL
first and falls back to the same session login the web app renewal uses.

Because the extend route is undocumented either way, success is never assumed
from a 2xx: the task is read back and the expiry must have moved.
"""

from __future__ import annotations

import os
import sys

import requests

# The web app renewal already solves logging in and scraping the CSRF token, and
# the two scripts must stay in step if PythonAnywhere changes their login markup.
from renew_pythonanywhere import BASE, RenewError, csrf_from, log_in, require_env

TIMEOUT = 30


def api_root(username: str) -> str:
    return f"{BASE}/api/v0/user/{username}/schedule/"


def token_headers(token: str) -> dict[str, str]:
    return {"Authorization": f"Token {token}"}


def absolute(url: str) -> str:
    return url if url.startswith("http") else f"{BASE}{url}"


def expiry_of(task: dict) -> str | None:
    """Return whatever the task calls its expiry, since the field is undocumented."""
    for key, value in task.items():
        if "expir" in key.lower() and not key.lower().endswith("_url"):
            return None if value is None else str(value)
    return None


def describe(task: dict) -> str:
    expiry = expiry_of(task)
    return (
        f"task {task.get('id')}: {task.get('command')!r} "
        f"(enabled={task.get('enabled')}, expiry={expiry or 'none'})"
    )


def list_tasks(username: str, token: str) -> list[dict]:
    response = requests.get(
        api_root(username), headers=token_headers(token), timeout=TIMEOUT
    )
    if response.status_code != 200:
        raise RenewError(
            f"Could not list scheduled tasks (HTTP {response.status_code}): "
            f"{response.text[:200]}"
        )
    payload = response.json()
    # The endpoint returns a bare list today; tolerate a paginated shape too.
    return payload if isinstance(payload, list) else payload.get("results", [])


def read_task(username: str, token: str, task_id) -> dict:
    response = requests.get(
        f"{api_root(username)}{task_id}/", headers=token_headers(token), timeout=TIMEOUT
    )
    if response.status_code != 200:
        raise RenewError(
            f"Could not read task {task_id} back (HTTP {response.status_code}): "
            f"{response.text[:200]}"
        )
    return response.json()


def extend_with_token(url: str, token: str) -> bool:
    try:
        response = requests.post(url, headers=token_headers(token), timeout=TIMEOUT)
    except requests.RequestException as error:
        print(f"    token extend failed: {error}")
        return False
    print(f"    token extend -> HTTP {response.status_code}")
    return response.status_code < 400


def extend_with_session(session: requests.Session, username: str, url: str) -> bool:
    """POST the extend URL as the browser does, with a CSRF token from the Tasks page."""
    tasks_page = f"{BASE}/user/{username}/schedule/"
    response = session.get(tasks_page, timeout=TIMEOUT)
    response.raise_for_status()
    token = csrf_from(response.text, "tasks page")

    response = session.post(
        url,
        headers={"Referer": tasks_page},
        data={"csrfmiddlewaretoken": token},
        timeout=TIMEOUT,
    )
    print(f"    session extend -> HTTP {response.status_code}")
    return response.status_code < 400


def enable(username: str, token: str, task_id) -> bool:
    """An expired task comes back disabled, so turn it back on after extending."""
    response = requests.patch(
        f"{api_root(username)}{task_id}/",
        headers=token_headers(token),
        json={"enabled": True},
        timeout=TIMEOUT,
    )
    print(f"    enable -> HTTP {response.status_code}")
    return response.status_code < 400


def main() -> int:
    username = require_env("PA_USERNAME")
    api_token = require_env("PA_API_TOKEN")
    password = os.environ.get("PA_PASSWORD", "").strip()
    # Optional substring filter, so one account with several tasks can renew one.
    wanted = os.environ.get("PA_TASK_COMMAND", "").strip()

    tasks = list_tasks(username, api_token)
    if not tasks:
        raise RenewError(
            "The account has no scheduled tasks. If one is expected, it may have "
            "been deleted rather than expired — recreate it on the Tasks page."
        )

    print(f"Found {len(tasks)} scheduled task(s):")
    for task in tasks:
        print(f"  {describe(task)}")

    if wanted:
        tasks = [t for t in tasks if wanted in str(t.get("command", ""))]
        if not tasks:
            raise RenewError(
                f"No scheduled task matches PA_TASK_COMMAND={wanted!r}. "
                "Check the command above for a typo."
            )

    session: requests.Session | None = None
    failures: list[str] = []

    for task in tasks:
        task_id = task.get("id")
        print(f"\nRenewing {describe(task)}")

        before = expiry_of(task)
        extend_url = task.get("extend_url")
        if not extend_url:
            # Paid accounts have no expiry, so there is nothing to extend.
            print("    no extend_url on this task; nothing to extend")
            if not task.get("enabled") and not enable(username, api_token, task_id):
                failures.append(f"task {task_id} could not be re-enabled")
            continue

        url = absolute(extend_url)
        extended = extend_with_token(url, api_token)

        if not extended:
            if not password:
                failures.append(
                    f"task {task_id}: the token was rejected and PA_PASSWORD is not "
                    "set, so the browser flow could not be tried"
                )
                continue
            if session is None:
                session = requests.Session()
                session.headers["User-Agent"] = "github-actions-renewal/1.0"
                log_in(session, username, password)
            extended = extend_with_session(session, username, url)

        after_task = read_task(username, api_token, task_id)
        after = expiry_of(after_task)
        print(f"    expiry: {before or 'none'} -> {after or 'none'}")

        if before and after and before == after:
            failures.append(
                f"task {task_id}: the extend request was accepted but the expiry "
                f"did not move (still {after})"
            )
            continue
        if not extended:
            failures.append(f"task {task_id}: every extend attempt was rejected")
            continue

        if not after_task.get("enabled") and not enable(username, api_token, task_id):
            failures.append(f"task {task_id} was extended but could not be re-enabled")

    if failures:
        raise RenewError(
            "Scheduled task renewal failed:\n  " + "\n  ".join(failures) + "\n"
            f"Renew manually at {BASE}/user/{username}/schedule/"
        )

    print("\nScheduled tasks renewed.")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (RenewError, requests.RequestException) as error:
        print(f"\nERROR: {error}", file=sys.stderr)
        sys.exit(1)
