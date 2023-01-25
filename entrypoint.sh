#!/bin/sh

for file in /usr/share/nginx/html/js/app.*.js; do
  if [ ! -f $file.tmpl.js ]; then
    cp $file $file.tmpl.js
  fi

  envsubst '$VUE_APP_LENTICULAR_LENS_AUTH,$VUE_APP_LENTICULAR_LENS_TITLE,$VUE_APP_LENTICULAR_LENS_SUB_TITLE,$VUE_APP_LENTICULAR_LENS_AUTH_TEXT,$VUE_APP_LENTICULAR_LENS_API' <$file.tmpl.js >$file
done

nginx -g 'daemon off;'