
from django.urls import path
from .views import scholarship_eligibility

urlpatterns = [
    path(
        "scholarships/<int:scholarship_id>/eligibility/",
        scholarship_eligibility,
        name="scholarship-eligibility",
    ),
]
