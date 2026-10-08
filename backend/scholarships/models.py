from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.db.models import F, Q


class NamedEligibilityOption(models.Model):
	name = models.CharField(max_length=100, unique=True)

	class Meta:
		abstract = True
		ordering = ("name",)

	def __str__(self):
		return self.name


class Category(NamedEligibilityOption):
	pass


class State(NamedEligibilityOption):
	pass


class District(NamedEligibilityOption):
	pass


class Course(NamedEligibilityOption):
	pass


class Branch(NamedEligibilityOption):
	pass


class Scholarship(models.Model):
	class Status(models.TextChoices):
		DRAFT = "draft", "Draft"
		ACTIVE = "active", "Active"
		CLOSED = "closed", "Closed"

	class Gender(models.TextChoices):
		ANY = "any", "Any"
		FEMALE = "female", "Female"
		MALE = "male", "Male"
		OTHER = "other", "Other"

	class YearOfStudy(models.TextChoices):
		ANY = "any", "Any year"
		FIRST = "1", "First year"
		SECOND = "2", "Second year"
		THIRD = "3", "Third year"
		FOURTH = "4", "Fourth year"
		FIFTH = "5", "Fifth year"
		SIXTH = "6", "Sixth year"
		POSTGRADUATE = "postgraduate", "Postgraduate"

	name = models.CharField(max_length=255)
	provider = models.CharField(max_length=255)
	description = models.TextField()
	amount = models.DecimalField(
		max_digits=12,
		decimal_places=2,
		validators=[MinValueValidator(0.01)],
	)
	deadline = models.DateField()
	official_website = models.URLField(blank=True)
	application_url = models.URLField(blank=True)
	status = models.CharField(
		max_length=10,
		choices=Status.choices,
		default=Status.DRAFT,
	)

	minimum_percentage = models.DecimalField(
		max_digits=5,
		decimal_places=2,
		null=True,
		blank=True,
		validators=[MinValueValidator(0), MaxValueValidator(100)],
	)
	minimum_cgpa = models.DecimalField(
		max_digits=4,
		decimal_places=2,
		null=True,
		blank=True,
		validators=[MinValueValidator(0), MaxValueValidator(10)],
	)
	maximum_family_income = models.DecimalField(
		max_digits=12,
		decimal_places=2,
		null=True,
		blank=True,
		validators=[MinValueValidator(0)],
	)
	minimum_age = models.PositiveSmallIntegerField(null=True, blank=True)
	maximum_age = models.PositiveSmallIntegerField(null=True, blank=True)
	gender = models.CharField(
		max_length=10,
		choices=Gender.choices,
		null=True,
		blank=True,
	)
	category = models.ManyToManyField(Category, blank=True, related_name="scholarships")
	state = models.ManyToManyField(State, blank=True, related_name="scholarships")
	district = models.ManyToManyField(District, blank=True, related_name="scholarships")
	course = models.ManyToManyField(Course, blank=True, related_name="scholarships")
	branch = models.ManyToManyField(Branch, blank=True, related_name="scholarships")
	year_of_study = models.CharField(
		max_length=12,
		choices=YearOfStudy.choices,
		null=True,
		blank=True,
	)
	pwd = models.BooleanField(null=True, blank=True)
	minority = models.BooleanField(null=True, blank=True)

	class Meta:
		ordering = ("deadline", "name")
		constraints = [
			models.CheckConstraint(
				condition=Q(amount__gt=0),
				name="scholarship_amount_positive",
			),
			models.CheckConstraint(
				condition=Q(minimum_percentage__isnull=True)
				| Q(minimum_percentage__gte=0, minimum_percentage__lte=100),
				name="scholarship_percentage_range",
			),
			models.CheckConstraint(
				condition=Q(minimum_cgpa__isnull=True)
				| Q(minimum_cgpa__gte=0, minimum_cgpa__lte=10),
				name="scholarship_cgpa_range",
			),
			models.CheckConstraint(
				condition=Q(maximum_family_income__isnull=True)
				| Q(maximum_family_income__gte=0),
				name="scholarship_income_nonnegative",
			),
			models.CheckConstraint(
				condition=Q(minimum_age__isnull=True)
				| Q(maximum_age__isnull=True)
				| Q(minimum_age__lte=F("maximum_age")),
				name="scholarship_age_range_valid",
			),
			models.CheckConstraint(
				condition=Q(status__in=("draft", "active", "closed")),
				name="scholarship_status_valid",
			),
			models.CheckConstraint(
				condition=Q(gender__isnull=True)
				| Q(gender__in=("any", "female", "male", "other")),
				name="scholarship_gender_valid",
			),
			models.CheckConstraint(
				condition=Q(year_of_study__isnull=True)
				| Q(
					year_of_study__in=(
						"any",
						"1",
						"2",
						"3",
						"4",
						"5",
						"6",
						"postgraduate",
					)
				),
				name="scholarship_year_valid",
			),
		]

	def __str__(self):
		return self.name


class RequiredDocument(models.Model):
	scholarship = models.ForeignKey(
		Scholarship,
		on_delete=models.CASCADE,
		related_name="required_documents",
	)
	name = models.CharField(max_length=150)
	description = models.TextField(blank=True)
	is_mandatory = models.BooleanField(default=True)

	class Meta:
		ordering = ("scholarship", "name")
		constraints = [
			models.UniqueConstraint(
				fields=("scholarship", "name"),
				name="unique_scholarship_required_document",
			),
		]

	def __str__(self):
		return f"{self.name} ({self.scholarship})"
