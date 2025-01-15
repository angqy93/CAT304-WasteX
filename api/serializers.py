from rest_framework import serializers
from orm.models import User,Product,Order,Conversation,Message
from django.contrib.auth.hashers import make_password
from drf_extra_fields.fields import Base64ImageField
from django.utils.timezone import now
from datetime import timedelta



class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'name', 'email','address','postal_code','state','phone_number','country',
            'is_active', 'date_joined', 
            'profile_picture'
        ]
        extra_kwargs = {
            'remember_token': {'read_only': False},  # Make token read-only
            'remember_token_created_at': {'read_only': True},  # Make token timestamp read-only
            'profile_picture': {'required': False, 'allow_null': True},  # Optional field
        }

class UserActivitySerializer(serializers.ModelSerializer):
    is_currently_active = serializers.SerializerMethodField()
    class Meta:
        model = User
        fields = ['id', 'is_active_user', 'last_active', 'is_currently_active']

    def get_is_currently_active(self, obj):
        """Determine if the user is currently active."""
        if obj.last_active:
            return (now() - obj.last_active) <= timedelta(seconds=30)
        return False
    
class AuthSerializer(serializers.Serializer):
    code = serializers.CharField(required=True)
    #ignore this
    error = serializers.CharField(required=False)       

class UserRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'password', 'name','address','postal_code','state','country', 'is_active','phone_number', 'date_joined']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        # Set a default role ID if 'role_id' is not provided in validated_data
        return super().create(validated_data)
    


class ProductSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)  # Fetch full user details
    created_by_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='created_by', write_only=True
    )  # Write-only user ID
    image = Base64ImageField(required=True)

    class Meta:
        model = Product
        fields = [
            'id', 'title', 'image', 'description', 'lat', 'lng', 'location',
            'category', 'quantity', 'unit', 'price', 'product_status',
            'created_by', 'created_by_id', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']


class OrderSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)  # Fetch full user details
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='user', write_only=True
    )  # Write-only user ID
    seller = UserSerializer(read_only=True)  # Fetch full seller details

    product = ProductSerializer(read_only=True)  # Fetch full user details
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source='product', write_only=True
    )  # Write-only user ID
   
    class Meta:
        model = Order
        fields = [
            'id', 'user', 'user_id', 'seller', 'product', 'product_id', 'quantity',
            'total_amount', 'tax', 'status', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'seller', 'product', 'created_at', 'updated_at']

    def create(self, validated_data):
        """Custom create method to set the seller field."""
        product = validated_data['product']
        validated_data['seller'] = product.created_by  # Set the seller from product's created_by
        return super().create(validated_data)

class ConversationSerializer(serializers.ModelSerializer):
    user1 = UserSerializer(read_only=True)
    user2 = UserSerializer(read_only=True)
    user1_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), source='user1', write_only=True)
    user2_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), source='user2', write_only=True)
    latest_message_content = serializers.SerializerMethodField()
    conversation_user = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            'id', 'user1', 'user2', 'user1_id', 'user2_id',
            'latest_message_content', 'latest_conversation', 'conversation_user', 'created_at', 'updated_at'
        ]

    def get_latest_message_content(self, obj):
        """Serialize the latest message content."""
        return obj.latest_message if hasattr(obj, 'latest_message') else None

    def get_conversation_user(self, obj):
        """Determine the user the logged-in user is conversing with."""
        request = self.context.get('request')  # Get the request object from the context
        session_user = getattr(request, 'user', None)  # Safely access the user from the request

        if not session_user:  # If the user is not authenticated, return None
            return None

        # Return the other user in the conversation
        if obj.user1 == session_user:
            return UserSerializer(obj.user2, context=self.context).data
        elif obj.user2 == session_user:
            return UserSerializer(obj.user1, context=self.context).data
        return None

class GetUserConversationsSerializer(serializers.ModelSerializer):
    user1_id = serializers.IntegerField(source='user1.id', read_only=True)
    user2_id = serializers.IntegerField(source='user2.id', read_only=True)
    latest_message_content = serializers.SerializerMethodField()
    conversation_user = serializers.SerializerMethodField()
    unread_messages_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            'id', 'user1_id', 'user2_id', 'latest_message_content',
            'latest_conversation', 'conversation_user', 'unread_messages_count', 'created_at', 'updated_at'
        ]

    def get_latest_message_content(self, obj):
        """Serialize the latest message content."""
        return obj.latest_message if hasattr(obj, 'latest_message') else None

    def get_unread_messages_count(self, obj):
        """Calculate the unread messages count for the logged-in user."""
        request = self.context.get('request')  # Get the request object from the context
        session_user = getattr(request, 'user', None)  # Safely access the user from the request

        if session_user:
            return obj.messages.filter(recipient_id=session_user.id, is_read=False).count()
        return 0

    def get_conversation_user(self, obj):
        """Determine the user the logged-in user is conversing with."""
        request = self.context.get('request')  # Get the request object from the context
        session_user = getattr(request, 'user', None)  # Safely access the user from the request

        if not session_user:  # If the user is not authenticated, return None
            return None

        # Return the other user in the conversation
        if obj.user1 == session_user:
            return UserSerializer(obj.user2, context=self.context).data
        elif obj.user2 == session_user:
            return UserSerializer(obj.user1, context=self.context).data
        return None
   

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    recipient = UserSerializer(read_only=True)
    sender_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), source='sender', write_only=True)
    recipient_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), source='recipient', write_only=True)
    conversation = ConversationSerializer(read_only=True)
    conversation_id = serializers.PrimaryKeyRelatedField(queryset=Conversation.objects.all(), source='conversation', write_only=True)

    class Meta:
        model = Message
        fields = [
            'id', 'conversation', 'conversation_id', 'sender', 'sender_id',
            'recipient', 'recipient_id', 'content', 'read_at', 'is_read', 'created_at'
        ]