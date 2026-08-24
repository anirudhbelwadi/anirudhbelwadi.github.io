#!/usr/bin/env python3
"""Deploy backend-service application files to PythonAnywhere.

Uploads code, templates and static assets over the PythonAnywhere Files API,
then reloads the web app.

The live SQLite database lives in the same directory as the application code, so
this script works from an explicit allowlist rather than an exclude list: a file
is uploaded only if it was named up front. A second guard re-checks the built
manifest and aborts if anything forbidden slipped in, because uploading the
repo's database.db (an empty schema file) over the live one would destroy the
visitor history.
"""

from __future__ import annotations

import os
import re
import sys
import time
from pathlib import Path

import requests

# --- what gets deployed -----------------------------------------------------

# Individual files, relative to backend-service/.
FILES = [
    "flask_app.py",
    "content.py",
    "images.py",
    "country_code.py",
    "fetch_gist.py",
    "requirements.txt",
    # Seeds the content tables on first run only; never overwrites live rows.
    "content_seed.json",
]

# Directories deployed in full, relative to backend-service/.
DIRECTORIES = [
    "templates",
    "static",
]

# --- what must never be deployed --------------------------------------------

# Live data and secrets. helper-codes/ is developer scratch SQL, not runtime code.
DENIED_NAMES = {
    "database.db",
    "source_config.json",
}
DENIED_SUFFIXES = {".db", ".sqlite", ".sqlite3", ".db-journal", ".db-wal", ".db-shm"}
DENIED_DIRECTORIES = {"helper-codes", "__pycache__", ".git"}


class DeployError(RuntimeError):
    pass


