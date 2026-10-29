
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import StudentProfile
from .serializers import LogoutSerializer, RegistrationSerializer,StudentProfileSerializer


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout(request):
    serializer = LogoutSerializer(
        data=request.data,
        context={"request": request},
    )
    serializer.is_valid(raise_exception=True)
    serializer.validated_data["refresh"].blacklist()

    return Response(
        {"message": "Logout successful."},
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
def register(request):
    serializer = RegistrationSerializer(data=request.data)

    if serializer.is_valid():
        profile = serializer.save()

        return Response(
            {
                "message": "Registration successful.",
                "user": {
                    "id": profile.user.id,
                    "username": profile.user.username,
                    "email": profile.user.email,
                },
                "profile": {
                    "id": profile.id,
                    "full_name": profile.full_name,
                },
            },
            status=status.HTTP_201_CREATED,
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST,
    )

@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated])
def my_profile(request):
    try:
        profile = request.user.student_profile
    except StudentProfile.DoesNotExist:
        return Response(
            {"detail": "Student profile not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    if request.method == "GET":
        serializer = StudentProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    serializer = StudentProfileSerializer(
        profile,
        data=request.data,
        partial=True,
    )

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST,
    )