"""Image storage for portfolio content.

Images are served from here so they can be added without a frontend redeploy.

The database keeps portable paths (``/assets/images/...``) rather than absolute
URLs, and they are turned into absolute URLs on the way out. That keeps the
stored data host-independent: moving images elsewhere later is a config change
rather than a data migration.
"""

import os
import re

from flask import has_request_context, request, send_from_directory

THIS_FOLDER = os.path.dirname(os.path.abspath(__file__))
IMAGE_ROOT = os.path.join(THIS_FOLDER, 'content_images')

# Raster formats only. SVG is deliberately excluded: it can carry script, and
# these files are served from the same origin as the analytics dashboard.
ALLOWED_EXTENSIONS = {'.webp', '.png', '.jpg', '.jpeg', '.gif'}

MAX_UPLOAD_BYTES = 5 * 1024 * 1024

# Matches the paths stored in the database, e.g. /assets/images/projects/x.webp
STORED_PATH = re.compile(r'^/assets/images/(?P<rest>[A-Za-z0-9._/-]+)$')

# A single path segment: letters, digits, dot, dash, underscore. No slashes, no
# "..", so a crafted name cannot climb out of IMAGE_ROOT.
SAFE_SEGMENT = re.compile(r'^[A-Za-z0-9][A-Za-z0-9._-]*$')


def public_base_url():
    """Absolute base for image URLs.

    Derived from the incoming request so no configuration is needed, with an
    environment override for the case where the service sits behind a proxy or
    a different public hostname.
    """
    configured = os.environ.get('CONTENT_IMAGE_BASE_URL', '').strip()
    if configured:
        return configured.rstrip('/')
    if has_request_context():
        return request.url_root.rstrip('/')
    return ''


def to_public_url(stored_path):
    """Turn a stored path into a URL the browser can fetch.

    Rewriting is per-image and conditional on the file actually being here. An
    image that has not been copied across yet keeps its frontend-relative path
    and carries on being served by the frontend host, so the two can be
    migrated in any order without a window of broken images.

    Anything that is not a recognised stored path — an absolute URL someone
    entered by hand, say — is passed through untouched.
    """
    if not stored_path:
        return stored_path

    match = STORED_PATH.match(stored_path)
    if not match:
        return stored_path

    relative = match.group('rest')
    if safe_relative_path(relative) is None:
        return stored_path

    absolute = os.path.join(IMAGE_ROOT, *relative.split('/'))
    if not os.path.isfile(absolute):
        return stored_path

    base = public_base_url()
    if not base:
        return stored_path

    return f"{base}/content/images/{relative}"


def safe_relative_path(relative):
    """Validate a caller-supplied path, or return None if it is not safe."""
    if not relative or len(relative) > 200:
        return None

    parts = relative.split('/')
    if not all(SAFE_SEGMENT.match(part) for part in parts):
        return None

    if os.path.splitext(parts[-1])[1].lower() not in ALLOWED_EXTENSIONS:
        return None

    return '/'.join(parts)


def serve(relative):
    safe = safe_relative_path(relative)
    if safe is None:
        return None

    absolute = os.path.join(IMAGE_ROOT, *safe.split('/'))
    if not os.path.isfile(absolute):
        return None

    directory = os.path.dirname(absolute)
    response = send_from_directory(directory, os.path.basename(absolute))
    # Content images are replaced by uploading a new name, so they can be
    # cached hard.
    response.headers['Cache-Control'] = 'public, max-age=86400'
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response


def upload_token():
    return os.environ.get('CONTENT_UPLOAD_TOKEN', '')


def store(relative, file_storage):
    """Write an uploaded file. Returns the stored path, or raises ValueError."""
    safe = safe_relative_path(relative)
    if safe is None:
        raise ValueError(
            'Invalid path. Use letters, digits, dots, dashes, underscores and '
            f'slashes, ending in one of: {", ".join(sorted(ALLOWED_EXTENSIONS))}'
        )

    blob = file_storage.read()
    if len(blob) > MAX_UPLOAD_BYTES:
        raise ValueError(f'File is larger than {MAX_UPLOAD_BYTES // (1024 * 1024)}MB')
    if not blob:
        raise ValueError('File is empty')

    absolute = os.path.join(IMAGE_ROOT, *safe.split('/'))
    os.makedirs(os.path.dirname(absolute), exist_ok=True)
    with open(absolute, 'wb') as handle:
        handle.write(blob)

    return f'/assets/images/{safe}'
