from django.db import models
from django.utils.timezone import now
from orm.managers import UserManager
from django.dispatch import receiver
from datetime import  timedelta


class User(models.Model):
    """Custom User model."""
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True, max_length=100)
    password = models.CharField(max_length=128, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(auto_now_add=True)
    remember_token = models.CharField(max_length=100, blank=True, null=True)
    remember_token_created_at = models.DateTimeField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profile_pictures/', blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)

    # Address Information
    address = models.TextField(blank=True, null=True)
    postal_code = models.CharField(max_length=20, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)

    is_active_user = models.BooleanField(default=False)  # Tracks if the user is active
    last_active = models.DateTimeField(null=True, blank=True)  # Tracks the last active time

    USERNAME_FIELD = "email"
    objects = UserManager()

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return self.email



class Product(models.Model):
    CATEGORY_CHOICES = [
        ('chemical', 'Chemical'),
        ('paper', 'Paper'),
        ('metal', 'Metal'),
    ]

    UNIT_CHOICES = [
        ('litre', 'Litre'),
        ('kilogram', 'Kilogram'),
    ]

    PRODUCT_STATUS_CHOICES = [
        ('inactive', 'Inactive'),
        ('listed', 'Listed'),
    ]

    title = models.CharField(max_length=255)
    image = models.ImageField(upload_to="product_images/", blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    lat = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    lng = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    quantity = models.PositiveIntegerField()
    unit = models.CharField(max_length=10, choices=UNIT_CHOICES)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    product_status = models.CharField(max_length=10, choices=PRODUCT_STATUS_CHOICES, default='inactive')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="products")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Product"
        verbose_name_plural = "Products"

    def __str__(self):
        return self.title

class Order(models.Model):
    ORDER_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('cancelled', 'Cancelled'),
        ('delivered', 'Delivered'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="orders")
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name="seller_orders")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="orders")
    quantity = models.PositiveIntegerField()
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    status = models.CharField(max_length=10, choices=ORDER_STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Order"
        verbose_name_plural = "Orders"

    def __str__(self):
        return f"Order {self.id} - {self.user}"


class Conversation(models.Model):
    user1 = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="conversation_user1")
    user2 = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="conversation_user2")
    latest_conversation = models.DateTimeField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)  # For soft delete
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Conversation between {self.user1} and {self.user2}"

   

    @property
    def latest_conversation_formatted(self):
        """Format the latest conversation date."""
        if self.latest_conversation:
            latest_conversation = self.latest_conversation

            if latest_conversation.date() == now().date():
                return latest_conversation.strftime('%I:%M %p')  # e.g., '10:30 AM'
            elif latest_conversation.date() == (now() - timedelta(days=1)).date():
                return "Yesterday"
            else:
                return latest_conversation.strftime('%m/%d/%Y')  # e.g., '01/06/2025'
        return ""

    def get_other_user(self, session_user):
        """Return the other user in the conversation based on the session user."""
        return self.user2 if session_user == self.user1 else self.user1
    
    @property
    def conversation_user(self, session_user):
        """Return the other user in the conversation based on the session user."""
        return "user2" if session_user == self.user1 else "user1"
    
    @property
    def latest_message(self):
        """Get the latest message content."""
        latest_message = self.messages.order_by('-created_at').first()
        return latest_message.content if latest_message else ""
    @property
    def unread_messages_count(self, session_user):
        """Count unread messages for the logged-in user."""
        return self.messages.filter(recipient_id=session_user.id, is_read=False).count()

class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.SET_NULL, null=True, related_name="messages")
    sender = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="sent_messages")
    recipient = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="received_messages")
    content = models.TextField(null=True, blank=True)
    read_at = models.DateTimeField(null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.sender} to {self.recipient}"
    
    def is_mine(self, session_user):
        """Check if the message was sent by the logged-in user."""
        return self.sender == session_user

  
    @property
    def message_daily_grouping(self):
        """Group messages by 'Today', 'Yesterday', or date."""
        created_at = self.created_at

        if created_at.date() == now().date():
            return "Today"
        elif created_at.date() == (now() - timedelta(days=1)).date():
            return "Yesterday"
        else:
            return created_at.strftime('%m/%d/%Y')  # e.g., '01/06/2025'

    @property
    def message_time(self):
        """Format the message time."""
        return self.created_at.strftime('%I:%M %p')  # e.g., '10:30 AM'

    @property
    def image_url(self):
        """Return the URL of the associated attachment."""
        if hasattr(self, 'attachment') and self.attachment and self.attachment.file_name:
            return f"/uploads/chats/images/{self.attachment.file_name}"
        return ""
    