from django.contrib.auth import authenticate, get_user_model
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from library.permissions import IsAdminOnly, IsAdminOrLibrarian
from .models import MemberProfile
from .serializers import (
    MemberCreateUpdateSerializer,
    RegisterSerializer,
    UserSerializer,
)

User = get_user_model()


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user": UserSerializer(user).data,
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                },
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get("username") or request.data.get("email")
        password = request.data.get("password")
        if not username or not password:
            return Response(
                {"detail": "Username/email and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Allow logging in with either username or email.
        if "@" in username:
            matched_user = User.objects.filter(email__iexact=username).first()
            if matched_user:
                username = matched_user.username

        user = authenticate(username=username, password=password)
        if not user:
            return Response(
                {"detail": "Invalid credentials."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "user": UserSerializer(user).data,
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                },
            },
            status=status.HTTP_200_OK,
        )


class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile, _ = MemberProfile.objects.get_or_create(user=request.user)
        _ = profile  # force profile creation for new users
        return Response(UserSerializer(request.user).data)


class MemberViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("-id")
    serializer_class = MemberCreateUpdateSerializer

    def get_permissions(self):
        if self.action in {"list", "create", "retrieve", "update", "partial_update"}:
            return [IsAdminOrLibrarian()]
        if self.action == "destroy":
            return [IsAdminOnly()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        queryset = User.objects.select_related("member_profile").all().order_by("-id")
        role = self.request.query_params.get("role")
        if role:
            queryset = queryset.filter(role=role)
        return queryset

    @action(detail=False, methods=["get"], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        return Response(UserSerializer(request.user).data)
