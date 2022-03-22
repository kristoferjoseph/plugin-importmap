@app
prog-bundle

@aws
# profile kj
region us-west-1

@http
get /

@plugins
importmap
  src ../../

@importmap
hello src/shared/hello.mjs
