from rest_framework.pagination import PageNumberPagination
from django.db.models import Q
from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Category, Course, Scholarship, State
from .serializers import (
    ScholarshipListSerializer,
    ScholarshipQuerySerializer,
    ScholarshipSerializer,
)
class ScholarshipPagination(PageNumberPagination):
    page_size = 9
    page_size_query_param = "page_size"
    max_page_size = 30
class ScholarshipListView(generics.ListAPIView):
    serializer_class = ScholarshipListSerializer
    permission_classes = [AllowAny]
    pagination_class = ScholarshipPagination

    def get_queryset(self):
        query_serializer = ScholarshipQuerySerializer(
            data=self.request.query_params
        )
        query_serializer.is_valid(raise_exception=True)
        filters = query_serializer.validated_data

        scholarships = Scholarship.objects.filter(
            status=Scholarship.Status.ACTIVE
        )

        search = filters.get("search")
        if search:
            scholarships = scholarships.filter(
                Q(name__icontains=search)
                | Q(provider__icontains=search)
                | Q(description__icontains=search)
            )

        amount = filters.get("amount")
        if amount is not None:
            scholarships = scholarships.filter(amount=amount)

        min_amount = filters.get("min_amount")
        if min_amount is not None:
            scholarships = scholarships.filter(amount__gte=min_amount)

        deadline_before = filters.get("deadline_before")
        if deadline_before is not None:
            scholarships = scholarships.filter(deadline__lte=deadline_before)

        for field_name in ("course", "branch", "category", "state", "district"):
            value = filters.get(field_name)
            if value is not None:
                scholarships = scholarships.filter(
                    Q(**{f"{field_name}__code__iexact": value})
                    | Q(**{f"{field_name}__name__iexact": value})
                )

        gender = filters.get("gender")
        if gender is not None:
            scholarships = scholarships.filter(gender=gender)

        year_of_study = filters.get("year_of_study")
        if year_of_study is not None:
            scholarships = scholarships.filter(year_of_study=year_of_study)

        return scholarships.distinct().prefetch_related(
            "category",
            "state",
            "district",
            "course",
            "branch",
            "required_documents",
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


OPTION_MODELS = {
    "categories": Category,
    "states": State,
    "courses": Course,
}


def serialize_options(model):
    options = []
    seen_labels = set()
    queryset = model.objects.filter(
        scholarships__status=Scholarship.Status.ACTIVE
    ).distinct()

    for option in sorted(
        queryset,
        key=lambda item: (item.name.lower(), item.code is None),
    ):
        label_key = option.name.strip().lower()
        if label_key in seen_labels:
            continue
        seen_labels.add(label_key)
        options.append({"value": option.code or option.name, "label": option.name})

    return options


class ScholarshipFilterOptionsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(
            {
                key: serialize_options(model)
                for key, model in OPTION_MODELS.items()
            }
        )
