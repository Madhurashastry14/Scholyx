from django.urls import path

from .views import (
    ScholarshipDetailView,
    ScholarshipFilterOptionsView,
    ScholarshipListView,
)


urlpatterns = [
    path(
        "scholarships/",
        ScholarshipListView.as_view(),
        name="scholarship-list",
    ),
    path(
        "scholarships/filter-options/",
        ScholarshipFilterOptionsView.as_view(),
        name="scholarship-filter-options",
    ),
    path(
        "scholarships/<int:pk>/",
        ScholarshipDetailView.as_view(),
        name="scholarship-detail",
    ),
]
