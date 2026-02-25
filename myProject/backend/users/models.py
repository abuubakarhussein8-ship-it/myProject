from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = (
        ("admin", "Admin"),
        ("librarian", "Librarian"),
        ("member", "Member"),
    )
    MEMBER_TYPE_CHOICES = (
        ("student", "Student"),
        ("teacher", "Teacher"),
        ("faculty", "Faculty"),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="member")
    member_type = models.CharField(
        max_length=20,
        choices=MEMBER_TYPE_CHOICES,
        blank=True,
        null=True,
    )

    def __str__(self):
        return self.username

    def save(self, *args, **kwargs):
        # Never demote superusers from Django admin access.
        self.is_staff = self.is_superuser or self.role in {"admin", "librarian"}
        super().save(*args, **kwargs)


class MemberProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="member_profile",
    )
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    membership_date = models.DateField(auto_now_add=True)
    membership_expiry = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} profile"
