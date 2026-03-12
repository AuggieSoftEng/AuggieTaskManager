from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token

from django.contrib.auth.models import User
from django.contrib.auth import authenticate

#from django.shortcuts import render
from .models import UserProfile

# Create your views here.


class UserSignUpView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        firstname = request.data.get("firstname")
        lastname = request.data.get("lastname")
        email = request.data.get("email")

        schoolyear = request.data.get("schoolyear", "")
        major = request.data.get("major", "")
        minor = request.data.get("minor", "")
        if not username or not password or not email:
            return Response({"error": "Username, password, and email are required."}, status=400)

        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already exists."}, status=400)

        user = User.objects.create_user(
            username=username, password=password, email=email, first_name=firstname, last_name=lastname
        )
        UserProfile.objects.create(user=user, schoolYear=schoolyear, major=major, minor=minor)

        return Response({"message": "User created successfully."}, status=201)

class UserLoginView(APIView):
    def post (self, request):
        # Grabing the username and password from the frontend request
        identifier = request.data.get("username") or request.data.get("email") or request.data.get("identifier")
        password = request.data.get("password")
        
        # Checking to see if credentials were valid
        if not identifier or not password:
            return Response({"error": "Username/email and password are required."}, status = 400)
        
        user = User.objects.filter(username = identifier).first()
        if not user:
            user = User.objects.filter(email = identifier).first()
        
        if not user:
            return Response({"error": "Invalid Credentials"}, status = 401)
    