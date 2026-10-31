from decimal import Decimal

from django.db import IntegrityError, transaction
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import (
	Branch,
	Category,
	Course,
	District,
	RequiredDocument,
	Scholarship,
	State,
)


class ScholarshipModelTests(TestCase):
	def create_scholarship(self, **overrides):
		values = {
			"name": "Future Scholars Award",
			"provider": "Scholyx Foundation",
			"description": "Support for eligible students.",
			"amount": Decimal("1000.00"),
			"deadline": "2027-06-30",
		}
		values.update(overrides)
		return Scholarship.objects.create(**values)

	def test_optional_eligibility_criteria_can_be_unspecified(self):
		scholarship = self.create_scholarship()

		self.assertIsNone(scholarship.minimum_percentage)
		self.assertIsNone(scholarship.minimum_cgpa)
		self.assertIsNone(scholarship.maximum_family_income)
		self.assertIsNone(scholarship.minimum_age)
		self.assertIsNone(scholarship.maximum_age)
		self.assertIsNone(scholarship.gender)
		self.assertIsNone(scholarship.year_of_study)
		self.assertIsNone(scholarship.pwd)
		self.assertIsNone(scholarship.minority)

	def test_lookup_relations_and_required_documents(self):
		scholarship = self.create_scholarship()
		category = Category.objects.create(name="General")
		state = State.objects.create(name="Karnataka")
		district = District.objects.create(name="Mysuru")
		course = Course.objects.create(name="Engineering")
		branch = Branch.objects.create(name="Computer Science")
		scholarship.category.add(category)
		scholarship.state.add(state)
		scholarship.district.add(district)
		scholarship.course.add(course)
		scholarship.branch.add(branch)
		document = RequiredDocument.objects.create(
			scholarship=scholarship,
			name="Income certificate",
		)

		self.assertEqual(scholarship.category.get(), category)
		self.assertEqual(scholarship.state.get(), state)
		self.assertEqual(scholarship.district.get(), district)
		self.assertEqual(scholarship.course.get(), course)
		self.assertEqual(scholarship.branch.get(), branch)
		self.assertEqual(scholarship.required_documents.get(), document)

	def test_amount_must_satisfy_database_constraint(self):
		with self.assertRaises(IntegrityError):
			with transaction.atomic():
				self.create_scholarship(amount=Decimal("0.00"))



class ScholarshipAPITests(APITestCase):
    def setUp(self):
        self.active_scholarship = Scholarship.objects.create(
            name="Active Scholarship",
            provider="Scholyx Foundation",
            description="Support for eligible students.",
            amount=Decimal("5000.00"),
            deadline="2027-06-30",
            application_url="https://example.com/apply",
            status=Scholarship.Status.ACTIVE,
            minimum_percentage=Decimal("75.00"),
            minimum_cgpa=Decimal("7.00"),
        )

        self.draft_scholarship = Scholarship.objects.create(
            name="Draft Scholarship",
            provider="Test Provider",
            description="Not yet available.",
            amount=Decimal("2000.00"),
            deadline="2027-12-31",
            status=Scholarship.Status.DRAFT,
        )

        self.closed_scholarship = Scholarship.objects.create(
            name="Closed Scholarship",
            provider="Test Provider",
            description="No longer available.",
            amount=Decimal("3000.00"),
            deadline="2027-01-31",
            status=Scholarship.Status.CLOSED,
        )

        self.list_url = reverse("scholarship-list")
        self.detail_url = reverse(
            "scholarship-detail",
            kwargs={"pk": self.active_scholarship.pk},
        )

    def test_listing_returns_only_active_scholarships(self):
        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(
            response.data[0]["name"],
            "Active Scholarship",
        )

    def test_empty_listing_returns_empty_list(self):
        Scholarship.objects.all().delete()

        response = self.client.get(self.list_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    def test_detail_returns_scholarship_information(self):
        category = Category.objects.create(name="General")
        state = State.objects.create(name="Karnataka")

        self.active_scholarship.category.add(category)
        self.active_scholarship.state.add(state)

        RequiredDocument.objects.create(
            scholarship=self.active_scholarship,
            name="Income Certificate",
            description="Proof of family income.",
            is_mandatory=True,
        )

        response = self.client.get(self.detail_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data["name"],
            "Active Scholarship",
        )
        self.assertEqual(
            response.data["application_url"],
            "https://example.com/apply",
        )
        self.assertEqual(
            response.data["minimum_percentage"],
            "75.00",
        )
        self.assertEqual(response.data["category"], ["General"])
        self.assertEqual(response.data["state"], ["Karnataka"])
        self.assertEqual(
            response.data["required_documents"][0]["name"],
            "Income Certificate",
        )
        self.assertTrue(
            response.data["required_documents"][0]["is_mandatory"]
        )

    def test_draft_scholarship_detail_returns_404(self):
        url = reverse(
            "scholarship-detail",
            kwargs={"pk": self.draft_scholarship.pk},
        )

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_closed_scholarship_detail_returns_404(self):
        url = reverse(
            "scholarship-detail",
            kwargs={"pk": self.closed_scholarship.pk},
        )

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_nonexistent_scholarship_returns_404(self):
        url = reverse(
            "scholarship-detail",
            kwargs={"pk": 999999},
        )

        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
