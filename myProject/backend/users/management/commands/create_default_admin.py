import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction


class Command(BaseCommand):
    help = "Create or update a default admin user from environment variables."

    def handle(self, *args, **options):
        username = os.getenv("DEFAULT_ADMIN_USERNAME")
        password = os.getenv("DEFAULT_ADMIN_PASSWORD")
        email = os.getenv("DEFAULT_ADMIN_EMAIL", "")

        if not username or not password:
            self.stdout.write(
                self.style.WARNING(
                    "Skipping default admin creation. "
                    "Set DEFAULT_ADMIN_USERNAME and DEFAULT_ADMIN_PASSWORD."
                )
            )
            return

        User = get_user_model()

        with transaction.atomic():
            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    "email": email,
                    "is_staff": True,
                    "is_superuser": True,
                    "role": "admin",
                },
            )

            user.set_password(password)
            user.is_staff = True
            user.is_superuser = True
            user.role = "admin"

            if email:
                user.email = email

            user.save()

        if created:
            self.stdout.write(self.style.SUCCESS(f"Default admin '{username}' created."))
        else:
            self.stdout.write(
                self.style.SUCCESS(f"Default admin '{username}' already exists and was updated.")
            )
