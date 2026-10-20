
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .serializers import RegistrationSerializer


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
