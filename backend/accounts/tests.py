from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.db import IntegrityError
from rest_framework import status
from rest_framework.test import APITestCase

from .models import StudentProfile


class RegistrationTests(APITestCase):
	url = "/api/auth/register/"

	def registration_data(self, **overrides):
		data = {
			"username": "student-one",
			"email": "student@example.com",
			"password": "Scholyx-Registration-2026!",
			"full_name": "Student One",
			"date_of_birth": "2005-06-15",
			"phone_number": "+919876543210",
			"institution_name": "Scholyx University",
			"course": "Computer Science",
			"year_of_study": "2",
		}
		data.update(overrides)
		return data

	def test_register_creates_user_with_hashed_password(self):
		response = self.client.post(self.url, self.registration_data(), format="json")

		self.assertEqual(response.status_code, status.HTTP_201_CREATED)
		self.assertEqual(get_user_model().objects.count(), 1)
		self.assertEqual(StudentProfile.objects.count(), 1)
		user = get_user_model().objects.get(username="student-one")
		self.assertEqual(user.email, "student@example.com")
		self.assertTrue(user.check_password("Scholyx-Registration-2026!"))
		self.assertNotEqual(user.password, "Scholyx-Registration-2026!")
		self.assertNotIn("password", response.data)
		self.assertEqual(user.student_profile.full_name, "Student One")
		self.assertEqual(response.data["course"], "Computer Science")

	def test_register_rejects_duplicate_username(self):
		get_user_model().objects.create_user(
			username="student-one",
			email="existing@example.com",
			password="Existing-Password-2026!",
		)

		response = self.client.post(self.url, self.registration_data(), format="json")

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertIn("username", response.data)
		self.assertEqual(get_user_model().objects.count(), 1)
		self.assertEqual(StudentProfile.objects.count(), 0)

	def test_register_rejects_duplicate_email_case_insensitively(self):
		get_user_model().objects.create_user(
			username="existing-student",
			email="student@example.com",
			password="Existing-Password-2026!",
		)

		response = self.client.post(
			self.url,
			self.registration_data(username="another-student", email="STUDENT@example.com"),
			format="json",
		)

		self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
		self.assertIn("email", response.data)
		self.assertEqual(get_user_model().objects.count(), 1)
		self.assertEqual(StudentProfile.objects.count(), 0)

	def test_register_rejects_missing_invalid_and_weak_data(self):
		required_fields = (
			"username",
			"email",
			"password",
			"full_name",
			"date_of_birth",
			"phone_number",
			"institution_name",
			"course",
			"year_of_study",
		)
		for field in required_fields:
			with self.subTest(missing_field=field):
				data = self.registration_data()
				data.pop(field)
				response = self.client.post(self.url, data, format="json")

				self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
				self.assertIn(field, response.data)
				self.assertEqual(get_user_model().objects.count(), 0)
				self.assertEqual(StudentProfile.objects.count(), 0)

		cases = (
			(self.registration_data(email="not-an-email"), "email"),
			(self.registration_data(password="123"), "password"),
			(self.registration_data(phone_number="invalid"), "phone_number"),
			(self.registration_data(date_of_birth="3000-01-01"), "date_of_birth"),
			(self.registration_data(year_of_study="invalid"), "year_of_study"),
		)

		for data, field in cases:
			with self.subTest(field=field):
				response = self.client.post(self.url, data, format="json")

				self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
				self.assertIn(field, response.data)
				self.assertEqual(get_user_model().objects.count(), 0)
				self.assertEqual(StudentProfile.objects.count(), 0)

	@patch("accounts.serializers.StudentProfile.objects.create", side_effect=IntegrityError)
	def test_profile_creation_failure_rolls_back_user(self, create_profile):
		with self.assertRaises(IntegrityError):
			self.client.post(self.url, self.registration_data(), format="json")

		self.assertEqual(get_user_model().objects.count(), 0)
		self.assertEqual(StudentProfile.objects.count(), 0)
