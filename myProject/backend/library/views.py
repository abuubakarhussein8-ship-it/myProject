from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Q
from django.core.cache import cache

from .models import Book, BorrowRecord, Fine
from .serializers import (
    BookSerializer,
    BookListSerializer,
    BorrowRecordSerializer,
    BorrowRecordCreateSerializer,
    FineSerializer
)
from users.models import User
from .permissions import IsAdminUser


# =====================================
# NO CACHE MIXIN
# =====================================

class NoCacheMixin:
    def finalize_response(self, request, *args, **kwargs):
        response = super().finalize_response(request, *args, **kwargs)
        response['Cache-Control'] = 'no-cache, no-store, must-revalidate, max-age=0'
        response['Pragma'] = 'no-cache'
        response['Expires'] = '0'
        return response


def invalidate_cache():
    cache.clear()


# =====================================
# BOOK VIEWS
# =====================================

class BookListCreateView(NoCacheMixin, generics.ListCreateAPIView):
    queryset = Book.objects.all()

    def get_serializer_class(self):
        if self.request.method == 'GET':
            return BookListSerializer
        return BookSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        queryset = Book.objects.all()

        search = self.request.query_params.get('search')
        category = self.request.query_params.get('category')
        available = self.request.query_params.get('available')

        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(author__icontains=search) |
                Q(isbn__icontains=search)
            )

        if category:
            queryset = queryset.filter(category=category)

        if available == 'true':
            queryset = queryset.filter(available_quantity__gt=0)

        return queryset

    def perform_create(self, serializer):
        serializer.save()
        invalidate_cache()


class BookDetailView(NoCacheMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [permissions.IsAuthenticated()]
        return [IsAdminUser()]

    def perform_update(self, serializer):
        serializer.save()
        invalidate_cache()

    def perform_destroy(self, instance):
        instance.delete()
        invalidate_cache()


# =====================================
# BORROW RECORD VIEWS
# =====================================

class BorrowRecordListView(NoCacheMixin, generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == 'member':
            return BorrowRecord.objects.filter(member=user)

        return BorrowRecord.objects.all()

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return BorrowRecordCreateSerializer
        return BorrowRecordSerializer

    def perform_create(self, serializer):
        user = self.request.user

        if user.role == 'member':
            serializer.save(member=user)

        elif user.role == 'admin':
            member_id = self.request.data.get('member')
            if member_id:
                try:
                    member = User.objects.get(pk=member_id)
                    serializer.save(member=member)
                except User.DoesNotExist:
                    serializer.save(member=user)
            else:
                serializer.save(member=user)

        invalidate_cache()


class BorrowRecordDetailView(NoCacheMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = BorrowRecord.objects.all()
    serializer_class = BorrowRecordSerializer
    permission_classes = [permissions.IsAuthenticated]


# =====================================
# RETURN BOOK
# =====================================

class ReturnBookView(NoCacheMixin, APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        record = get_object_or_404(BorrowRecord, pk=pk)

        if record.member != request.user and request.user.role != 'admin':
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )

        if record.status == 'returned':
            return Response(
                {'error': 'Book already returned'},
                status=status.HTTP_400_BAD_REQUEST
            )

        record.return_date = timezone.now()
        record.status = 'returned'
        record.save()

        book = record.book
        book.available_quantity += 1
        book.save()

        if record.is_overdue():
            fine_amount = record.calculate_fine()
            if fine_amount > 0:
                Fine.objects.create(
                    member=record.member,
                    borrow_record=record,
                    amount=fine_amount,
                    reason=f'Overdue return for "{book.title}"'
                )

        invalidate_cache()

        return Response({'message': 'Book returned successfully'})


# =====================================
# FINE VIEWS
# =====================================

class FineListView(NoCacheMixin, generics.ListCreateAPIView):
    serializer_class = FineSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == 'member':
            return Fine.objects.filter(member=user)

        return Fine.objects.all()


class FineDetailView(NoCacheMixin, generics.RetrieveUpdateDestroyAPIView):
    queryset = Fine.objects.all()
    serializer_class = FineSerializer
    permission_classes = [permissions.IsAuthenticated]


class PayFineView(NoCacheMixin, APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        fine = get_object_or_404(Fine, pk=pk)

        if fine.member != request.user and request.user.role != 'admin':
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )

        if fine.status == 'paid':
            return Response(
                {'error': 'Fine already paid'},
                status=status.HTTP_400_BAD_REQUEST
            )

        fine.status = 'paid'
        fine.paid_date = timezone.now()
        fine.save()

        invalidate_cache()

        return Response({'message': 'Fine paid successfully'})


# =====================================
# DASHBOARD STATS
# =====================================

class DashboardStatsView(NoCacheMixin, APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.role == 'admin':
            return Response({
                'total_books': Book.objects.count(),
                'total_members': User.objects.filter(role='member').count(),
                'total_borrows': BorrowRecord.objects.count(),
                'active_borrows': BorrowRecord.objects.filter(status='borrowed').count(),
                'total_fines': Fine.objects.filter(status='unpaid').count(),
                'overdue_borrows': BorrowRecord.objects.filter(
                    status='borrowed',
                    due_date__lt=timezone.now()
                ).count(),
            })

        return Response({
            'my_borrows': BorrowRecord.objects.filter(member=user).count(),
            'current_borrows': BorrowRecord.objects.filter(
                member=user,
                status='borrowed'
            ).count(),
            'my_fines': Fine.objects.filter(
                member=user,
                status='unpaid'
            ).count(),
        })