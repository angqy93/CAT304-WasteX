import logging
from django.utils.text import slugify
import json
from django.http import Http404
from rest_framework import status
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from _applibs.response import echo, Messages
from api.serializers import OrderSerializer,UserSerializer
from orm.models import Order,User
from ..decorators import token_auth_required
from django.db import transaction


logger = logging.getLogger(__name__)


class OrderAPIView(APIView):
    permission_classes, authentication_classes = [], []

    @token_auth_required
    def get(self, request, order_id=None):
        """Fetch orders for the authenticated user based on type or order ID."""
        try:
            user_id = request.user.id
            order_type = request.query_params.get('type', 'purchase')  # Default to 'purchase' if not specified

            if order_id:
                # Fetch a single order by ID
                order = Order.objects.filter(id=order_id, user_id=user_id).first()
                if not order:
                    return echo(status=status.HTTP_404_NOT_FOUND, msg="Order not found.")
                serializer = OrderSerializer(order, context={'request': request})
                return echo(status=status.HTTP_200_OK, msg="Success", data=serializer.data)

            # Fetch orders based on type
            if order_type == 'purchase':
                orders = Order.objects.filter(user_id=user_id).order_by('-created_at')
            elif order_type == 'sales':
                orders = Order.objects.filter(seller_id=user_id).order_by('-created_at')
            else:
                return echo(status=status.HTTP_400_BAD_REQUEST, msg="Invalid type parameter. Use 'purchase' or 'sales'.")

            # Serialize and return the orders
            serializer = OrderSerializer(orders, many=True, context={'request': request})
            return echo(status=status.HTTP_200_OK, msg="Success", data=serializer.data)

        except Exception as e:
            logger.exception(e)
            return echo(status=status.HTTP_400_BAD_REQUEST, msg="An error occurred.")

    @token_auth_required
    def post(self, request):
        try:
            # Add the current user's ID to the request data
            request.data['user_id'] = request.user.id
            print('coming')
            # Initialize serializer with updated data
            serializer = OrderSerializer(data=request.data, context={'request': request})

            # Validate the data
            if serializer.is_valid():
                # Save the instance and get the order object
                order = serializer.save()
                
                
                # Serialize the saved instance for the response
                data = serializer.data
                return echo(
                    status=status.HTTP_201_CREATED,
                    msg="Order created successfully.",
                    data=data
                )
            else:
                # Extract and return the first validation error
                data = serializer.errors 
                return echo(
                    status=status.HTTP_400_BAD_REQUEST,
                    msg="Validation failed.",
                    data=data
                )
        except Exception as e:
            logger.error(f"Error in OrderCreateView: {str(e)}")
            return echo(
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                msg="An unexpected error occurred.",
                data=str(e)
            )
 
    @token_auth_required
    def put(self, request, order_id=None):
        logger.info(f"Authenticated user ID: {request.user.id}")
        try:
            if not order_id:
                return echo(status=status.HTTP_400_BAD_REQUEST, msg="Order ID is required for updating.")
            
            user_id = request.user.id
            order = get_object_or_404(Order, id=order_id, seller_id=user_id)

            # Update the order with the new data
            serializer = OrderSerializer(order, data=request.data, partial=True, context={'request': request})
            if serializer.is_valid():
                updated_order = serializer.save()
                return echo(
                    status=status.HTTP_200_OK,
                    msg="Order updated successfully.",
                    data=OrderSerializer(updated_order, context={'request': request}).data
                )
            else:
                return echo(
                    status=status.HTTP_400_BAD_REQUEST,
                    msg="Validation failed.",
                    data=serializer.errors
                )
        except Http404:
            return echo(status=status.HTTP_404_NOT_FOUND, msg="Order not found.")
        except Exception as e:
            logger.error(f"Error in OrderUpdateView: {str(e)}")
            return echo(
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                msg="An unexpected error occurred.",
                data=str(e)
            )

    @token_auth_required
    def delete(self, request, order_id=None):
        try:
            if not order_id:
                return echo(status=status.HTTP_400_BAD_REQUEST, msg="Order ID is required for deletion.")
            
            user_id = request.user.id
            order = get_object_or_404(Order, id=order_id, user_id=user_id)
            
            # Delete the order
            order.delete()
            return echo(
                status=status.HTTP_200_OK,
                msg="Order deleted successfully.",
                data={"id": order_id}
            )
        except Http404:
            return echo(status=status.HTTP_404_NOT_FOUND, msg="Order not found.")
        except Exception as e:
            logger.error(f"Error in OrderDeleteView: {str(e)}")
            return echo(
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                msg="An unexpected error occurred.",
                data=str(e)
            )
        

