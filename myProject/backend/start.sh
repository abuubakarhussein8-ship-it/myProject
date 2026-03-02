#!/usr/bin/env bash
set -o errexit

python manage.py migrate
python manage.py create_default_admin
gunicorn library_project.wsgi:application
