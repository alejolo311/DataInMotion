#!/usr/bin/bash

cd /repos/DataInMotion/
sudo docker-compose down -v
git pull origin master
sudo docker-compose -f docker-compose.prod.yml up --build -d
