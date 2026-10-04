#!/bin/sh
set -e

mkdir -p /etc/seaweedfs
cat > /etc/seaweedfs/s3.json <<JSON
{"identities":[{"name":"amicats","credentials":[{"accessKey":"$MINIO_ACCESS_KEY","secretKey":"$MINIO_SECRET_KEY"}],"actions":["Admin","Read","Write"]}]}
JSON

exec /usr/bin/weed server -dir=/data -s3 -s3.port=9000 -s3.config=/etc/seaweedfs/s3.json -ip=0.0.0.0
