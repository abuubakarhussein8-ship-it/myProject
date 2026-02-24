from django.contrib.auth import get_user_model
from django.db.models import Q, Sum
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Book, BorrowRecord, Fine
from .permissions import IsAdminOrLibrarian
from .serializers import (
    BookSerializer,
    BorrowBookSerializer,
    BorrowRecordSerializer,
    FineSerializer,
)

User = get_user_model()


class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all().order_by("-created_at")
    serializer_class = BookSerializer

    def get_permissions(self):
        if self.action in {"create", "update", "partial_update", "destroy"}:
            return [IsAdminOrLibrarian()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get("search")
        category = self.request.query_params.get("category")
        available = self.request.query_params.get("available")

        if search:
            queryset = queryset.filter(
                Q(title__icontains=search)
                | Q(author__icontains=search)
                | Q(isbn__icontains=search)
            )
        if category:
            queryset = queryset.filter(category=category)
        if available == "true":
            queryset = queryset.filter(available_quantity__gt=0)
        return queryset


class BorrowRecordViewSet(viewsets.ModelViewSet):
    queryset = BorrowRecord.objects.select_related("book", "member").all().order_by("-borrow_date")

    def get_serializer_class(self):
        if self.action == "create":
            return BorrowBookSerializer
        return BorrowRecordSerializer

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        status_filter = self.request.query_params.get("status")
        if user.role == "member":
            qs = qs.filter(member=user)
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == "member":
            serializer.save(member=user)
            return

        if user.role in {"admin", "librarian"}:
            member_id = self.request.data.get("member")
            if member_id:
                member = User.objects.filter(pk=member_id, role="member").first()
                if not member:
                    raise ValidationError({"member": "Selected member does not exist."})
                serializer.save(member=member)
                return
            serializer.save(member=user)
            return
        serializer.save(member=user)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def return_book(self, request, pk=None):
        record = self.get_object()
        if request.user.role == "member" and record.member_id != request.user.id:
            return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)

        record.mark_returned()
        return Response(
            BorrowRecordSerializer(record, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def history(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = BorrowRecordSerializer(page, many=True, context={"request": request})
            return self.get_paginated_response(serializer.data)
        serializer = BorrowRecordSerializer(queryset, many=True, context={"request": request})
        return Response(serializer.data)


class FineViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Fine.objects.select_related("member", "borrow_record", "borrow_record__book").all()
    serializer_class = FineSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()
        if user.role == "member":
            return queryset.filter(member=user)
        return queryset

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def pay(self, request, pk=None):
        fine = self.get_object()
        if request.user.role == "member" and fine.member_id != request.user.id:
            return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)
        if fine.status == "paid":
            return Response({"detail": "Fine already paid."}, status=status.HTTP_400_BAD_REQUEST)
        fine.status = "paid"
        fine.paid_date = timezone.now()
        fine.save(update_fields=["status", "paid_date"])
        return Response(FineSerializer(fine).data, status=status.HTTP_200_OK)


class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.role in {"admin", "librarian"}:
            unpaid_total = Fine.objects.filter(status="unpaid").aggregate(total=Sum("amount"))["total"] or 0
            return Response(
                {
                    "role": user.role,
                    "total_books": Book.objects.count(),
                    "total_members": User.objects.filter(role="member").count(),
                    "total_borrows": BorrowRecord.objects.count(),
                    "active_borrows": BorrowRecord.objects.filter(status="borrowed").count(),
                    "overdue_borrows": BorrowRecord.objects.filter(
                        status="borrowed", due_date__lt=timezone.now()
                    ).count(),
                    "unpaid_fines_total": unpaid_total,
                }
            )

        return Response(
            {
                "role": user.role,
                "total_books": Book.objects.count(),
                "available_books": Book.objects.filter(available_quantity__gt=0).count(),
                "my_borrows": BorrowRecord.objects.filter(member=user).count(),
                "current_borrows": BorrowRecord.objects.filter(
                    member=user,
                    status="borrowed",
                ).count(),
                "overdue_borrows": BorrowRecord.objects.filter(
                    member=user,
                    status="borrowed",
                    due_date__lt=timezone.now(),
                ).count(),
                "my_unpaid_fines_total": Fine.objects.filter(
                    member=user,
                    status="unpaid",
                ).aggregate(total=Sum("amount"))["total"]
                or 0,
                "my_unpaid_fines_count": Fine.objects.filter(
                    member=user,
                    status="unpaid",
                ).count(),
            }
        )
