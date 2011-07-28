from django.conf.urls.defaults import url, patterns

from django_markdown.views import preview,upload


urlpatterns = patterns( '',
        url('preview/', preview, name='django_markdown_preview'),
        url('upload/', upload, name='django_markdown_upload'),
    )
