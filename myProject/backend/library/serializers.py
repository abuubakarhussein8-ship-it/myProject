from rest_framework import serializers
from django.utils import timezone
from .models import Book, BorrowRecord, Fine
from users.serializers import UserSerializer


# ==============================
# BOOK SERIALIZERS
# ==============================

class BookSerializer(serializers.ModelSerializer):
    """
    Full serializer for Book model
    Used for retrieve, create, update
    """
    is_available = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = [
            'id',
            'title',
            'author',
            'isbn',
            'category',
            'description',
            'publisher',
            'publish_year',
            'quantity',
            'available_quantity',
            'cover_image',
            'is_available',
            'created_at',
            'updated_at'
        ]
        read_only_fields = [
            'id',
            'available_quantity',
            'created_at',
            'updated_at'
        ]

    def get_is_available(self, obj):
        return obj.available_quantity > 0


class BookListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for listing books
    (Faster for frontend tables)
    """
    is_available = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = [
            'id',
            'title',
            'author',
            'isbn',
            'category',
            'available_quantity',
            'is_available'
        ]

    def get_is_available(self, obj):
        return obj.available_quantity > 0


# ==============================
# BORROW RECORD SERIALIZERS
# ==============================

class BorrowRecordSerializer(serializers.ModelSerializer):
    """
    Full serializer for BorrowRecord
    """
    member_details = UserSerializer(source='member', read_only=True)
    member_username = serializers.CharField(source='member.username', read_only=True)

    book_details = BookSerializer(source='book', read_only=True)
    book_title = serializers.CharField(source='book.title', read_only=True)

    is_overdue = serializers.SerializerMethodField()
    fine_amount = serializers.SerializerMethodField()

    class Meta:
        model = BorrowRecord
        fields = [
            'id',
            'member',
            'member_details',
            'member_username',
            'book',
            'book_details',
            'book_title',
            'borrow_date',
            'due_date',
            'return_date',
            'status',
            'is_overdue',
            'fine_amount',
            'created_at',
            'updated_at'
        ]
        read_only_fields = [
            'id',
            'borrow_date',
            'status',
            'created_at',
            'updated_at'
        ]

    def get_is_overdue(self, obj):
        if obj.status == 'returned':
            return False
        if obj.due_date:
            return timezone.now() > obj.due_date
        return False

    def get_fine_amount(self, obj):
        if obj.due_date and obj.status != 'returned':
            if timezone.now() > obj.due_date:
                days_overdue = (timezone.now() - obj.due_date).days
                return float(days_overdue * 1.00)
        return 0.0


class BorrowRecordCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating borrow request
    """

    class Meta:
        model = BorrowRecord
        fields = ['id', 'member', 'book', 'due_date']

    def validate(self, data):
        book = data.get('book')

        if book.available_quantity <= 0:
            raise serializers.ValidationError({
                "book": "Book is not available for borrowing"
            })

        return data

    def create(self, validated_data):
        book = validated_data['book']

        # Reduce available quantity
        book.available_quantity -= 1
        book.save()

        return super().create(validated_data)


# ==============================
# FINE SERIALIZERS
# ==============================

class FineSerializer(serializers.ModelSerializer):
    """
    Serializer for Fine model
    """
    member_details = UserSerializer(source='member', read_only=True)
    member_username = serializers.CharField(source='member.username', read_only=True)
    book_title = serializers.SerializerMethodField()

    class Meta:
        model = Fine
        fields = [
            'id',
            'member',
            'member_details',
            'member_username',
            'borrow_record',
            'amount',
            'reason',
            'status',
            'paid_date',
            'created_at',
            'book_title'
        ]
        read_only_fields = ['id', 'created_at']

    def get_book_title(self, obj):
        if obj.borrow_record and obj.borrow_record.book:
            return obj.borrow_record.book.title
        return None


class FinePaymentSerializer(serializers.Serializer):
    """
    Serializer for processing fine payments
    """
    fine_id = serializers.IntegerField()

    def validate(self, data):
        try:
            fine = Fine.objects.get(id=data['fine_id'])
        except Fine.DoesNotExist:
            raise serializers.ValidationError("Fine not found")

        if fine.status == 'paid':
            raise serializers.ValidationError("Fine already paid")

        return data

    def save(self):
        fine = Fine.objects.get(id=self.validated_data['fine_id'])
        fine.status = 'paid'
        fine.paid_date = timezone.now()
        fine.save()
        return fine