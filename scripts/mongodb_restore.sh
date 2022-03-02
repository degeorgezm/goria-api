#!/bin/bash

#Variables
BUCKET="s3://as3ics-mongodb-backup/mongodb-backups/"


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

echo "${green}Mongo Restore v1.0${reset}"

# You can list all the objects in the bucket with aws s3 ls $BUCKET --recursive:
# They're sorted alphabetically by key, but that first column is the last modified time. A quick sort will reorder them by date:
# tail -1 selects the last row, and awk '{print $4}' extracts the fourth column (the name of the object).
KEY=`s3cmd -c /home/ubuntu/.s3cfg ls $BUCKET | tail -1 | awk '{print $4}'`

echo "${green}Check if Backup Directory exists...${reset}"
if [ ! -d ~/db_backup ]; then
  echo "${green}Doesn't exist...create it${reset}"
  mkdir -p ~/db_backup;
fi

#Get file from bucket
echo "${green}Most Recent backup is ${KEY} ... get it${reset}"
s3cmd -c /home/ubuntu/.s3cfg get $KEY ~/db_backup
echo "${green}got it...${reset}"

#Unpack file
cd ~/db_backup
echo "${green}unpack it...${reset}"
tar -xf ~/db_backup/$(ls -tr ~/db_backup |tail -n 1) --strip-components=1
echo "${green}delete tar...${reset}"
rm ~/db_backup/$(ls -tr ~/db_backup |tail -n 1)

echo "${green}drop current database...${reset}"
mongo market-api --eval "db.dropDatabase()"
echo "${green}dropped...${reset}"
echo "${green}restore this new database...${reset}"
mongorestore ~/db_backup

echo "${green}delete the backup..${reset}"
rm -r ~/db_backup
echo "${green}done..${reset}"
