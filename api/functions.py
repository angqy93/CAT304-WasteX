from django.conf import settings
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from datetime import  timedelta
from orm.models import User
from rest_framework.pagination import PageNumberPagination

from django.utils.timezone import localdate

def generateToken(user_id, request):
    """
    Generate JWT tokens with custom expiration and domain handling.
    """
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        raise ValueError("User does not exist")
    
    refresh = RefreshToken.for_user(user)

    refresh.set_exp(lifetime=timedelta(days=1))

    host = request.get_host()
    domain_parts = host.split('.')
    
    main_domain = ''
    if len(domain_parts) >= 2:
        main_domain = '.' + '.'.join(domain_parts[-2:])  # .example.com
    subdomain = "*"

    refresh['domain'] = main_domain
    refresh['subdomain'] = subdomain

    access_token = str(refresh.access_token)
    refresh_token = str(refresh)

    return {
        'access': access_token,
        'refresh': refresh_token
    }


class CustomPagination(PageNumberPagination):
    page_size = 10  # Default number of items per page
    page_size_query_param = 'page_size'  # Allow clients to set the page size
    max_page_size = 100  # Maximum number of items per page




