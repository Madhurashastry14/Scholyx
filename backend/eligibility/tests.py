
from datetime import date
from decimal import Decimal

from django.contrib.auth.models import User
from django.test import TestCase

from accounts.models import StudentProfile
from scholarships.models import Scholarship
from .services import evaluate_eligibility


class EligibilityServiceTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="eligibility_test",
            password="test-password",
        )

        self.student = StudentProfile.objects.create(
            user=self.user,
            full_name="Test Student",
            percentage=Decimal("85.00"),
        )

        self.scholarship = Scholarship.objects.create(
            name="Test Scholarship",
            provider="Test Provider",
            description="Eligibility service test",
            amount=Decimal("5000.00"),
            deadline=date(2027, 12, 31),
            status=Scholarship.Status.ACTIVE,
            minimum_percentage=Decimal("75.00"),
        )

    def test_percentage_requirement_passes(self):
        result = evaluate_eligibility(self.scholarship, self.student)

        self.assertEqual(
            result["criteria"]["percentage"]["status"],
            "passed",
        )
        self.assertEqual(result["overall_status"], "eligible")
    
    def test_percentage_requirement_fails(self):
        self.scholarship.minimum_percentage = Decimal("90.00")
        self.scholarship.save()

        result = evaluate_eligibility(self.scholarship, self.student)

        self.assertEqual(
            result["criteria"]["percentage"]["status"],
            "failed",
        )
        self.assertEqual(result["overall_status"], "ineligible")
    
    def test_missing_percentage_returns_incomplete(self):
        self.student.percentage = None
        self.student.save()

        result = evaluate_eligibility(self.scholarship, self.student)

        self.assertEqual(
            result["criteria"]["percentage"]["status"],
            "unknown",
        )
        self.assertEqual(result["overall_status"], "incomplete")

    
    def test_cgpa_requirement_passes(self):
        self.scholarship.minimum_cgpa = Decimal("7.00")
        self.scholarship.save()

        self.student.cgpa = Decimal("8.20")
        self.student.save()

        result = evaluate_eligibility(self.scholarship, self.student)

        self.assertEqual(
            result["criteria"]["cgpa"]["status"],
            "passed",
        )
        self.assertEqual(result["overall_status"], "eligible")

    
    def test_family_income_requirement_passes(self):
        self.scholarship.maximum_family_income = Decimal("250000.00")
        self.scholarship.save()

        self.student.family_income = Decimal("200000.00")
        self.student.save()

        result = evaluate_eligibility(self.scholarship, self.student)

        self.assertEqual(
            result["criteria"]["family_income"]["status"],
            "passed",
        )
        self.assertEqual(result["overall_status"], "eligible")

    
    def test_age_requirement_passes(self):
        today = date.today()
        self.student.date_of_birth = date(
            today.year - 20,
            today.month,
            today.day,
        )
        self.student.save()

        self.scholarship.minimum_age = 18
        self.scholarship.maximum_age = 25
        self.scholarship.save()

        result = evaluate_eligibility(self.scholarship, self.student)

        self.assertEqual(
            result["criteria"]["age"]["status"],
            "passed",
        )
        self.assertEqual(result["overall_status"], "eligible")

    
    def test_category_requirement_passes(self):
        from scholarships.models import Category

        category = Category.objects.create(
            code="OBC",
            name="Other Backward Classes",
        )
        self.scholarship.category.add(category)

        self.student.category = "OBC"
        self.student.save()

        result = evaluate_eligibility(self.scholarship, self.student)

        self.assertEqual(
            result["criteria"]["category"]["status"],
            "passed",
        )
        self.assertEqual(result["overall_status"], "eligible")

    
    def test_category_requirement_fails(self):
        from scholarships.models import Category

        category = Category.objects.create(
            code="SC",
            name="Scheduled Caste",
        )
        self.scholarship.category.add(category)

        self.student.category = "OBC"
        self.student.save()

        result = evaluate_eligibility(self.scholarship, self.student)

        self.assertEqual(
            result["criteria"]["category"]["status"],
            "failed",
        )
        self.assertEqual(result["overall_status"], "ineligible")

    
    def test_state_requirement_passes(self):
        from scholarships.models import State

        state = State.objects.create(
            code="KARNATAKA",
            name="Karnataka",
        )
        self.scholarship.state.add(state)

        self.student.state = "KARNATAKA"
        self.student.save()

        result = evaluate_eligibility(self.scholarship, self.student)

        self.assertEqual(
            result["criteria"]["state"]["status"],
            "passed",
        )
        self.assertEqual(result["overall_status"], "eligible")
    
    def test_district_requirement_passes(self):
        from scholarships.models import District

        district = District.objects.create(
            code="MYSURU",
            name="Mysuru",
        )
        self.scholarship.district.add(district)
        self.student.district = "mysuru"
        self.student.save()

        result = evaluate_eligibility(self.scholarship, self.student)
        self.assertEqual(result["criteria"]["district"]["status"], "passed")

    def test_course_requirement_passes(self):
        from scholarships.models import Course

        course = Course.objects.create(code="BE_BTECH", name="Engineering")
        self.scholarship.course.add(course)
        self.student.course = "BE_BTECH"
        self.student.save()

        result = evaluate_eligibility(self.scholarship, self.student)
        self.assertEqual(result["criteria"]["course"]["status"], "passed")

    def test_branch_requirement_passes(self):
        from scholarships.models import Branch

        branch = Branch.objects.create(code="CSE", name="Computer Science")
        self.scholarship.branch.add(branch)
        self.student.branch = "CSE"
        self.student.save()

        result = evaluate_eligibility(self.scholarship, self.student)
        self.assertEqual(result["criteria"]["branch"]["status"], "passed")

    def test_year_of_study_requirement_passes(self):
        self.scholarship.year_of_study = "3"
        self.scholarship.save()
        self.student.year_of_study = 3
        self.student.save()

        result = evaluate_eligibility(self.scholarship, self.student)
        self.assertEqual(result["criteria"]["year_of_study"]["status"], "passed")

    def test_postgraduate_requirement_passes(self):
        self.scholarship.year_of_study = "postgraduate"
        self.scholarship.save()
        self.student.course = "MCA"
        self.student.save()

        result = evaluate_eligibility(self.scholarship, self.student)
        self.assertEqual(result["criteria"]["year_of_study"]["status"], "passed")

    def test_gender_requirement_passes(self):
        self.scholarship.gender = "female"
        self.scholarship.save()
        self.student.gender = "FEMALE"
        self.student.save()

        result = evaluate_eligibility(self.scholarship, self.student)
        self.assertEqual(result["criteria"]["gender"]["status"], "passed")

    def test_pwd_requirement_passes(self):
        self.scholarship.pwd = True
        self.scholarship.save()
        self.student.pwd = True
        self.student.save()

        result = evaluate_eligibility(self.scholarship, self.student)
        self.assertEqual(result["criteria"]["pwd"]["status"], "passed")

    def test_minority_requirement_passes(self):
        self.scholarship.minority = True
        self.scholarship.save()
        self.student.minority = True
        self.student.save()

        result = evaluate_eligibility(self.scholarship, self.student)
        self.assertEqual(result["criteria"]["minority"]["status"], "passed")

    def test_missing_cgpa_returns_unknown(self):
        self.scholarship.minimum_cgpa = Decimal("7.00")
        self.scholarship.save()
        self.student.cgpa = None
        self.student.save()

        result = evaluate_eligibility(self.scholarship, self.student)
        self.assertEqual(result["criteria"]["cgpa"]["status"], "unknown")
        self.assertEqual(result["overall_status"], "incomplete")

    def test_missing_income_returns_unknown(self):
        self.scholarship.maximum_family_income = Decimal("250000")
        self.scholarship.save()
        self.student.family_income = None
        self.student.save()

        result = evaluate_eligibility(self.scholarship, self.student)
        self.assertEqual(result["criteria"]["family_income"]["status"], "unknown")
        self.assertEqual(result["overall_status"], "incomplete")

    def test_missing_gender_returns_unknown(self):
        self.scholarship.gender = "female"
        self.scholarship.save()
        self.student.gender = ""
        self.student.save()

        result = evaluate_eligibility(self.scholarship, self.student)
        self.assertEqual(result["criteria"]["gender"]["status"], "unknown")
        self.assertEqual(result["overall_status"], "incomplete")

    def test_missing_district_returns_unknown(self):
        from scholarships.models import District

        district = District.objects.create(code="MYSURU", name="Mysuru")
        self.scholarship.district.add(district)
        self.student.district = ""
        self.student.save()

        result = evaluate_eligibility(self.scholarship, self.student)
        self.assertEqual(result["criteria"]["district"]["status"], "unknown")
        self.assertEqual(result["overall_status"], "incomplete")
