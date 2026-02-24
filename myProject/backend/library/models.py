from decimal import Decimal

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models, transaction
from django.utils import timezone


class Book(models.Model):
    CATEGORY_CHOICES = (
        ("fiction", "Fiction"),
        ("non-fiction", "Non-Fiction"),
        ("science", "Science"),
        ("technology", "Technology"),
        ("history", "History"),
        ("mathematics", "Mathematics"),
        ("arts", "Arts"),
        ("biography", "Biography"),
        ("reference", "Reference"),
        ("other", "Other"),
    )

    title = models.CharField(max_length=200)
    author = models.CharField(max_length=200)
    isbn = models.CharField(max_length=13, unique=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default="other")
    quantity = models.PositiveIntegerField(default=1)
    available_quantity = models.PositiveIntegerField(default=1)
    published_date = models.DateField(blank=True, null=True)
    description = models.TextField(blank=True)
    publisher = models.CharField(max_length=200, blank=True)
    cover_image = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title

    def is_available(self):
        return self.available_quantity > 0

    def clean(self):
        if self.available_quantity > self.quantity:
            raise ValidationError("available_quantity cannot exceed quantity.")

    def save(self, *args, **kwargs):
        if not self.pk:
            self.available_quantity = self.quantity
        self.full_clean()
        super().save(*args, **kwargs)


class BorrowRecord(models.Model):
    STATUS_CHOICES = (
        ("borrowed", "Borrowed"),
        ("returned", "Returned"),
        ("overdue", "Overdue"),
    )
    DAILY_FINE = Decimal("1.00")

    member = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="borrow_records",
    )
    book = models.ForeignKey(
        Book,
        on_delete=models.CASCADE,
        related_name="borrow_records",
    )
    borrow_date = models.DateTimeField(default=timezone.now)
    due_date = models.DateTimeField()
    return_date = models.DateTimeField(blank=True, null=True)
    fine_amount = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="borrowed")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-borrow_date"]

    def __str__(self):
        return f"{self.member.username} - {self.book.title}"

    @property
    def is_overdue(self):
        if self.status == "returned":
            return False
        return timezone.now() > self.due_date

    def calculate_fine(self):
        compare_date = self.return_date or timezone.now()
        if compare_date <= self.due_date:
            return Decimal("0.00")
        days_overdue = (compare_date.date() - self.due_date.date()).days
        return Decimal(days_overdue) * self.DAILY_FINE

    @transaction.atomic
    def mark_returned(self):
        if self.status == "returned":
            raise ValidationError("Book already returned.")

        locked_book = Book.objects.select_for_update().get(pk=self.book_id)
        self.return_date = timezone.now()
        self.fine_amount = self.calculate_fine()
        self.status = "returned"
        self.save(update_fields=["return_date", "fine_amount", "status", "updated_at"])
        locked_book.available_quantity = min(
            locked_book.quantity,
            locked_book.available_quantity + 1,
        )
        locked_book.save(update_fields=["available_quantity", "updated_at"])
        if self.fine_amount > 0:
            Fine.objects.get_or_create(
                member=self.member,
                borrow_record=self,
                defaults={
                    "amount": self.fine_amount,
                    "reason": f'Overdue return for "{locked_book.title}"',
                },
            )


class Fine(models.Model):
    STATUS_CHOICES = (
        ("unpaid", "Unpaid"),
        ("paid", "Paid"),
    )

    member = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="fines",
    )
    borrow_record = models.ForeignKey(
        BorrowRecord,
        on_delete=models.CASCADE,
        related_name="fines",
        blank=True,
        null=True,
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="unpaid")
    paid_date = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.member.username} - {self.amount}"
