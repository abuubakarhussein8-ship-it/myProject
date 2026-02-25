"""
Compatibility script for creating the default admin user.

Prefer running:
    python manage.py create_default_admin
"""

import os
import subprocess
import sys


def main() -> int:
    username = os.getenv("DEFAULT_ADMIN_USERNAME")
    password = os.getenv("DEFAULT_ADMIN_PASSWORD")

    if not username or not password:
        print(
            "Set DEFAULT_ADMIN_USERNAME and DEFAULT_ADMIN_PASSWORD before running this script.",
            file=sys.stderr,
        )
        return 1

    return subprocess.call([sys.executable, "manage.py", "create_default_admin"])


if __name__ == "__main__":
    raise SystemExit(main())
