from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

class CustomUserAdmin(UserAdmin):
    # Hii inaonyesha columns hizi kwenye orodha ya users
    list_display = ('username', 'email', 'first_name', 'last_name', 'role', 'is_staff')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    
    # Hii inaongeza fields zako mpya kwenye fomu ya kurekebisha user
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('role', 'phone', 'address', 'member_type')}),
    )

# Sajili model ya User na mipangilio hii
admin.site.register(User, CustomUserAdmin)
