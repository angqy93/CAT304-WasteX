from django.conf import settings
from django.urls import path

from rest_framework.urlpatterns import format_suffix_patterns
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from api.views.users import UserAPIView
from api.views.products import ProductAPIView,ProductWithoutAuthAPIView,ReWriteDescriptionAPIView
from api.views.conversations  import ConversationAPIView, ConversationDetailAPIView,LatestMessagesAPIView, MessageAPIView, UserListAPIView
from api.views.orders import OrderAPIView
from api.views.users import CheckUserActiveStatusAPIView, UpdateUserLastActiveAPIView

from api.views.authentication import (
    UserLogoutView,UserRegistrationView,
    UserView,UserLoginView,VerifyToken)

urlpatterns = [

    # User CRUD
    path('users', UserAPIView.as_view(), name='user_list'),
    path('users/<int:user_id>', UserAPIView.as_view(), name='user_detail'),

    path('users/check-user-active', CheckUserActiveStatusAPIView.as_view(), name='check-user-active'),
    path('users/update-active', UpdateUserLastActiveAPIView.as_view(), name='update-user-active'),

    # Authentication apis
    path('token', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('verify_token', VerifyToken.as_view(), name='verify_token'),
    path('token/refresh', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/login', UserLoginView.as_view(), name='UserLoginView'),
    path('auth/register', UserRegistrationView.as_view(), name='UserRegistrationView'),
    path('auth/user', UserView.as_view(), name='user_view'),
    path('auth/logout', UserLogoutView.as_view(), name='user_logout'),

    # PRODUCT
    path('products', ProductAPIView.as_view(), name='product_list'),
    path('products/<int:product_id>', ProductAPIView.as_view(), name='product_detail'),
    path('products/public', ProductWithoutAuthAPIView.as_view(), name='product_list_public'),
    path('products/public/<int:product_id>', ProductWithoutAuthAPIView.as_view(), name='product_detail_public'),
    path('products/chat-gpt-re-write-dec', ReWriteDescriptionAPIView.as_view(), name='rewrite-description'),

    # PRODUCT
    path('orders', OrderAPIView.as_view(), name='order_list'),
    path('orders/<int:order_id>', OrderAPIView.as_view(), name='order_detail'),
   
    path('conversations', ConversationAPIView.as_view(), name='conversation-list'),
    path('conversations/<int:pk>', ConversationDetailAPIView.as_view(), name='conversation-detail'),
    path('conversations/latest_messages', LatestMessagesAPIView.as_view(), name='latest_messages'),
    path('conversations/messages', MessageAPIView.as_view(), name='conversations-message-list'),
    path('conversations/users', UserListAPIView.as_view(), name='conversations-user-list'),



    

  
]

# Serve media files in development
# if settings.DEBUG:
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns = format_suffix_patterns(urlpatterns)
