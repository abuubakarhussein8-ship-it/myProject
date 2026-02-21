from django.db import models
from django.conf import settings
from django.utils import timezone


class Book(models.Model):
    """Book model for library inventory"""
    CATEGORY_CHOICES = (
        ('fiction', 'Fiction'),
        ('non-fiction', 'Non-Fiction'),
        ('science', 'Science'),
        ('technology', 'Technology'),
        ('history', 'History'),
        ('mathematics', 'Mathematics'),
        ('arts', 'Arts'),
        ('biography', 'Biography'),
        ('reference', 'Reference'),
        ('other', 'Other'),
    )
    
    title = models.CharField(max_length=200)
    author = models.CharField(max_length=200)
    isbn = models.CharField(max_length=13, unique=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='other')
    description = models.TextField(blank=True)
    publisher = models.CharField(max_length=200, blank=True)
    publish_year = models.IntegerField(null=True, blank=True)
    quantity = models.IntegerField(default=1)
    available_quantity = models.IntegerField(default=1)
    cover_image = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    def is_available(self):
        return self.available_quantity > 0

    def save(self, *args, **kwargs):
        # Wakati wa kuunda kitabu kipya, available_quantity iwe sawa na quantity
        if not self.pk:
            self.available_quantity = self.quantity
        super().save(*args, **kwargs)


class BorrowRecord(models.Model):
    """Borrow record for tracking book loans"""
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('borrowed', 'Borrowed'),
        ('returned', 'Returned'),
        ('overdue', 'Overdue'),
    )
    
    member = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='borrow_records'
    )
    book = models.ForeignKey(
        Book,
        on_delete=models.CASCADE,
        related_name='borrow_records'
    )
    request_date = models.DateTimeField(auto_now_add=True)
    borrow_date = models.DateTimeField(null=True, blank=True)
    due_date = models.DateTimeField(null=True, blank=True)
    return_date = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    rejection_reason = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-request_date']
    
    def __str__(self):
        return f"{self.member.username} - {self.book.title}"
    
    def is_overdue(self):
        if self.status == 'returned':
            return False
        return timezone.now() > self.due_date
    
    def calculate_fine(self):
        """Calculate fine for overdue returns"""
        if self.is_overdue():
            days_overdue = (timezone.now() - self.due_date).days
            return days_overdue * 1.00  # $1 per day
        return 0


class Fine(models.Model):
    """Fine model for tracking overdue fines"""
    STATUS_CHOICES = (
        ('unpaid', 'Unpaid'),
        ('paid', 'Paid'),
    )
    
    member = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='fines'
    )
    borrow_record = models.ForeignKey(
        BorrowRecord,
        on_delete=models.CASCADE,
        related_name='fines',
        null=True,
        blank=True
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='unpaid')
    paid_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.member.username} - ${self.amount}"
