from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed
from rest_framework import status
from django.conf import settings
from django.contrib.auth.hashers import check_password, make_password
from datetime import datetime as dateTime
import logging

logger = logging.getLogger(__name__)

# from orm.models import User,UserCompany
from orm.models import User 
from ..serializers import (
    UserSerializer,UserRegistrationSerializer)
from _applibs.response import echo, Messages
from ..decorators import token_auth_required,token_auth_not_required
from api.functions import generateToken
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.exceptions import NotFound
import uuid
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError



class UserLoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        response = Response()

        user = User.objects.filter(email=email).first()

        if user is None:
            return echo(status=status.HTTP_400_BAD_REQUEST, msg='User not found!')
    
        if not check_password(password, user.password):
            return echo(status=status.HTTP_400_BAD_REQUEST, msg='Incorrect password!')

     

        tokens = generateToken(user.id, request)

        response = echo(status=status.HTTP_200_OK, msg=Messages.SUCCESS, data=tokens)
        response.set_cookie(key='access', value=tokens['access'], httponly=True, secure=True, samesite='None')
        response.set_cookie(key='refresh', value=tokens['refresh'], httponly=True, secure=True, samesite='None')
      
        return response
    
class VerifyToken(APIView):
    """
    Endpoint to verify the access token.
    """
    @token_auth_not_required
    def post(self, request):
        # Check if the user is authenticated
        if getattr(request, 'user', None):
            return Response({"valid": True}, status=status.HTTP_200_OK)
        else:
            return Response({"valid": False}, status=status.HTTP_401_UNAUTHORIZED)



class UserRegistrationView(APIView):
    def post(self, request):

        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            # Save the new user if email does not exist
            serializer.save()
           
            return echo(status=status.HTTP_201_CREATED, msg=Messages.SUCCESS,data=serializer.data)
            # send_otp(serializer.validated_data['email'])  
        # Handle invalid serializer case
        return echo(status=status.HTTP_400_BAD_REQUEST, msg=Messages.ID, data=serializer.errors)



class UserView(APIView):
    @token_auth_required
    def get(self, request):
        try:
            # Fetch the currently authenticated user
            user = request.user

            # Fetch additional user details, if needed
            user_details = User.objects.get_user(user.id)
            if not user_details:
                raise NotFound("User details not found.")

            # Serialize the user details
            serializer = UserSerializer(user_details)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
       
class UserLogoutView(APIView):
    def post(self, request):
        # Extract the access and refresh tokens from the request cookies
        access_token = request.COOKIES.get('access')
        refresh_token = request.COOKIES.get('refresh')

        # Initialize response
        response = Response()

        if refresh_token:
            try:
                # Create RefreshToken object from the provided token
                refresh = RefreshToken(refresh_token)
                
                # Blacklist the refresh token
                refresh.blacklist()
                
                # Optionally, log the action or notify the user
                logger.info(f"Token for user {refresh.user_id} has been invalidated.")
                
            except Exception as e:
                # Handle the exception if token invalidation fails
                logger.error(f"Failed to invalidate token: {str(e)}")
            # Delete the JWT cookies
            response.delete_cookie('access')
            response.delete_cookie('refresh')


        response.data = {
            'message': 'Logged out successfully'
        }
        response.status_code = status.HTTP_200_OK
        return response

class TokenRefreshView(APIView):
    def post(self, request, *args, **kwargs):
        # Extract the refresh token from the request body or cookies
        refresh_token = request.data.get('refresh_token') or request.COOKIES.get('refresh')

        if refresh_token is None:
            return Response({"error": "Refresh token is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Create a RefreshToken object from the provided token
            token = RefreshToken(refresh_token)
            
            # Generate a new access token
            new_access_token = str(token.access_token)
            new_refresh_token = str(token)

            # Optionally, set the new tokens in cookies
            response = Response({
                'access_token': new_access_token,
                'refresh_token': new_refresh_token
            })

            # Set the new tokens as cookies
            response.set_cookie('access', new_access_token, httponly=True, secure=True, samesite='None')
            response.set_cookie('refresh', new_refresh_token, httponly=True, secure=True, samesite='None')

            return response

        except (TokenError, InvalidToken) as e:
            return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)
        
