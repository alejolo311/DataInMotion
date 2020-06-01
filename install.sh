#!/usr/bin/env bash

# sudo pip3 install psycopg2
sudo apt-get install postgresql
sudo apt-get install libpq-dev python3-dev
sudo pip3 install psycopg2==2.8.4

# Install SQLAlchemy
sudo pip3 install SQLAlchemy==1.2.5

# Install flask and other modules neede for the API
sudo pip3 install flask
sudo pip3 install requests
sudo pip3 install flask_cors
sudo pip3 install flasgger
sudo pip3 install pathlib2