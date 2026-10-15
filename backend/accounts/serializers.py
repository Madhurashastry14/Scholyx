from django.contrib.auth import get_user_model, password_validation
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from .models import StudentProfile


class StudentProfileSerializer(serializers.ModelSerializer):
	class Meta:
		model = StudentProfile
		fields = (
			"full_name",
			"date_of_birth",
			"phone_number",
			"institution_name",
			"course",
			"year_of_study",
		)

	def validate_date_of_birth(self, value):
		if value >= timezone.localdate():
			raise serializers.ValidationError("Date of birth must be in the past.")
		return value


class RegistrationSerializer(serializers.Serializer):
	username = serializers.CharField(max_length=150)
	email = serializers.EmailField()
	password = serializers.CharField(
		write_only=True,
		trim_whitespace=False,
		style={"input_type": "password"},
	)
	full_name = serializers.CharField(max_length=150)
	date_of_birth = serializers.DateField()
	phone_number = serializers.CharField(max_length=16)
	institution_name = serializers.CharField(max_length=255)
	course = serializers.CharField(max_length=150)
	year_of_study = serializers.ChoiceField(choices=StudentProfile.YearOfStudy.choices)

	def validate_username(self, value):
		if get_user_model().objects.filter(username=value).exists():
			raise serializers.ValidationError("A user with this username already exists.")
		return value

	def validate_email(self, value):
		user_model = get_user_model()
		if user_model.objects.filter(email__iexact=value).exists():
			raise serializers.ValidationError("A user with this email already exists.")
		return value

	def validate(self, attrs):
		profile_data = {
			field: attrs[field]
			for field in (
				"full_name",
				"date_of_birth",
				"phone_number",
				"institution_name",
				"course",
				"year_of_study",
			)
		}
		profile_serializer = StudentProfileSerializer(data=profile_data)
		profile_serializer.is_valid(raise_exception=True)

		user = get_user_model()(
			username=attrs["username"],
			email=attrs["email"],
		)
		try:
			password_validation.validate_password(attrs["password"], user=user)
		except DjangoValidationError as exc:
			raise serializers.ValidationError({"password": exc.messages}) from exc
		return attrs

	@transaction.atomic
	def create(self, validated_data):
		password = validated_data.pop("password")
		profile_data = {
			field: validated_data.pop(field)
			for field in (
				"full_name",
				"date_of_birth",
				"phone_number",
				"institution_name",
				"course",
				"year_of_study",
			)
		}
		user = get_user_model().objects.create_user(
			password=password,
			**validated_data,
		)
		StudentProfile.objects.create(user=user, **profile_data)
		return user

	def to_representation(self, user):
		profile = user.student_profile
		return {
			"id": user.pk,
			"username": user.username,
			"email": user.email,
			"full_name": profile.full_name,
			"date_of_birth": profile.date_of_birth,
			"phone_number": profile.phone_number,
			"institution_name": profile.institution_name,
			"course": profile.course,
			"year_of_study": profile.year_of_study,
		}
