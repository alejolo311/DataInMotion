# pull official base image
FROM python:3.8.1-slim-buster

# set work directory
WORKDIR /usr/src/app

# set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# install system dependencies
RUN apt-get update && apt-get install -y netcat
# RUN apt-get install -y nodejs npm
# RUN npm install -g npm@latest

# copy project
COPY . /usr/src/app/

# RUN npm install -g remove-console-logs uglify-es
# RUN node compress.js

# install dependencies
RUN pip install --upgrade pip
COPY ./requirements.txt /usr/src/app/requirements.txt
RUN pip install -r requirements.txt

# run entrypoint.sh
ENTRYPOINT ["/usr/src/app/entrypoint.sh"]