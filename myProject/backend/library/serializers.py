from datetime import timedelta

from django.contrib.auth import get_user_model
from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from users.serializers import UserSerializer
from .models import Book, BorrowRecord, Fine

User = get_user_model()


class BookSerializer(serializers.ModelSerializer):
    is_available = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = [
            "id",
            "title",
            "author",
            "isbn",
            "category",
            "quantity",
            "available_quantity",
            "published_date",
            "description",
            "publisher",
            "cover_image",
            "is_available",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "available_quantity", "created_at", "updated_at"]

    def get_is_available(self, obj):
        return obj.available_quantity > 0


class BorrowRecordSerializer(serializers.ModelSerializer):
    member_details = UserSerializer(source="member", read_only=True)
    book_details = BookSerializer(source="book", read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)

    class Meta:
        model = BorrowRecord
        fields = [
            "id",
            "member",
            "member_details",
            "book",
            "book_details",
            "borrow_date",
            "due_date",
            "return_date",
            "fine_amount",
            "status",
            "is_overdue",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "borrow_date",
            "return_date",
            "fine_amount",
            "status",
            "created_at",
            "updated_at",
        ]


class BorrowBookSerializer(serializers.ModelSerializer):
    due_date = serializers.DateTimeField(required=False)

    class Meta:
        model = BorrowRecord
        fields = ["id", "member", "book", "due_date"]
        read_only_fields = ["id"]
        extra_kwargs = {
            "member": {"required": False},
        }

    def validate(self, attrs):
        if not attrs.get("due_date"):
            attrs["due_date"] = timezone.now() + timedelta(days=14)
        if attrs["due_date"] <= timezone.now():
            raise serializers.ValidationError({"due_date": "Due date must be in the future."})
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        book = Book.objects.select_for_update().get(pk=validated_data["book"].id)
        if book.available_quantity <= 0:
            raise serializers.ValidationError({"book": "No available stock for this book."})

        book.available_quantity -= 1
        book.save(update_fields=["available_quantity", "updated_at"])
        return BorrowRecord.objects.create(
            member=validated_data["member"],
            book=book,
            due_date=validated_data["due_date"],
        )


class FineSerializer(serializers.ModelSerializer):
    member_details = UserSerializer(source="member", read_only=True)
    book_title = serializers.SerializerMethodField()

    class Meta:
        model = Fine
        fields = [
            "id",
            "member",
            "member_details",
            "borrow_record",
            "book_title",
            "amount",
            "reason",
            "status",
            "paid_date",
            "created_at",
        ]
        read_only_fields = ["id", "created_at", "paid_date"]

    def get_book_title(self, obj):
        if obj.borrow_record and obj.borrow_record.book:
            return obj.borrow_record.book.title
        return None
