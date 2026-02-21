from django.urls import path
from .views import (
    BookListCreateView,
    BookDetailView,
    BorrowRecordListView,
    BorrowRecordDetailView,
    ReturnBookView,
    FineListView,
    FineDetailView,
    PayFineView,
    DashboardStatsView,
)

urlpatterns = [

    # ============================
    # DASHBOARD
    # ============================
    path('dashboard-stats/', DashboardStatsView.as_view(), name='dashboard-stats'),

    # ============================
    # BOOKS
    # ============================
    path('books/', BookListCreateView.as_view(), name='book-list-create'),
    path('books/<int:pk>/', BookDetailView.as_view(), name='book-detail'),

    # ============================
    # BORROW RECORDS
    # ============================
    path('borrows/', BorrowRecordListView.as_view(), name='borrow-list-create'),
    path('borrows/<int:pk>/', BorrowRecordDetailView.as_view(), name='borrow-detail'),
    path('borrows/<int:pk>/return/', ReturnBookView.as_view(), name='return-book'),

    # ============================
    # FINES
    # ============================
    path('fines/', FineListView.as_view(), name='fine-list'),
    path('fines/<int:pk>/', FineDetailView.as_view(), name='fine-detail'),
    path('fines/<int:pk>/pay/', PayFineView.as_view(), name='pay-fine'),
]