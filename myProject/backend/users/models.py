from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    """Extended User model for library members"""
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('member', 'Member'),
    )
    
    MEMBER_TYPE_CHOICES = (
        ('student', 'Student'),
        ('teacher', 'Teacher'),
        ('faculty', 'Faculty'),
    )
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    member_type = models.CharField(max_length=20, choices=MEMBER_TYPE_CHOICES, blank=True, null=True)
    membership_date = models.DateField(auto_now_add=True)
    membership_end_date = models.DateField(null=True, blank=True)
    
    def __str__(self):
        return self.username

    def save(self, *args, **kwargs):
        # Ikiwa role ni admin, mpe is_staff=True ili aingie kwenye dashboard
        if self.role == 'admin':
            self.is_staff = True
        super().save(*args, **kwargs)
