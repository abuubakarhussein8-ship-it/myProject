from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, logout, get_user_model
from django.shortcuts import get_object_or_404
from .serializers import (
    UserSerializer, 
    UserRegistrationSerializer, 
    LoginSerializer,
    ChangePasswordSerializer
)
from library.permissions import IsAdminUser

User = get_user_model()


class NoCacheMixin:
    """Mixin to add no-cache headers to responses"""
    def finalize_response(self, request, *args, **kwargs):
        response = super().finalize_response(request, *args, **kwargs)
        response['Cache-Control'] = 'no-cache, no-store, must-revalidate, max-age=0'
        response['Pragma'] = 'no-cache'
        response['Expires'] = '0'
        return response


class RegisterView(NoCacheMixin, generics.CreateAPIView):
    """API endpoint for user registration"""
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'message': 'User registered successfully',
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token)
            }
        }, status=status.HTTP_201_CREATED)


class LoginView(NoCacheMixin, APIView):
    """API endpoint for user login - returns JWT tokens"""
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        
        user = authenticate(username=username, password=password)
        
        if user is not None:
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'user': UserSerializer(user).data,
                'message': 'Login successful',
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token)
                }
            }, status=status.HTTP_200_OK)
        
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )


class LogoutView(NoCacheMixin, APIView):
    """API endpoint for user logout"""
    
    def post(self, request):
        logout(request)
        return Response(
            {'message': 'Logout successful'},
            status=status.HTTP_200_OK
        )


class UserDetailView(NoCacheMixin, generics.RetrieveUpdateAPIView):
    """API endpoint to get or update current user"""
    serializer_class = UserSerializer
    
    def get_object(self):
        return self.request.user


class ChangePasswordView(NoCacheMixin, APIView):
    """API endpoint to change password"""
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        
        return Response(
            {'message': 'Password changed successfully'},
            status=status.HTTP_200_OK
        )


class UserListView(NoCacheMixin, generics.ListAPIView):
    """API endpoint to list all users (admin only)"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]
    
    def get_queryset(self):
        # Filter by role if provided
        role = self.request.query_params.get('role', None)
        if role:
            return User.objects.filter(role=role)
        return User.objects.all()


class UserDeleteView(NoCacheMixin, generics.DestroyAPIView):
    """API endpoint to delete a user (admin only)"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]


class UserUpdateView(NoCacheMixin, generics.UpdateAPIView):
    """API endpoint to update a user (admin only)"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]


class UserDeactivateView(NoCacheMixin, APIView):
    """API endpoint to deactivate a user (admin only)"""
    permission_classes = [IsAdminUser]
    
    def post(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        user.is_active = False
        user.save()
        return Response(
            {'message': f'User {user.username} has been deactivated'},
            status=status.HTTP_200_OK
        )


class UserActivateView(NoCacheMixin, APIView):
    """API endpoint to activate a user (admin only)"""
    permission_classes = [IsAdminUser]
    
    def post(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        user.is_active = True
        user.save()
        return Response(
            {'message': f'User {user.username} has been activated'},
            status=status.HTTP_200_OK
        )
