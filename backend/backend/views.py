from django.conf import settings
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from resource.models import File
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

class secureMediaView(APIView):
    permission_classes = (IsAuthenticated,)
    def get(self, request, course_pk, file_uuid, model_name, file_name):
        if not Course.objects.filter(id=course_pk,course_member=request.user.id).exists():
            return Response({"error": "You are not in this course"}, status=403)
        
        queryset = File.objects.filter(file_upload="course_{}/{}_{}_{}".format(course_pk,file_uuid,model_name,file_name))
        if queryset.exists():
            file = queryset[0]
            response = Response()
            response["Content-Disposition"] = "attachment; filename={0}".format(file_name)
            if settings.DEBUG:
                response.content = file.file_upload.read()
                return response
            response['X-Accel-Redirect'] = "/sercure/media/course_{}/{}_{}_{}".format(course_pk,file_uuid,model_name,file_name)
            return response
        return Response({"error":"File not exist"},status=404)