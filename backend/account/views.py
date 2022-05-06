from django.conf import settings
from rest_framework import status
from rest_framework.generics import RetrieveUpdateDestroyAPIView
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .serializers import (
    CookieTokenRefreshSerializer,
    RegisterSerializer,
    MemberSerializer,
)
from .models import Member


class MemberAPIStructure(APIView):
    @staticmethod
    def get(request):
        return Response(
            {
                "signin/": "Sign in (Refresh Token + Access Token)",
                "signout/": "Sign out",
                "register/": "Register",
                "refreshtoken/": "Get Refresh Token",
                "profile/": "User info",
            }
        )


class RegisterView(APIView):
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

    def post(self, request):
        user = request.data

        serializer = self.serializer_class(data=user)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CookieTokenObtainPairView(TokenObtainPairView):
    def finalize_response(self, request, response, *args, **kwargs):
        if response.data.get(
            "refresh",
        ):
            cookie_max_age = 3600 * 24
            response.set_cookie(
                "refresh_token",
                response.data["refresh"],
                max_age=cookie_max_age,
                httponly=settings.HTTP_ONLY_COOKIE,
                samesite=settings.SAME_SITE,
            )
            del response.data["refresh"]

        return super().finalize_response(request, response, *args, **kwargs)


class CookieTokenRefreshView(TokenRefreshView):
    def finalize_response(self, request, response, *args, **kwargs):
        if response.data.get(
            "refresh",
        ):
            cookie_max_age = 3600 * 24
            response.set_cookie(
                "refresh_token",
                response.data["refresh"],
                max_age=cookie_max_age,
                httponly=settings.HTTP_ONLY_COOKIE,
                samesite=settings.SAME_SITE,
            )
            del response.data["refresh"]

        return super().finalize_response(request, response, *args, **kwargs)

    serializer_class = CookieTokenRefreshSerializer


class SignOutView(APIView):
    permission_classes = (IsAuthenticated,)

    @staticmethod
    def post(request):
        user_refresh_token = request.COOKIES["refresh_token"]
        refresh_token = RefreshToken(user_refresh_token)
        refresh_token.blacklist()

        response = Response({"status": "OK, goodbye"})
        response.delete_cookie("refresh_token")
        return response


class MemberProfileView(RetrieveUpdateDestroyAPIView):
    serializer_class = MemberSerializer
    queryset = Member.objects.all()
    permission_classes = (IsAuthenticated,)
    parser_classes = (
        FormParser,
        MultiPartParser,
        JSONParser,
    )

    def get(self, request, **kwargs):
        print(request.user.id)
        user_info = self.queryset.get(id=request.user.id)
        serializer = MemberSerializer(user_info)

        return Response(serializer.data)

    def put(self, request, **kwargs):
        instance = self.queryset.get(id=request.user.id)
        serializer = self.serializer_class(instance=instance, data=request.data)

        serializer.is_valid(raise_exception=True)

        serializer.save()
        return Response(serializer.data)

    def delete(self, request, **kwargs):
        instance = self.queryset.get(id=request.user.id)
        instance.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)
