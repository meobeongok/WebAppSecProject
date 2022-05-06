import uuid

from django.contrib.auth.models import PermissionsMixin
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.db import models


class MemberManager(BaseUserManager):
    def create_user(self, code, email, name, password):
        if not code:
            raise ValueError("Users must have a code")

        if not email:
            raise ValueError("Users must have an email address")

        if not name:
            raise ValueError("Users must have a code")

        if not password:
            raise ValueError("User must have a password")

        email = self.normalize_email(email)
        user = self.model(code=code, email=email, name=name)
        user.set_password(password)

        user.save()

        return user

    def create_superuser(self, code, email, name, password):
        user = self.create_user(code, email, name, password)

        user.is_superuser = True
        user.is_staff = True
        user.active = True

        user.save(using=self._db)

        return user


class Member(AbstractBaseUser, PermissionsMixin):
    def get_upload_path(instance, filename):
        parts = filename.split(".")
        image_id = uuid.uuid4().hex
        return f'img/{"".join(parts[:-1])}-{image_id}.{parts[-1]}'

    code = models.CharField(max_length=20, unique=True, blank=False, null=False)

    name = models.CharField(max_length=200, blank=False, null=False)

    gender = models.CharField(
        max_length=6,
        choices=(("male", "Male"), ("female", "Female"), ("none", "Prefer not to say")),
        default="none",
        blank=False,
        null=False,
    )

    email = models.EmailField(max_length=255, unique=True, blank=False, null=False)

    image = models.ImageField(upload_to=get_upload_path, null=True)

    is_lecturer = models.BooleanField(default=False)

    is_active = models.BooleanField(default=True)

    is_staff = models.BooleanField(default=False)

    objects = MemberManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["code", "name"]

    def __str__(self):
        return "%s - %s" % (self.name, self.code)

    def delete(self, using=None, keep_parents=False):
        self.image.storage.delete(self.image.name)
        super().delete()

    class Meta:
        ordering = ["code"]
