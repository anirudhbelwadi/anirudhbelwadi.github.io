#!/usr/bin/env python3
"""Extend the expiry of PythonAnywhere scheduled tasks.

Free-tier scheduled tasks expire every four weeks. An expired task stops running
and is re-enabled by clicking a button in the Tasks page, which also pushes the
expiry out again.

The documented token API can list and patch tasks (command, enabled, interval,
hour, minute, description) but exposes no expiry or extend field, and it answers
403 to the `extend_url` each task carries. So the extend runs as a browser does:
session login, CSRF token, POST. The API is still used to read tasks back, since
an undocumented route deserves a check rather than trust in its status code.

Renewing on a day when the expiry is already four weeks out leaves the date
unchanged, so a run counts as successful when the expiry ends up comfortably in
the future, not only when it moves.
"""

from __future__ import annotations

import os
import sys
from datetime import date, datetime

import requests

# The web app renewal already solves logging in and scraping the CSRF token, and
# the two scripts must stay in step if PythonAnywhere changes their login markup.
from renew_pythonanywhere import BASE, RenewError, csrf_from, log_in, require_env

TIMEOUT = 30

# An expiry at least this far out means the task is renewed, whether or not this
# run is what moved it.
HEALTHY_DAYS = 14


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


def days_until(expiry: str | None) -> int | None:
    if not expiry:
        return None
    try:
        when = datetime.fromisoformat(expiry.replace("Z", "+00:00"))
    except ValueError:
        return None
    return (when.date() - date.today()).days


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


def csrf_page(session: requests.Session, username: str) -> tuple[str, str]:
    """Find a logged-in page carrying a CSRF token, and return the token and its URL.

    Every PythonAnywhere page embeds the same token, so this tries the tabs most
    likely to exist rather than depending on one URL staying put.
    """
    tried: list[str] = []
    for url in (
        f"{BASE}/user/{username}/tasks_tab/",
        f"{BASE}/user/{username}/",
        f"{BASE}/user/{username}/schedule/",
        f"{BASE}/user/{username}/webapps/",
    ):
        response = session.get(url, timeout=TIMEOUT)
        tried.append(f"{url} -> HTTP {response.status_code}")
        if response.status_code != 200:
            continue
        try:
            return csrf_from(response.text, f"page {url}"), url
        except RenewError:
            continue
    raise RenewError(
        "Could not find a CSRF token on any account page:\n    " + "\n    ".join(tried)
    )


def extend_with_session(session: requests.Session, username: str, url: str) -> bool:
    """POST the extend URL the way the Tasks page button does."""
    token, referer = csrf_page(session, username)
    print(f"    csrf from {referer}")
    response = session.post(
        url,
        headers={"Referer": referer},
        data={"csrfmiddlewaretoken": token},
        timeout=TIMEOUT,
    )
    print(f"    session extend -> HTTP {response.status_code} ({response.url})")
    return response.status_code < 400


def extend_with_token(url: str, token: str) -> bool:
    try:
        response = requests.post(url, headers=token_headers(token), timeout=TIMEOUT)
    except requests.RequestException as error:
        print(f"    token extend failed: {error}")
        return False
    print(f"    token extend -> HTTP {response.status_code}")
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


def renew(task: dict, username: str, api_token: str, password: str,
          session: requests.Session | None) -> tuple[str | None, requests.Session | None]:
    """Extend one task. Returns a failure description, or None when it is healthy."""
    task_id = task.get("id")
    before = expiry_of(task)
    extend_url = task.get("extend_url")

    if extend_url:
        url = absolute(extend_url)
        print(f"    extend url: {url}")
        extended = extend_with_token(url, api_token)
        if not extended:
            if not password:
                return (
                    f"task {task_id}: the token was rejected and PA_PASSWORD is not "
                    "set, so the browser flow could not be tried"
                ), session
            if session is None:
                session = requests.Session()
                session.headers["User-Agent"] = "github-actions-renewal/1.0"
                log_in(session, username, password)
            extended = extend_with_session(session, username, url)
    else:
        # Paid accounts have no expiry, so there is nothing to extend.
        print("    no extend_url on this task; nothing to extend")
        extended = True

    after_task = read_task(username, api_token, task_id)
    after = expiry_of(after_task)
    remaining = days_until(after)
    print(
        f"    expiry: {before or 'none'} -> {after or 'none'}"
        + (f" ({remaining} days away)" if remaining is not None else "")
    )

    if not after_task.get("enabled") and not enable(username, api_token, task_id):
        return f"task {task_id} could not be re-enabled", session

    if after is None:
        # No expiry at all means nothing expires; the enable check above is enough.
        return None, session

    if remaining is None:
        return (
            f"task {task_id}: could not read the expiry date {after!r}, so the "
            "renewal could not be confirmed"
        ), session

    if remaining >= HEALTHY_DAYS:
        # Renewing while the expiry is already four weeks out leaves it unchanged,
        # which is fine: the task is not close to expiring.
        return None, session

    if not extended:
        return f"task {task_id}: every extend attempt was rejected", session

    return (
        f"task {task_id}: the extend request was accepted but the expiry is still "
        f"only {remaining} days away ({after})"
    ), session


def main() -> int:
    username = require_env("PA_USERNAME")
    api_token = require_env("PA_API_TOKEN")
    password = os.environ.get("PA_PASSWORD", "").strip()
    # Optional filter: comma or newline separated substrings, so an account with
    # several tasks can renew a chosen few. Unset renews every task.
    raw_filter = os.environ.get("PA_TASK_COMMAND", "")
    wanted = [part.strip() for part in raw_filter.replace("\n", ",").split(",") if part.strip()]

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
        # A pattern that matches nothing is almost always a typo, and silently
        # renewing fewer tasks than asked for would expire one without warning.
        unmatched = [
            pattern for pattern in wanted
            if not any(pattern in str(task.get("command", "")) for task in tasks)
        ]
        if unmatched:
            raise RenewError(
                "PA_TASK_COMMAND has entries that match no scheduled task: "
                + ", ".join(repr(pattern) for pattern in unmatched)
                + "\nCompare them against the commands listed above."
            )
        # One task can match several patterns; renew it once.
        tasks = [
            task for task in tasks
            if any(pattern in str(task.get("command", "")) for pattern in wanted)
        ]
        print(f"\nPA_TASK_COMMAND selected {len(tasks)} of them")

    session: requests.Session | None = None
    failures: list[str] = []

    for task in tasks:
        print(f"\nRenewing {describe(task)}")
        failure, session = renew(task, username, api_token, password, session)
        if failure:
            failures.append(failure)

    if failures:
        raise RenewError(
            "Scheduled task renewal failed:\n  " + "\n  ".join(failures) + "\n"
            f"Renew manually at {BASE}/user/{username}/tasks_tab/"
        )

    print("\nScheduled tasks renewed.")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (RenewError, requests.RequestException) as error:
        print(f"\nERROR: {error}", file=sys.stderr)
        sys.exit(1)
