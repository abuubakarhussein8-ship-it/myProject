from django.contrib import admin
from .models import Book, BorrowRecord, Fine

@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    """Admin view for Books"""
    list_display = ('title', 'author', 'category', 'quantity', 'available_quantity', 'is_available')
    search_fields = ('title', 'author', 'isbn')
    list_filter = ('category',)
    readonly_fields = ('available_quantity',)

@admin.register(BorrowRecord)
class BorrowRecordAdmin(admin.ModelAdmin):
    """Admin view for Borrow Records"""
    list_display = ('member', 'book', 'borrow_date', 'due_date', 'return_date', 'status', 'is_overdue')
    search_fields = ('member__username', 'book__title')
    list_filter = ('status', 'borrow_date', 'due_date')
    autocomplete_fields = ('member', 'book')
    actions = ['mark_as_returned']

    def mark_as_returned(self, request, queryset):
        """Action to return books directly from admin dashboard"""
        count = 0
        for record in queryset:
            if record.status != 'returned':
                record.mark_returned()
                count += 1
        self.message_user(request, f"{count} books marked as returned successfully.")
    mark_as_returned.short_description = "Return selected books"

@admin.register(Fine)
class FineAdmin(admin.ModelAdmin):
    """Admin view for Fines"""
    list_display = ('member', 'borrow_record', 'amount', 'status', 'created_at')
    search_fields = ('member__username',)
    list_filter = ('status',)
    autocomplete_fields = ('member', 'borrow_record')
