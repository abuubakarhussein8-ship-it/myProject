from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import BookViewSet, BorrowRecordViewSet, DashboardStatsView, FineViewSet

router = DefaultRouter()
router.register("books", BookViewSet, basename="books")
router.register("borrows", BorrowRecordViewSet, basename="borrows")
router.register("fines", FineViewSet, basename="fines")

urlpatterns = [
    path("dashboard-stats/", DashboardStatsView.as_view(), name="dashboard-stats"),
    path("", include(router.urls)),
]
