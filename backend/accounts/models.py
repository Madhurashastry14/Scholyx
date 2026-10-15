from django.conf import settings
from django.core.validators import RegexValidator
from django.db import models


class StudentProfile(models.Model):
	class YearOfStudy(models.TextChoices):
		FIRST = "1", "First year"
		SECOND = "2", "Second year"
		THIRD = "3", "Third year"
		FOURTH = "4", "Fourth year"
		FIFTH = "5", "Fifth year"
		SIXTH = "6", "Sixth year"
		POSTGRADUATE = "postgraduate", "Postgraduate"

	user = models.OneToOneField(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name="student_profile",
	)
	full_name = models.CharField(max_length=150)
	date_of_birth = models.DateField()
	phone_number = models.CharField(
		max_length=16,
		validators=[
			RegexValidator(
				regex=r"^\+?[0-9]{7,15}$",
				message="Enter a valid phone number.",
			)
		],
	)
	institution_name = models.CharField(max_length=255)
	course = models.CharField(max_length=150)
	year_of_study = models.CharField(max_length=12, choices=YearOfStudy.choices)

	def __str__(self):
		return self.full_name
