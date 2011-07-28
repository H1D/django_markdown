from datetime import datetime
from annoying.decorators import ajax_request
import os

from django.http import HttpResponse
from django.views.generic.simple import direct_to_template
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings


def preview(request):
    return direct_to_template(
            request, 'django_markdown/preview.html',
            content=request.REQUEST.get('data', 'No content posted'))

def get_available_name(name):
    """
    Returns a filename that's free on the target storage system, and
    available for new content to be written to.
    """
    dir_name, file_name = os.path.split(name)
    file_root, file_ext = os.path.splitext(file_name)
    # If the filename already exists, keep adding an underscore (before the
    # file extension, if one exists) to the filename until the generated
    # filename doesn't exist.
    while os.path.exists(name):
        file_root += '_'
        # file_ext includes the dot.
        name = os.path.join(dir_name, file_root + file_ext)
    return name


def get_upload_filename(upload_name, user):
    # Generate date based path to put uploaded file.
    date_path = datetime.now().strftime('%Y/%m/')

    # Complete upload path (upload_path + date_path).
    upload_path = os.path.join(settings.DJANGO_MARKDOWN_UPLOAD_PATH, date_path)

    # Make sure upload_path exists.
    if not os.path.exists(upload_path):
        os.makedirs(upload_path)

    # Get available name and return.
    return get_available_name(os.path.join(upload_path, upload_name))

def get_media_url(path):
    """
    Determine system file's media URL.
    """
    upload_prefix = getattr(settings, "CKEDITOR_UPLOAD_PREFIX", None)
    if upload_prefix:
        url = upload_prefix + path.replace(settings.CKEDITOR_UPLOAD_PATH, '')
    else:
        url = settings.MEDIA_URL + path.replace(settings.MEDIA_ROOT, '')

    # Remove any double slashes.
    return url.replace('//', '/')


@csrf_exempt
@ajax_request
def upload(request):
    """
    Uploads a file and send back its URL to WYSIWYG editor
    """

    # Get the uploaded file from request.
    upload = request.FILES['inline_upload_file1']
    upload_ext = os.path.splitext(upload.name)[1]

    # Open output file in which to store upload.
    upload_filename = get_upload_filename(upload.name, request.user)
    out = open(upload_filename, 'wb+')

    # Iterate through chunks and write to destination.
    for chunk in upload.chunks():
        out.write(chunk)
    out.close()

    # Respond with Javascript sending ckeditor upload url.
    url = get_media_url(upload_filename)
    return HttpResponse('src="'+url+'"')

