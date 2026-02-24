from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import MemberProfile

User = get_user_model()


class MemberProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = MemberProfile
        fields = [
            "phone",
            "address",
            "membership_date",
            "membership_expiry",
        ]
        read_only_fields = ["membership_date"]


class UserSerializer(serializers.ModelSerializer):
    member_profile = MemberProfileSerializer(required=False)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "member_type",
            "is_active",
            "member_profile",
        ]
        read_only_fields = ["id"]

    def update(self, instance, validated_data):
        profile_data = validated_data.pop("member_profile", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if profile_data is not None:
            profile, _ = MemberProfile.objects.get_or_create(user=instance)
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()
        return instance


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=4)
    password_confirm = serializers.CharField(write_only=True)
    member_profile = MemberProfileSerializer(required=False)

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "password",
            "password_confirm",
            "first_name",
            "last_name",
            "role",
            "member_type",
            "member_profile",
        ]

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError(
                {"password_confirm": "Password fields did not match."}
            )
        role = attrs.get("role", "member")
        if role == "member" and not attrs.get("member_type"):
            attrs["member_type"] = "student"
        if role in {"admin", "librarian"}:
            attrs["member_type"] = None
        return attrs

    def create(self, validated_data):
        profile_data = validated_data.pop("member_profile", {})
        validated_data.pop("password_confirm")

        user = User.objects.create_user(**validated_data)
        MemberProfile.objects.create(user=user, **profile_data)
        return user


class MemberCreateUpdateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    member_profile = MemberProfileSerializer(required=False)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "password",
            "first_name",
            "last_name",
            "role",
            "member_type",
            "is_active",
            "member_profile",
        ]
        read_only_fields = ["id"]

    def create(self, validated_data):
        profile_data = validated_data.pop("member_profile", {})
        password = validated_data.pop("password", None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        else:
            raise serializers.ValidationError({"password": "Password is required."})
        user.save()
        MemberProfile.objects.create(user=user, **profile_data)
        return user

    def update(self, instance, validated_data):
        profile_data = validated_data.pop("member_profile", None)
        password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()

        if profile_data is not None:
            profile, _ = MemberProfile.objects.get_or_create(user=instance)
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()
        return instance
