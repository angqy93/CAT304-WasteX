from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from orm.models import Conversation, Message, User
from ..serializers import ConversationSerializer, MessageSerializer, UserSerializer,GetUserConversationsSerializer
from _applibs.response import echo, Messages
from ..decorators import token_auth_required
from django.db import models
from django.utils.timezone import now
from ..functions import CustomPagination
import logging,json
logger = logging.getLogger(__name__)


class ConversationAPIView(APIView):
    @token_auth_required
    def get(self, request):
        session_user = request.user
        conversations = Conversation.objects.filter(
            models.Q(user1=session_user) | models.Q(user2=session_user)
        ).order_by('-latest_conversation')

        serializer = GetUserConversationsSerializer(conversations, many=True, context={'request': request})
        return echo(status=status.HTTP_200_OK, msg=Messages.SUCCESS, data=serializer.data)

   
    @token_auth_required
    def post(self, request):
        """Create a new conversation with a single user."""
        user_id = request.data.get('reciever_id')
        if not user_id:
            return echo(status=status.HTTP_400_BAD_REQUEST, msg="Please provide a user ID")

        # Ensure the user cannot create a conversation with themselves
        if user_id == request.user.id:
            return echo(status=status.HTTP_400_BAD_REQUEST, msg="You cannot create a conversation with yourself")

        # Check if a conversation already exists
        existing_conversation = Conversation.objects.filter(
            (models.Q(user1_id=request.user.id) & models.Q(user2_id=user_id)) |
            (models.Q(user1_id=user_id) & models.Q(user2_id=request.user.id))
        ).first()

        if existing_conversation:
            serializer = ConversationSerializer(existing_conversation)
            return echo(status=status.HTTP_200_OK, msg="Conversation already exists", data=serializer.data)

        # Create a new conversation
        conversation = Conversation.objects.create(
            user1_id=request.user.id,
            user2_id=user_id
        )

        serializer = ConversationSerializer(conversation)
        return echo(status=status.HTTP_201_CREATED, msg=Messages.CREATED, data=serializer.data)



class ConversationDetailAPIView(APIView):
    @token_auth_required
    def get(self, request, pk):
        """Retrieve a specific conversation and mark messages as read."""
        conversation = get_object_or_404(Conversation, pk=pk)
        serializer = GetUserConversationsSerializer(conversation,context={'request': request})
        return echo(status=status.HTTP_200_OK, msg=Messages.SUCCESS, data=serializer.data)

class LatestMessagesAPIView(APIView):
    @token_auth_required
    def post(self, request):
        pk = request.data.get('conversation_id')  # Get conversation_id from request data
        if not pk:
            return echo(status=status.HTTP_400_BAD_REQUEST, msg="Conversation ID is required.")

        # Retrieve the conversation by its ID
        conversation = get_object_or_404(Conversation, pk=pk)

        # Filter messages where recipient_id is not the logged-in user and mark as read
        messages = Message.objects.filter(
            conversation=conversation,
            is_read=False,
            recipient=request.user.id
        )
 
        # Serialize the messages and conversation
        message_serializer = MessageSerializer(messages, many=True, context={'request': request})
        data = message_serializer.data
        # Update the unread messages as read
        messages.update(is_read=True)

        return echo(
            status=status.HTTP_200_OK,
            msg=Messages.SUCCESS,
            data= data
        )


class UserListAPIView(APIView):
    @token_auth_required
    def get(self, request):
        """Fetch users with whom the current user is having conversations."""
        user_id = request.user.id

        # Fetch conversations where the user is either user1 or user2
        conversations = Conversation.objects.filter(
            models.Q(user1_id=user_id) | models.Q(user2_id=user_id)
        )

        # Extract unique user IDs of conversation partners
        conversation_user_ids = set()
        for conversation in conversations:
            if conversation.user1_id != user_id:
                conversation_user_ids.add(conversation.user1_id)
            if conversation.user2_id != user_id:
                conversation_user_ids.add(conversation.user2_id)

        # Fetch user details for these IDs
        users = User.objects.filter(id__in=conversation_user_ids)
        serializer = UserSerializer(users, many=True)
        return echo(status=status.HTTP_200_OK, msg=Messages.SUCCESS, data=serializer.data)

class MessageAPIView(APIView):
    pagination = {
        "page": 1,
        "record_from": 0,
        "record_to": 0,
        "total_records": 0,
        "total_pages": 0,
        "record_per_page": 10,
    }

    @token_auth_required
    def get(self, request):
        """Paginate messages for a specific conversation and mark other user's messages as read."""
        conversation_id = request.query_params.get('conversation_id')

        if not conversation_id:
            return echo(status=status.HTTP_400_BAD_REQUEST, msg="Conversation ID is required")

        try:
            # Extract pagination parameters
            self.pagination['page'] = int(request.query_params.get('page', 1))
            self.pagination['record_per_page'] = int(request.query_params.get('record_per_page', 10))
            self.pagination['record_from'] = (self.pagination['page'] - 1) * self.pagination['record_per_page']
            self.pagination['record_to'] = self.pagination['record_from'] + self.pagination['record_per_page']

            # Fetch total record count and calculate total pages
            self.pagination['total_records'] = Message.objects.filter(conversation_id=conversation_id).count()
            self.pagination['total_pages'] = (self.pagination['total_records'] + self.pagination['record_per_page'] - 1) // self.pagination['record_per_page']

            # Fetch paginated messages
            messages = Message.objects.filter(conversation_id=conversation_id).order_by('-created_at')[
                self.pagination['record_from']:self.pagination['record_to']
            ]

            # Mark unread messages (sent by the other user) as read
            unread_messages = Message.objects.filter(
                conversation_id=conversation_id,
                recipient_id=request.user.id,
                is_read=False
            )
            unread_messages.update(is_read=True)

            # Serialize the messages
            serializer = MessageSerializer(messages, many=True, context={'request': request})

            # Return the response with pagination details
            return echo(
                status=status.HTTP_200_OK,
                msg=Messages.SUCCESS,
                data={
                    "pagination": self.pagination,
                    "messages": serializer.data
                }
            )

        except Exception as e:
            # Handle unexpected errors gracefully
            logger.exception(f"Error fetching messages for conversation {conversation_id}: {str(e)}")
            return echo(status=status.HTTP_500_INTERNAL_SERVER_ERROR, msg="An error occurred while fetching messages.")

    @token_auth_required
    def post(self, request):
        """Send a message in a conversation."""
        serializer = MessageSerializer(data=request.data)
        if serializer.is_valid():
            # Save the message
            message = serializer.save(sender=request.user)

            # Update the latest_conversation field in the associated Conversation
            conversation = message.conversation
            conversation.latest_conversation = now()
            conversation.save()

            # Return the response
            return echo(status=status.HTTP_201_CREATED, msg=Messages.CREATED, data=serializer.data)

        return echo(status=status.HTTP_400_BAD_REQUEST, msg=Messages.INVALID_PARAMETERS, data=serializer.errors)



