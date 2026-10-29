
from rest_framework import serializers

from .models import RequiredDocument, Scholarship


class RequiredDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = RequiredDocument
        fields = [
            "id",
            "name",
            "description",
            "is_mandatory",
        ]


class ScholarshipSerializer(serializers.ModelSerializer):
    category = serializers.StringRelatedField(many=True, read_only=True)
    state = serializers.StringRelatedField(many=True, read_only=True)
    district = serializers.StringRelatedField(many=True, read_only=True)
    course = serializers.StringRelatedField(many=True, read_only=True)
    branch = serializers.StringRelatedField(many=True, read_only=True)

    required_documents = RequiredDocumentSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Scholarship
        fields = [
            "id",
            "name",
            "provider",
            "description",
            "amount",
            "deadline",
            "official_website",
            "application_url",
            "minimum_percentage",
            "minimum_cgpa",
            "maximum_family_income",
            "minimum_age",
            "maximum_age",
            "gender",
            "category",
            "state",
            "district",
            "course",
            "branch",
            "year_of_study",
            "pwd",
            "minority",
            "required_documents",
        ]
