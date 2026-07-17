update storage.buckets
set
  public = true,
  file_size_limit = 6291456,
  allowed_mime_types = array[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/ogg',
    'video/mp4', 'video/webm',
    'application/pdf', 'application/json', 'application/zip',
    'text/plain'
  ]
where id = 'awaken-admin-assets';
