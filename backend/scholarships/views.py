
from rest_framework import generics
from rest_framework.permissions import AllowAny

from .models import Scholarship
from .serializers import ScholarshipSerializer


class ScholarshipListView(generics.ListAPIView):
    serializer_class = ScholarshipSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return (
            Scholarship.objects.filter(status=Scholarship.Status.ACTIVE)
            .prefetch_related(
                "category",
                "state",
                "district",
                "course",
                "branch",
                "required_documents",
            )
        )


class ScholarshipDetailView(generics.RetrieveAPIView):
    serializer_class = ScholarshipSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return (
            Scholarship.objects.filter(status=Scholarship.Status.ACTIVE)
            .prefetch_related(
                "category",
                "state",
                "district",
                "course",
                "branch",
                "required_documents",
            )
        )
