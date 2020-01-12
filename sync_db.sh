#!/bin/bash
set -e

# Dump data from production and restore into local db
# This will also drop your local db
ssh -i "~/ec2-sadiq.pem" ubuntu@ec2-18-222-149-10.us-east-2.compute.amazonaws.com "mongodump -d complete90 --archive=backup/tmp_dump.gz --gzip --archive" | mongorestore --drop complete90 -d complete90 --gzip --archive

# Set all passwords to 'password1'
mongo --eval 'db.user_profile.update({}, {$set: {password: "$2a$08$d6k/zM6nZYu0XJpRvlNnV.fkgdddaf6U2qB1wpBKjV7dwGaPSHSpa"}}, {multi: true})' complete90
exit
