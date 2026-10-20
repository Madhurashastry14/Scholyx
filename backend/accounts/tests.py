
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import StudentProfile


class StudentRegistrationTests(APITestCase):
    def setUp(self):
        self.url = reverse("register")
        self.valid_data = {
            "username": "madhura_test",
            "email": "madhura_test@example.com",
            "password": "StrongPass!2026",
            "full_name": "Test Student",
        }

    def test_successful_registration(self):
        response = self.client.post(
            self.url, self.valid_data, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(StudentProfile.objects.count(), 1)

        user = User.objects.get(username="madhura_test")
        self.assertEqual(user.email, "madhura_test@example.com")
        self.assertTrue(user.check_password("StrongPass!2026"))
        self.assertNotEqual(user.password, "StrongPass!2026")
        self.assertNotIn("password", response.data)

    def test_duplicate_username_is_rejected(self):
        User.objects.create_user(
            username="madhura_test",
            email="existing@example.com",
            password="AnotherStrong!2026",
        )

        response = self.client.post(
            self.url, self.valid_data, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(StudentProfile.objects.count(), 0)

    def test_duplicate_email_is_rejected(self):
        User.objects.create_user(
            username="existing_user",
            email="madhura_test@example.com",
            password="AnotherStrong!2026",
        )

        response = self.client.post(
            self.url, self.valid_data, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(StudentProfile.objects.count(), 0)

    def test_invalid_email_is_rejected(self):
        data = {**self.valid_data, "email": "invalid-email"}

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(User.objects.count(), 0)
        self.assertEqual(StudentProfile.objects.count(), 0)

    def test_weak_password_is_rejected(self):
        data = {**self.valid_data, "password": "123"}

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(User.objects.count(), 0)
        self.assertEqual(StudentProfile.objects.count(), 0)

    def test_missing_full_name_is_rejected(self):
        data = {**self.valid_data}
        data.pop("full_name")

        response = self.client.post(self.url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(User.objects.count(), 0)
        self.assertEqual(StudentProfile.objects.count(), 0)
