#!/bin/bash
set -e

DB_NAME=complete90
# Dump data from production and restore into local db
# This will also drop your local db
ssh ubuntu@thecomplete90.com "mongodump -d $DB_NAME --archive=backup/tmp_dump.gz --gzip --archive" | mongorestore --drop $DB_NAME -d $DB_NAME --gzip --archive

# Set all passwords to 'password1'
mongo --eval 'db.user_profile.update({}, {$set: {password: "$2a$08$d6k/zM6nZYu0XJpRvlNnV.fkgdddaf6U2qB1wpBKjV7dwGaPSHSpa"}}, {multi: true})' $DB_NAME
# unset the avatar url
mongo --eval 'db.user_profile.update({}, {$unset: {avatarURL: 1}}, {multi: true})' $DB_NAME
exit
