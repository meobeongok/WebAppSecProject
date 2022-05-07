from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from rest_framework_simplejwt.exceptions import InvalidToken
from rest_framework_simplejwt.serializers import TokenRefreshSerializer

from .models import Member


class MemberSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True, validators=[UniqueValidator(queryset=Member.objects.all())]
    )

    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )

    class Meta:
        model = Member
        fields = (
            "id",
            "code",
            "email",
            "name",
            "password",
            "image",
            "gender",
            "is_lecturer",
        )

        read_only_fields = ("id", "is_lecturer")

        extra_kwargs = {"password": {"write_only": True, "required": False}}

    def create(self, validated_data):
        password = validated_data.pop("password")

        user = Member(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        instance.code = validated_data.get("code", instance.code)
        instance.email = validated_data.get("email", instance.email)
        instance.name = validated_data.get("name", instance.name)
        instance.image = validated_data.get("image", instance.image)
        instance.gender = validated_data.get("gender", instance.gender)

        instance.set_password(validated_data.get("password", instance.password))
        instance.save()
        return instance


class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True, validators=[UniqueValidator(queryset=Member.objects.all())]
    )

    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )

    confirm_password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )

    class Meta:
        model = Member

        fields = (
            "id",
            "code",
            "email",
            "name",
            "password",
            "confirm_password",
            "image",
            "gender",
            "is_lecturer",
        )

        read_only_fields = ("id", "is_lecturer")

        extra_kwargs = {"password": {"write_only": True, "required": False}}

    def create(self, validated_data):
        password = validated_data.pop("password")

        user = Member(**validated_data)
        user.set_password(password)
        user.save()
        return user

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError(
                {"password": "Password fields didn't match."}
            )

        attrs.pop("confirm_password")

        return attrs


class CookieTokenRefreshSerializer(TokenRefreshSerializer):
    refresh = None

    def validate(self, attrs):
        attrs["refresh"] = self.context["request"].COOKIES.get(
            "refresh_token",
        )
        if attrs["refresh"]:
            return super().validate(attrs)
        else:
            raise InvalidToken("No valid token found in cookie 'refresh_token'")
