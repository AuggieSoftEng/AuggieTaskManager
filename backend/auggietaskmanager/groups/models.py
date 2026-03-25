from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class StudyGroup(models.Model):
    name = models.CharField(max_length=100)

    description = models.TextField(max_length=500, blank=True)

    members = models.ManyToManyField(User, related_name='study_groups')

    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_groups')

    created_at = models.DateTimeField(auto_now_add=True)