def require_env(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        raise DeployError(f"Missing required environment variable: {name}")
    return value


def build_manifest(source_root: Path) -> list[Path]:
    """Collect the files to upload, as paths relative to source_root."""
    manifest: list[Path] = []

    for name in FILES:
        path = source_root / name
        if not path.is_file():
            raise DeployError(f"Expected file is missing: {path}")
        manifest.append(Path(name))

    for directory in DIRECTORIES:
        root = source_root / directory
        if not root.is_dir():
            raise DeployError(f"Expected directory is missing: {root}")
        for path in sorted(root.rglob("*")):
            if not path.is_file():
                continue
            relative = path.relative_to(source_root)
            if DENIED_DIRECTORIES.intersection(relative.parts):
                continue
            manifest.append(relative)

    return manifest


def assert_manifest_safe(manifest: list[Path]) -> None:
    """Fail loudly if anything forbidden made it into the manifest."""
    violations = [
        str(path)
        for path in manifest
        if path.name in DENIED_NAMES
        or path.suffix.lower() in DENIED_SUFFIXES
        or DENIED_DIRECTORIES.intersection(path.parts)
    ]
    if violations:
        raise DeployError(
            "Refusing to deploy — the manifest contains protected paths:\n  "
            + "\n  ".join(violations)
        )


def upload(session: requests.Session, api_root: str, remote_dir: str,
           source_root: Path, relative: Path) -> str:
    remote_path = f"{remote_dir.rstrip('/')}/{relative.as_posix()}"
    url = f"{api_root}/files/path{remote_path}"
    with (source_root / relative).open("rb") as handle:
        response = session.post(url, files={"content": handle})

    if response.status_code == 201:
        return "created"
    if response.status_code == 200:
        return "updated"
    raise DeployError(
        f"Upload failed for {relative} -> {remote_path} "
        f"(HTTP {response.status_code}): {response.text[:300]}"
    )


def reload_webapp(session: requests.Session, api_root: str, domain: str) -> None:
    response = session.post(f"{api_root}/webapps/{domain}/reload/")
    if response.status_code != 200:
        raise DeployError(
            f"Web app reload failed (HTTP {response.status_code}): {response.text[:300]}"
        )


def verify_live(domain: str, attempts: int = 6, delay: int = 5) -> None:
    """Confirm the web app actually serves traffic after the reload.

    A reload that returns 200 from the API can still leave a broken app (import
    error, bad template), so the deploy is not considered successful until the
    site answers.
    """
    url = f"https://{domain}/"
    last = ""
    for attempt in range(1, attempts + 1):
        try:
            response = requests.get(url, timeout=20)
            if response.status_code == 200:
                print(f"  healthy ({response.status_code}) after {attempt} attempt(s)")
                return
            last = f"HTTP {response.status_code}"
        except requests.RequestException as error:
            last = str(error)
        print(f"  attempt {attempt}/{attempts}: {last}")
        if attempt < attempts:
            time.sleep(delay)

    raise DeployError(
        f"Files uploaded and reloaded, but {url} is not healthy ({last}).\n"
        "The application directory has already been updated — check the "
        "PythonAnywhere error log and roll back if needed."
    )



def _upload_absolute(session: requests.Session, api_root: str, remote_dir: str,
                     local: Path, relative: Path, attempts: int = 6) -> str:
    """Upload one file, waiting out the API's rate limiter if it pushes back."""
    remote_path = f"{remote_dir.rstrip('/')}/{relative.as_posix()}"
    url = f"{api_root}/files/path{remote_path}"

    for attempt in range(1, attempts + 1):
        with local.open("rb") as handle:
            response = session.post(url, files={"content": handle})

        if response.status_code == 201:
            return "created"
        if response.status_code == 200:
            return "updated"

        if response.status_code == 429 and attempt < attempts:
            hint = THROTTLE_HINT.search(response.text)
            delay = int(hint.group(1)) + 2 if hint else 15 * attempt
            print(f"  throttled, waiting {delay}s ({attempt}/{attempts - 1})")
            time.sleep(delay)
            continue

        raise DeployError(
            f"Upload failed for {relative} (HTTP {response.status_code}): {response.text[:200]}"
        )

    raise DeployError(f"Gave up on {relative} after {attempts} throttled attempts")


def prune_images(dry_run: bool) -> int:
    """Delete named images from the backend.

    Driven by an explicit list. The server is the only place images live, so
    there is nothing to diff against and no way to undo a wrong delete — the
    caller names exactly what goes, and anything the content API still
    references is refused.
    """
    raw = os.environ.get("PA_PRUNE_LIST", "")
    wanted = [line.strip() for line in raw.replace(",", "\n").splitlines() if line.strip()]
    if not wanted:
        raise DeployError("PA_PRUNE_LIST is empty — nothing to prune")

    # The server is the only home for images now, so "in use" is decided by the
    # content API rather than by anything in the repo.
    in_use = set()
    base = os.environ.get("PA_PUBLIC_URL", "").rstrip("/")
    if base:
        for path, key in (("/content/projects", "projects"), ("/content/recommendations", "recommendations")):
            reply = requests.get(f"{base}{path}", timeout=30)
            reply.raise_for_status()
            for item in reply.json()[key]:
                for field in ("image", "avatar"):
                    if item.get(field):
                        in_use.add(item[field].rsplit("/content/images/", 1)[-1])
                for block in item.get("modal", {}).get("blocks", []):
                    if block.get("kind") == "image":
                        in_use.add(block["src"].rsplit("/content/images/", 1)[-1])
    else:
        raise DeployError("PA_PUBLIC_URL is required so the prune can tell what is in use")

    collisions = sorted(set(wanted) & in_use)
    if collisions:
        raise DeployError(
            "Refusing to prune — these are still referenced by the content API:\n  "
            + "\n  ".join(collisions)
        )

    print(f"Pruning {len(wanted)} images")
    for relative in wanted:
        print(f"  {relative}")

    if dry_run:
        print("\nPA_DRY_RUN set — nothing was deleted.")
        return 0

    token = require_env("PA_API_TOKEN")
    username = require_env("PA_USERNAME")
    remote_dir = require_env("PA_REMOTE_DIR")
    host = os.environ.get("PA_HOST", "www.pythonanywhere.com").strip()

    session = requests.Session()
    session.headers["Authorization"] = f"Token {token}"
    api_root = f"https://{host}/api/v0/user/{username}"

    for index, relative in enumerate(wanted, start=1):
        remote_path = f"{remote_dir.rstrip('/')}/content_images/{relative}"
        response = session.delete(f"{api_root}/files/path{remote_path}")
        if response.status_code in (204, 200):
            print(f"  [{index}/{len(wanted)}] deleted  {relative}")
        elif response.status_code == 404:
            print(f"  [{index}/{len(wanted)}] absent   {relative}")
        else:
            raise DeployError(
                f"Delete failed for {relative} (HTTP {response.status_code}): "
                f"{response.text[:200]}"
            )
        if index < len(wanted):
            time.sleep(1.5)

    print("\nDone.")
    return 0


def main() -> int:
    dry_run = os.environ.get("PA_DRY_RUN", "").lower() in {"1", "true", "yes"}

    if os.environ.get("PA_MODE", "").lower() == "prune-images":
        return prune_images(dry_run)


    source_root = Path(os.environ.get("PA_SOURCE_DIR", "backend-service")).resolve()
    if not source_root.is_dir():
        raise DeployError(f"Source directory not found: {source_root}")

    manifest = build_manifest(source_root)
    assert_manifest_safe(manifest)

    print(f"Deploying {len(manifest)} files from {source_root}")
    for relative in manifest:
        size = (source_root / relative).stat().st_size
        print(f"  {relative.as_posix():<48} {size:>8,} bytes")

    protected = sorted(
        p.name for p in source_root.rglob("*")
        if p.is_file() and (p.name in DENIED_NAMES or p.suffix.lower() in DENIED_SUFFIXES)
    )
    if protected:
        print("\nProtected, will NOT be uploaded:")
        for name in protected:
            print(f"  {name}")

    if dry_run:
        print("\nPA_DRY_RUN set — nothing was uploaded.")
        return 0

    token = require_env("PA_API_TOKEN")
    username = require_env("PA_USERNAME")
    domain = require_env("PA_DOMAIN")
    remote_dir = require_env("PA_REMOTE_DIR")
    host = os.environ.get("PA_HOST", "www.pythonanywhere.com").strip()

    api_root = f"https://{host}/api/v0/user/{username}"
    session = requests.Session()
    session.headers["Authorization"] = f"Token {token}"

    print(f"\nUploading to {host}:{remote_dir}")
    completed: list[Path] = []
    try:
        for relative in manifest:
            outcome = upload(session, api_root, remote_dir, source_root, relative)
            completed.append(relative)
            print(f"  {outcome:<8} {relative.as_posix()}")
    except DeployError:
        # Uploads are not transactional, so say exactly how far we got.
        print(
            f"\nUpload aborted after {len(completed)}/{len(manifest)} files. "
            "The app directory is in a mixed state and was NOT reloaded.",
            file=sys.stderr,
        )
        for relative in completed:
            print(f"  already uploaded: {relative.as_posix()}", file=sys.stderr)
        raise

    print(f"\nReloading {domain}")
    reload_webapp(session, api_root, domain)

    print(f"\nVerifying https://{domain}/")
    verify_live(domain)

    print("\nDone.")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except DeployError as error:
        print(f"\nERROR: {error}", file=sys.stderr)
        sys.exit(1)
