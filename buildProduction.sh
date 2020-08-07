#!/bin/bash
set -e

# TODO. build backend code and upload source

npm i
# angular production build
ng build --prod

# upload front-end code
scp -r dist ubuntu@thecomplete90.com:/home/ubuntu/workspace/complete90
exit
