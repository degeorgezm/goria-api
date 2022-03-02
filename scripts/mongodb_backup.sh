#!/bin/bash
 
# variables
TIMESTAMP=`date +%F-%H%M`
S3_BUCKET_NAME="as3ics-mongodb-backup"
S3_BUCKET_PATH="mongodb-backups"

# Set Colors
green=`tput setaf 2`
reset=`tput sgr0`

# Check if Figlet is installed (For Cool ASCII Headers)
if hash figlet 2>/dev/null; then
    echo "${green}Figlet is installed!${reset}"
    else
        echo "${green}Installing Figlet...${reset}"
        sudo apt install figlet
fi

echo "${green}Mongo Backup v1.0${reset}"

#Force file synchronization and lock writes
echo "${green}Force file synchronization and lock writes${reset}" 
mongo admin --eval "printjson(db.fsyncLock())"
wait

echo "${green}Backup up database...${reset}" 
mongodump --db market-api

# Add timestamp to backup and archive
echo "${green}Create tar file...${reset}"
tar cf mongodb-$HOSTNAME-$TIMESTAMP.tar dump
 
# Upload to S3
if ! command -v s3cmd &> /dev/null
then
	echo "${green}Installing s3cmd...${reset}"
	apt-get install s3cmd
else
	echo "${green}s3cmd is installed!${reset}"
fi

echo "${green}Upload to S3...${reset}"
s3cmd -c /home/ubuntu/.s3cfg put mongodb-$HOSTNAME-$TIMESTAMP.tar s3://$S3_BUCKET_NAME/$S3_BUCKET_PATH/mongodb-$HOSTNAME-$TIMESTAMP.tar
 
#Unlock database writes
echo "${green}Unlock database writes...${reset}"
mongo admin --eval "printjson(db.fsyncUnlock())"
#Delete local files
echo "${green}Delete the local files...${reset}"
rm -rf mongodb-*
rm -r dump
echo "${green}Done!${reset}"
