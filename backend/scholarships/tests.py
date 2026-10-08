from decimal import Decimal

from django.db import IntegrityError, transaction
from django.test import TestCase

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
