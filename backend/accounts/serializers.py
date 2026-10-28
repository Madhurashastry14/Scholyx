from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from rest_framework import serializers
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.settings import api_settings
from rest_framework_simplejwt.tokens import RefreshToken

from .models import StudentProfile


class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField(write_only=True)

    def validate_refresh(self, value):
        try:
            token = RefreshToken(value)
        except TokenError as exc:
            raise serializers.ValidationError(
                "Invalid or expired refresh token."
            ) from exc
        if str(token.get(api_settings.USER_ID_CLAIM)) != str(
            self.context["request"].user.pk
        ):
            raise serializers.ValidationError(
                "Refresh token does not belong to the authenticated user."
            )
        return token


class RegistrationSerializer(serializers.ModelSerializer):
    username = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
        validators=[validate_password],
    )
    full_name = serializers.CharField(max_length=150)

    class Meta:
        model = StudentProfile
        fields = [
            "username",
            "email",
            "password",
            "full_name",
        ]

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError(
                "This username is already taken."
            )
        return value

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "An account with this email already exists."
            )
        return value

    def validate(self, attrs):
        user_data = {
            "username": attrs["username"],
            "email": attrs["email"],
            "password": attrs["password"],
        }
        validate_password(
            user_data["password"],
            user=User(**user_data),
        )
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        username = validated_data.pop("username")
        email = validated_data.pop("email")
        password = validated_data.pop("password")

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
        )

        profile = StudentProfile.objects.create(
            user=user,
            **validated_data,
        )

        return profile
