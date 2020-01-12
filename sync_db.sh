#!/bin/bash
set -e

DB_NAME=complete90
# Dump data from production and restore into local db
# This will also drop your local db
ssh -i "~/ec2-sadiq.pem" ubuntu@ec2-18-222-149-10.us-east-2.compute.amazonaws.com "mongodump -d $DB_NAME --archive=backup/tmp_dump.gz --gzip --archive" | mongorestore --drop $DB_NAME -d $DB_NAME --gzip --archive

# Set all passwords to 'password1'
mongo --eval 'db.user_profile.update({}, {$set: {password: "$2a$08$d6k/zM6nZYu0XJpRvlNnV.fkgdddaf6U2qB1wpBKjV7dwGaPSHSpa"}}, {multi: true})' $DB_NAME
exit
