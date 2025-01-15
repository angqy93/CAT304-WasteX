import logging
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from api.serializers import UserSerializer,UserActivitySerializer
from orm.models import User
from _applibs.response import echo, Messages
from datetime import timedelta
from django.utils.timezone import now
from ..decorators import token_auth_required
from django.db import transaction
logger = logging.getLogger(__name__)

class UserAPIView(APIView):
    permission_classes, authentication_classes = [], []

    @token_auth_required
    def get(self, request, user_id=None):
        try:
            if user_id:
                user = User.objects.get(pk=user_id)
                data = UserSerializer(user).data
            else:
                users = User.objects.all()
                data = UserSerializer(users, many=True).data

        
            # if data:
                return echo(status=status.HTTP_200_OK, msg=Messages.SUCCESS, data=data)
            # else:
            #     return echo(status=status.HTTP_200_OK, msg=Messages.SUCCESS, data=data)
        except Exception as e:
            logger.exception(e)
            return echo(status=status.HTTP_400_BAD_REQUEST, msg=Messages.EXCEPTION)

    @token_auth_required
    def post(self, request):
        try:
            with transaction.atomic():  # Ensure atomicity
                serializer = UserSerializer(data=request.data)

                if serializer.is_valid():
                    user = serializer.save()  # Save the new user instance
                    logger.info(f"User {user.id} created successfully.")
                    
                    return echo(
                        status=status.HTTP_201_CREATED,
                        msg=Messages.SUCCESS,
                        data=serializer.data
                    )
                else:
                    logger.error(f"User creation failed due to invalid data: {serializer.errors}")
                    return echo(
                        status=status.HTTP_400_BAD_REQUEST,
                        msg=Messages.INVALID_DATA,
                        data=serializer.errors  # Optionally, customize this to return more user-friendly errors
                    )
        except Exception as e:
            logger.exception(f"An error occurred while creating the user: {str(e)}")
            return echo(
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                msg=Messages.EXCEPTION
            )
    @token_auth_required
    def put(self, request, user_id=None):
        try:
            user = User.objects.get(pk=user_id)
            serializer = UserSerializer(user, data=request.data,partial=True)
            if serializer.is_valid():
                serializer.save()
                return echo(status=status.HTTP_200_OK, msg=Messages.SUCCESS, data=serializer.data)
            return echo(status=status.HTTP_400_BAD_REQUEST, msg=Messages.ID, data=serializer.errors)
        except User.DoesNotExist:
            return echo(status=404, msg=Messages.NF)
        except Exception as e:
            logger.exception(e)
            return echo(status=status.HTTP_400_BAD_REQUEST, msg=Messages.EXCEPTION)
    
    @token_auth_required
    def delete(self, request, user_id=None):
        try:
            user = User.objects.get(pk=user_id)
            user.delete()
            return echo(status=status.HTTP_204_NO_CONTENT, msg=Messages.SUCCESS)
        except User.DoesNotExist:
            return echo(status=404, msg=Messages.NF)
        except Exception as e:
            logger.exception(e)
            return echo(status=status.HTTP_400_BAD_REQUEST, msg=Messages.EXCEPTION)
        



class CheckUserActiveStatusAPIView(APIView):
    @token_auth_required
    def post(self, request):
        """Check if a user is active."""
        user_id = request.data.get('user_id')  # Use `request.data` for POST data

        if not user_id:
            return echo(
                status=status.HTTP_400_BAD_REQUEST,
                msg="User ID is required"
            )

        try:
            # Fetch the user by ID
            user = User.objects.get(id=user_id)

            # Check if the user is active based on the `last_active` timestamp
            is_active = (
                user.last_active is not None and 
                (now() - user.last_active) <= timedelta(seconds=30)
            )

            # Return the active status without modifying the database
            return echo(
                status=status.HTTP_200_OK,
                msg="User status retrieved successfully",
                data={
                    "is_active": is_active
                }
            )

        except User.DoesNotExist:
            return echo(
                status=status.HTTP_404_NOT_FOUND,
                msg="User not found"
            )
        
class UpdateUserLastActiveAPIView(APIView):
    @token_auth_required
    def post(self, request):
        """Update the user's last active time and mark as active."""
        user_id = request.user.id
        if not user_id:
            return echo(status=status.HTTP_400_BAD_REQUEST, msg="User ID is required")

        try:
            user = User.objects.get(id=user_id)
            user.is_active_user = True
            user.last_active = now()
            user.save()

            return echo(status=status.HTTP_200_OK, msg="User last active time updated successfully", data={
                "id": user.id,
                "is_active_user": user.is_active_user,
                "last_active": user.last_active
            })
        except User.DoesNotExist:
            return echo(status=status.HTTP_404_NOT_FOUND, msg="User not found")