"""PostgreSQL backend selection and Phase 1 compatibility helpers."""
import os
import sqlite3
from functools import wraps

import psycopg
from psycopg.rows import dict_row
from flask import current_app, jsonify


class StorageConfigurationError(RuntimeError):
    pass


DATABASE_ERRORS = (sqlite3.Error, psycopg.Error, OSError, StorageConfigurationError)
UNIQUE_ERRORS = (sqlite3.IntegrityError, psycopg.errors.UniqueViolation)


def postgres_connection(config):
    """Return a PostgreSQL adapter, or None for explicitly local SQLite use."""
    url = config.get('DATABASE_URL')
    if url:
        return PostgresConnection(psycopg.connect(
            url, row_factory=dict_row, connect_timeout=10))
    production = (os.environ.get('VERCEL') == '1'
                  or os.environ.get('VERCEL_ENV') in ('production', 'preview')
                  or os.environ.get('APP_ENV', '').lower() == 'production'
                  or os.environ.get('FLASK_ENV', '').lower() == 'production')
    if production:
        raise StorageConfigurationError('DATABASE_URL is required in production.')
    return None


class PostgresConnection:
    """Translate our static SQLite-style placeholders; values stay parameterized.

    Only application-owned SQL is accepted here. No user SQL or literal question
    marks are used by these queries. PostgreSQL schema creation is CLI-only.
    """
    def __init__(self, connection):
        self.connection = connection

    def execute(self, sql, parameters=()):
        return self.connection.execute(sql.replace('?', '%s'), parameters)

    def executemany(self, sql, parameters):
        with self.connection.cursor() as cursor:
            cursor.executemany(sql.replace('?', '%s'), parameters)

    def cursor(self, dictionary=False):
        return self.connection.cursor(row_factory=dict_row if dictionary else None)

    def rollback(self):
        self.connection.rollback()

    def close(self):
        self.connection.close()

    def __enter__(self):
        return self

    def __exit__(self, kind, value, traceback):
        if kind is None:
            self.connection.commit()
        else:
            self.connection.rollback()


def insert_preset(connection, user_id, name, settings):
    sql = 'INSERT INTO settings_presets (user_id, name, settings) VALUES (?, ?, ?)'
    values = (user_id, name, settings)
    if isinstance(connection, PostgresConnection):
        return connection.execute(sql + ' RETURNING id', values).fetchone()['id']
    return connection.execute(sql, values).lastrowid


def preset_database_errors(function):
    @wraps(function)
    def wrapped(*args, **kwargs):
        try:
            return function(*args, **kwargs)
        except DATABASE_ERRORS as error:
            # Do not log connection strings or driver exception details.
            current_app.logger.error('Preset storage unavailable (%s)', type(error).__name__)
            return jsonify(error='Profile presets are temporarily unavailable. Please try again later.'), 503
    return wrapped
