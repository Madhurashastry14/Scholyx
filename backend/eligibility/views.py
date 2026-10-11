
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from accounts.models import StudentProfile
from scholarships.models import Scholarship
from .services import evaluate_eligibility


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def scholarship_eligibility(request, scholarship_id):
    try:
        scholarship = Scholarship.objects.get(
            id=scholarship_id,
            status=Scholarship.Status.ACTIVE,
        )
    except Scholarship.DoesNotExist:
        return Response(
            {"detail": "Active scholarship not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    try:
        student = request.user.student_profile
    except StudentProfile.DoesNotExist:
        return Response(
            {"detail": "Student profile not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    result = evaluate_eligibility(scholarship, student)
    return Response(result, status=status.HTTP_200_OK)
