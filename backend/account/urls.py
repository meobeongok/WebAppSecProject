from django.urls import path
from .views import (
    RegisterView,
    MemberAPIStructure,
    CookieTokenObtainPairView,
    CookieTokenRefreshView,
    SignOutView,
    MemberProfileView,
)

urlpatterns = [
    path("", MemberAPIStructure.as_view(), name="structure"),
    path("signin/", CookieTokenObtainPairView.as_view(), name="signin"),
    path("signout/", SignOutView.as_view(), name="signout"),
    path("register/", RegisterView.as_view(), name="register"),
    path("refreshtoken/", CookieTokenRefreshView.as_view(), name="refresh_token"),
    path("profile/", MemberProfileView.as_view(), name="profile"),
]
