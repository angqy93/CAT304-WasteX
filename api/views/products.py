import logging
from django.utils.text import slugify
import json
from django.http import Http404
from rest_framework import status
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from _applibs.response import echo, Messages
from api.serializers import ProductSerializer,UserSerializer
from orm.models import Product,User
from ..decorators import token_auth_required
from django.db import transaction
from django.conf import settings
import openai
openai.api_key = settings.OPENAI_API_KEY

logger = logging.getLogger(__name__)


class ProductAPIView(APIView):
    permission_classes, authentication_classes = [], []

    @token_auth_required
    def get(self, request, product_id=None):
        try:
            created_by_id = request.user.id

            if product_id:
                # Fetch a single product by ID
                product = Product.objects.filter(id=product_id,created_by=created_by_id).first()
                if not product:
                    return echo(status=status.HTTP_404_NOT_FOUND, msg="Product not found.")
                serializer = ProductSerializer(product, context={'request': request})
                return echo(status=status.HTTP_200_OK, msg="Success", data=serializer.data)
            else:
                # Fetch all products for the authenticated user
                products = Product.objects.filter(created_by=created_by_id).order_by('-created_at')
                serializer = ProductSerializer(products, many=True, context={'request': request})
                return echo(status=status.HTTP_200_OK, msg="Success", data=serializer.data)
            
        except Exception as e:
            logger.exception(e)
            return echo(status=status.HTTP_400_BAD_REQUEST, msg="An error occurred.")
                  
    @token_auth_required
    def post(self, request):
        try:
            # Add the current user's ID to the request data
            request.data['created_by_id'] = request.user.id
            
            # Truncate latitude and longitude to 6 decimal places
            if 'lat' in request.data:
                request.data['lat'] = round(float(request.data['lat']), 6)
            if 'lng' in request.data:
                request.data['lng'] = round(float(request.data['lng']), 6)

            # Initialize serializer with updated data
            serializer = ProductSerializer(data=request.data, context={'request': request})

            # Validate the data
            if serializer.is_valid():
                # Save the instance and get the product object
                product = serializer.save()

                # Serialize the saved instance for the response
                data = serializer.data
                return echo(
                    status=status.HTTP_201_CREATED,
                    msg="Product created successfully.",
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
            logger.error(f"Error in ProductCreateView: {str(e)}")
            return echo(
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                msg="An unexpected error occurred.",
                data=str(e)
            )

    @token_auth_required
    def put(self, request, product_id=None):
        try:
            if not product_id:
                return echo(status=status.HTTP_400_BAD_REQUEST, msg="Product ID is required for updating.")

            user_id = request.user.id
            product = get_object_or_404(Product, id=product_id, created_by_id=user_id)

            logger.info(f"Received PUT request for order_id: {product_id}, user_id: {request.user.id}")

            # Truncate latitude and longitude to 6 decimal places
            if 'lat' in request.data:
                request.data['lat'] = round(float(request.data['lat']), 6)
            if 'lng' in request.data:
                request.data['lng'] = round(float(request.data['lng']), 6)

            # Update the product with the new data
            serializer = ProductSerializer(product, data=request.data, partial=True, context={'request': request})
            if serializer.is_valid():
                updated_product = serializer.save()
                return echo(
                    status=status.HTTP_200_OK,
                    msg="Product updated successfully.",
                    data=ProductSerializer(updated_product, context={'request': request}).data
                )
            else:
                return echo(
                    status=status.HTTP_400_BAD_REQUEST,
                    msg="Validation failed.",
                    data=serializer.errors
                )
        except Http404:
            return echo(status=status.HTTP_404_NOT_FOUND, msg="Product not found.")
        except Exception as e:
            logger.error(f"Error in ProductUpdateView: {str(e)}")
            return echo(
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                msg="An unexpected error occurred.",
                data=str(e)
            )

    @token_auth_required
    def delete(self, request, product_id=None):
        try:
            if not product_id:
                return echo(status=status.HTTP_400_BAD_REQUEST, msg="Product ID is required for deletion.")
            
            user_id = request.user.id
            product = get_object_or_404(Product, id=product_id, created_by_id=user_id)
            
            # Delete the product
            product.delete()
            return echo(
                status=status.HTTP_200_OK,
                msg="Product deleted successfully.",
                data={"id": product_id}
            )
        except Http404:
            return echo(status=status.HTTP_404_NOT_FOUND, msg="Product not found.")
        except Exception as e:
            logger.error(f"Error in ProductDeleteView: {str(e)}")
            return echo(
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                msg="An unexpected error occurred.",
                data=str(e)
            )
        
class ProductWithoutAuthAPIView(APIView):
    permission_classes = []  # No permissions required
    authentication_classes = []  # No authentication required

    def get(self, request, product_id=None):
        try:
            if product_id:
                # Fetch a single product by ID
                product = Product.objects.filter(id=product_id).first()
                if not product:
                    return echo(
                        status=status.HTTP_404_NOT_FOUND,
                        msg="Product not found."
                    )
                serializer = ProductSerializer(product, context={'request': request})
                return echo(
                    status=status.HTTP_200_OK,
                    msg="Success",
                    data=serializer.data
                )
            else:
                # Fetch all products
                products = Product.objects.all().order_by('-created_at')

                # Apply query filters
                query = request.GET.get('query')
                category = request.GET.get('category')
                lat = request.GET.get('lat')
                lng = request.GET.get('lng')
                radius = float(request.GET.get('radius', 50))  # Default radius: 50 km

                if query:
                    products = products.filter(title__icontains=query)

                if category:
                    products = products.filter(category=category)

                if lat and lng:
                    try:
                        lat, lng = float(lat), float(lng)
                        products = [
                            product for product in products 
                            if self.calculate_distance(lat, lng, float(product.lat), float(product.lng)) <= radius
                        ]
                    except ValueError:
                        return echo(
                            status=status.HTTP_400_BAD_REQUEST,
                            msg="Invalid latitude or longitude format."
                        )

                # Serialize the filtered products
                serializer = ProductSerializer(products, many=True, context={'request': request})
                return echo(
                    status=status.HTTP_200_OK,
                    msg="Success",
                    data=serializer.data
                )

        except Exception as e:
            logger.exception(f"An error occurred: {e}")
            return echo(
                status=status.HTTP_400_BAD_REQUEST,
                msg="An error occurred.",
                data=str(e)
            )

    # Helper function to calculate distance (Haversine formula)
    def calculate_distance(self, lat1, lon1, lat2, lon2):
        from math import radians, cos, sin, sqrt, atan2
        earth_radius = 6371  # Radius of Earth in kilometers
        d_lat = radians(lat2 - lat1)
        d_lon = radians(lon2 - lon1)
        a = sin(d_lat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(d_lon / 2) ** 2
        c = 2 * atan2(sqrt(a), sqrt(1 - a))
        return earth_radius * c  # Distance in kilometers


class ReWriteDescriptionAPIView(APIView):
    @token_auth_required
    def post(self, request):
        """Rewrite a product description using ChatGPT."""
        title = request.data.get("title", "").strip()
        category = request.data.get("category", "").strip()

        if not title or not category:
            return echo(
                status=status.HTTP_400_BAD_REQUEST,
                msg="Both title and category are required."
            )

        # Create a combined description
        desc = f"""
        Analyze the following waste: "{title}". Provide the following details:
        1. What type of waste is it?
        2. What can it be repurposed or made into?
        3. How should it be disposed of properly (recycled, composted, or other)?
        """

        try:
            completion = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "developer", 
                    "content": "You are an AI assistant specializing in waste management and environmental sustainability. Your task is to analyze waste descriptions and provide recommendations for repurposing or disposal."
                 },
                {"role": "user", "content": desc}
            ]
            )
            return echo(
                status=status.HTTP_200_OK,
                msg="Description rewritten successfully.",
                data={
                    "original_desc": desc,
                    "improved_desc": completion.choices[0].message.content
                }
            )
       
        except Exception as e:
            return echo(
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                msg="An unexpected error occurred.",
                data={"error": str(e)}
            )
