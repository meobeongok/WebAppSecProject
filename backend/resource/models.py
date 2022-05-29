import uuid
from django.db import models
from course.models import Lesson
from deadline.models import Deadline, DeadlineSubmit
# from .validators import FileExtensionValidator, FileContentTypeValidator

# Create your models here.



class File(models.Model):
    def get_upload_path(instance, filename):
        parts = filename.split("_")
        course_id = parts[0]
        file_uuid = uuid.uuid4().hex
        return f"course_{course_id}/{file_uuid}_{'_'.join(parts[1:])}"

    lesson = models.ForeignKey(
        Lesson,
        on_delete=models.CASCADE,
        related_name="file_lesson",
        null=True,
        blank=True,
    )
    deadline = models.ForeignKey(
        Deadline,
        on_delete=models.CASCADE,
        related_name="file_deadline_lesson",
        null=True,
        blank=True,
    )
    deadlineSubmit = models.ForeignKey(
        DeadlineSubmit,
        on_delete=models.CASCADE,
        related_name="file_deadlineSubmit_lesson",
        null=True,
        blank=True,
    )
    name = models.CharField(max_length=50)
    file_upload = models.FileField(
    ##    validators=[FileExtensionValidator(["txt", "pdf", "doc", "docx", "xls", "xlsx", "csv", "zip", "rar", "png", "jpg", "svg", "gif"]),
      #               FileContentTypeValidator()],
      #  upload_to=get_upload_path
    )
    in_folder = models.CharField(max_length=200, blank=True)

    def delete(self, using=None, keep_parents=False):
        self.file_upload.delete()
        super().delete()

    def __str__(self):
        if self.lesson == None:
            if self.deadline == None:
                return "%s - %s" % (self.name, self.deadlineSubmit)
            return "%s - %s" % (self.name, self.deadline)
        return "%s - %s" % (self.name, self.lesson)
