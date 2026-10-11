from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator


class StudentProfile(models.Model):

    GENDER_CHOICES = [
        ("MALE", "Male"),
        ("FEMALE", "Female"),
        ("OTHER", "Other"),
        ("PREFER_NOT_TO_SAY", "Prefer not to say"),
    ]

    STATE_CHOICES = [
        ("ANDHRA_PRADESH", "Andhra Pradesh"),
        ("ARUNACHAL_PRADESH", "Arunachal Pradesh"),
        ("ASSAM", "Assam"),
        ("BIHAR", "Bihar"),
        ("CHHATTISGARH", "Chhattisgarh"),
        ("GOA", "Goa"),
        ("GUJARAT", "Gujarat"),
        ("HARYANA", "Haryana"),
        ("HIMACHAL_PRADESH", "Himachal Pradesh"),
        ("JHARKHAND", "Jharkhand"),
        ("KARNATAKA", "Karnataka"),
        ("KERALA", "Kerala"),
        ("MADHYA_PRADESH", "Madhya Pradesh"),
        ("MAHARASHTRA", "Maharashtra"),
        ("MANIPUR", "Manipur"),
        ("MEGHALAYA", "Meghalaya"),
        ("MIZORAM", "Mizoram"),
        ("NAGALAND", "Nagaland"),
        ("ODISHA", "Odisha"),
        ("PUNJAB", "Punjab"),
        ("RAJASTHAN", "Rajasthan"),
        ("SIKKIM", "Sikkim"),
        ("TAMIL_NADU", "Tamil Nadu"),
        ("TELANGANA", "Telangana"),
        ("TRIPURA", "Tripura"),
        ("UTTAR_PRADESH", "Uttar Pradesh"),
        ("UTTARAKHAND", "Uttarakhand"),
        ("WEST_BENGAL", "West Bengal"),
        ("DELHI", "Delhi"),
        ("JAMMU_KASHMIR", "Jammu and Kashmir"),
        ("LADAKH", "Ladakh"),
        ("PUDUCHERRY", "Puducherry"),
        ("CHANDIGARH", "Chandigarh"),
        ("ANDAMAN_NICOBAR", "Andaman and Nicobar Islands"),
        ("LAKSHADWEEP", "Lakshadweep"),
        (
            "DADRA_NAGAR_HAVELI_DAMAN_DIU",
            "Dadra and Nagar Haveli and Daman and Diu",
        ),
    ]

    CATEGORY_CHOICES = [
        ("GENERAL", "General"),
        ("OBC", "OBC"),
        ("SC", "SC"),
        ("ST", "ST"),
        ("EWS", "EWS"),
    ]

    COURSE_CHOICES = [
        ("BE_BTECH", "B.E./B.Tech"),
        ("BSC", "B.Sc"),
        ("BCOM", "B.Com"),
        ("BA", "B.A"),
        ("BCA", "BCA"),
        ("BBA", "BBA"),
        ("ME_MTECH", "M.E./M.Tech"),
        ("MSC", "M.Sc"),
        ("MCA", "MCA"),
        ("MBA", "MBA"),
        ("DIPLOMA", "Diploma"),
        ("OTHER", "Other"),
    ]

    BRANCH_CHOICES = [
        ("CSE", "Computer Science"),
        ("ISE", "Information Science"),
        ("AIML", "AI and Machine Learning"),
        ("DATA_SCIENCE", "Data Science"),
        ("ECE", "Electronics and Communication"),
        ("EEE", "Electrical and Electronics"),
        ("MECHANICAL", "Mechanical"),
        ("CIVIL", "Civil"),
        ("OTHER", "Other"),
    ]

    YEAR_CHOICES = [
        (1, "1st Year"),
        (2, "2nd Year"),
        (3, "3rd Year"),
        (4, "4th Year"),
        (5, "5th Year"),
        (6, "6th Year"),
    ]

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="student_profile",
    )

    full_name = models.CharField(max_length=150)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(
        max_length=20, choices=GENDER_CHOICES, blank=True
    )
    state = models.CharField(
        max_length=40, choices=STATE_CHOICES, blank=True
    )
    district = models.CharField(max_length=100, blank=True)
    category = models.CharField(
        max_length=10, choices=CATEGORY_CHOICES, blank=True
    )
    course = models.CharField(
        max_length=20, choices=COURSE_CHOICES, blank=True
    )
    branch = models.CharField(
        max_length=20, choices=BRANCH_CHOICES, blank=True
    )
    year_of_study = models.PositiveSmallIntegerField(
        choices=YEAR_CHOICES, null=True, blank=True
    )
    college = models.CharField(max_length=200, blank=True)

    percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[
            MinValueValidator(0),
            MaxValueValidator(100),
        ],
        null=True,
        blank=True,
    )

    cgpa = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        validators=[
            MinValueValidator(0),
            MaxValueValidator(10),
        ],
        null=True,
        blank=True,
    )

    family_income = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0)],
        null=True,
        blank=True,
    )

    pwd = models.BooleanField(null=True, blank=True)
    minority = models.BooleanField(null=True, blank=True)

    def __str__(self):
        return self.full_name