from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import CurrentUserView, LoginView, MemberViewSet, RegisterView

router = DefaultRouter()
router.register("users", MemberViewSet, basename="users")

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("me/", CurrentUserView.as_view(), name="current-user"),
    path("", include(router.urls)),
]
