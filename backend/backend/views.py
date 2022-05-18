from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from resource.models import File
from account.models import Member
from course.models import Course


class APIStructureView(APIView):
    def get(self, request):
        return Response(
            {
                "account/": "account API structure",
                "admin/": "admin page",
                "courseAPI/": "course API structure",
                "deadlineAPI/": "deadline API strcuture",
            }
        )


class secureResourceMediaView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(
        self, request, course_pk=None, file_uuid=None, model_name=None, file_name=None
    ):
        if not Course.objects.filter(
            id=course_pk, course_member=request.user.id
        ).exists():
            return Response({"error": "You are not in this course"}, status=403)

        queryset = File.objects.filter(
            file_upload="course_{}/{}_{}_{}".format(
                course_pk, file_uuid, model_name, file_name
            )
        )
        if queryset.exists():
            file = queryset[0]
            response = Response()
            response["Content-Disposition"] = "attachment; filename={}".format(
                file_name
            )
            response["X-Accel-Redirect"] = "/smedia/course_{}/{}_{}_{}".format(
                course_pk, file_uuid, model_name, file_name
            )
            return response
        return Response({"error": "File not exist"}, status=404)


class secureProfileImageMediaView(APIView):

    def get(self, request, image_name=None):
        queryset = Member.objects.filter(image="img/{}".format(image_name))
        if queryset.exists():
            file = queryset[0]
            response = Response()
            response["Content-Disposition"] = "attachment; filename={}".format(
                image_name
            )
            response["X-Accel-Redirect"] = "/smedia/img/{}".format(image_name)
            return response
        return Response({"error": "File not exist"}, status=404)
