"""Portfolio content storage.

Projects and recommendations used to live in the frontend bundle. They are now
served from here so they can be edited without a redeploy.

The tables are created and seeded on demand from content_seed.json, and seeding
only ever fills an empty table. That matters once content is edited through a
dashboard: a redeploy ships a stale seed file, and it must not overwrite live
edits.
"""

import json
import os
import sqlite3

import images

THIS_FOLDER = os.path.dirname(os.path.abspath(__file__))
DATABASE = os.path.join(THIS_FOLDER, 'database.db')
SEED_FILE = os.path.join(THIS_FOLDER, 'content_seed.json')

SCHEMA = """
CREATE TABLE IF NOT EXISTS projects (
    id          TEXT PRIMARY KEY,
    sort_order  INTEGER NOT NULL,
    category    TEXT    NOT NULL,
    title       TEXT    NOT NULL,
    description TEXT    NOT NULL,
    href        TEXT,
    image       TEXT    NOT NULL,
    image_alt   TEXT,
    hidden      INTEGER NOT NULL DEFAULT 0,
    modal_json  TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS recommendations (
    id          TEXT PRIMARY KEY,
    sort_order  INTEGER NOT NULL,
    name        TEXT    NOT NULL,
    role        TEXT    NOT NULL,
    avatar      TEXT    NOT NULL,
    excerpt     TEXT    NOT NULL,
    modal_json  TEXT    NOT NULL
);
"""


def connect():
    connection = sqlite3.connect(DATABASE)
    connection.row_factory = sqlite3.Row
    return connection


def project_to_row(index, item):
    return (
        item['id'], index, item['category'], item['title'], item['description'],
        item.get('href'), item['image'], item.get('imageAlt'),
        1 if item.get('hidden') else 0, json.dumps(item['modal']),
    )


def recommendation_to_row(index, item):
    return (
        item['id'], index, item['name'], item['role'], item['avatar'],
        item['excerpt'], json.dumps(item['modal']),
    )


def rewrite_modal_images(modal):
    """Point any image blocks at the public image host."""
    for block in modal.get('blocks', []):
        if block.get('kind') == 'image':
            block['src'] = images.to_public_url(block.get('src'))
    return modal


def row_to_project(row):
    """Rebuild the exact shape the frontend already expects."""
    project = {
        'id': row['id'],
        'category': row['category'],
        'title': row['title'],
        'description': row['description'],
        'image': images.to_public_url(row['image']),
        'modal': rewrite_modal_images(json.loads(row['modal_json'])),
    }
    # Optional keys are omitted rather than sent as null, so the payload matches
    # the frontend's optional-property types.
    if row['href']:
        project['href'] = row['href']
    if row['image_alt']:
        project['imageAlt'] = row['image_alt']
    if row['hidden']:
        project['hidden'] = True
    return project


def row_to_recommendation(row):
    return {
        'id': row['id'],
        'name': row['name'],
        'role': row['role'],
        'avatar': images.to_public_url(row['avatar']),
        'excerpt': row['excerpt'],
        'modal': rewrite_modal_images(json.loads(row['modal_json'])),
    }


def ensure_ready(connection):
    """Create the tables, and seed any table that is still empty."""
    connection.executescript(SCHEMA)

    empty = [
        table for table in ('projects', 'recommendations')
        if connection.execute(f'SELECT COUNT(*) FROM {table}').fetchone()[0] == 0
    ]
    if not empty:
        return

    if not os.path.exists(SEED_FILE):
        # Nothing to seed from; the endpoints will return empty lists and the
        # frontend will fall back to its bundled copy.
        return

    with open(SEED_FILE, 'r', encoding='utf-8') as handle:
        seed = json.load(handle)

    if 'projects' in empty:
        connection.executemany(
            'INSERT INTO projects (id, sort_order, category, title, description,'
            ' href, image, image_alt, hidden, modal_json)'
            ' VALUES (?,?,?,?,?,?,?,?,?,?)',
            [project_to_row(i, p) for i, p in enumerate(seed.get('projects', []))],
        )

    if 'recommendations' in empty:
        connection.executemany(
            'INSERT INTO recommendations (id, sort_order, name, role, avatar,'
            ' excerpt, modal_json) VALUES (?,?,?,?,?,?,?)',
            [
                recommendation_to_row(i, r)
                for i, r in enumerate(seed.get('recommendations', []))
            ],
        )

    connection.commit()


def get_projects():
    connection = connect()
    try:
        ensure_ready(connection)
        rows = connection.execute(
            'SELECT * FROM projects ORDER BY sort_order'
        ).fetchall()
        return [row_to_project(row) for row in rows]
    finally:
        connection.close()


def get_recommendations():
    connection = connect()
    try:
        ensure_ready(connection)
        rows = connection.execute(
            'SELECT * FROM recommendations ORDER BY sort_order'
        ).fetchall()
        return [row_to_recommendation(row) for row in rows]
    finally:
        connection.close()
