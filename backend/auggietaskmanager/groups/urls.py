from django.urls import path

from . import views

app_name = "groups"

urlpatterns = [
    path("", views.StudyGroupListCreateView.as_view(), name="groups"),
    path("join/", views.join_study_group, name="joinGroup"),
    path("leave/", views.leave_study_group, name="leaveGroup"),
]