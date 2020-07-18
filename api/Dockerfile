# pull official base image
FROM ubuntu:bionic
# FROM python:3.8.1-slim-buster

# set work directory
WORKDIR /usr/src/app

# set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# install system dependencies
RUN apt-get update && apt-get install -y netcat apt-utils
RUN apt-get install -y wget emacs
# RUN apt-get install -y firefox
RUN apt-get update && apt-get install -y \
    software-properties-common \
    unzip \
    curl \
    xvfb x11vnc ffmpeg
# RUN apt-get update && apt-get install -y \
#     python3 \
#     python3-setuptools \
#     python3-pip
RUN apt-get update && apt-get install -y \
    python3 python3-pip python3-setuptools\
    fonts-liberation libappindicator3-1 libasound2 libatk-bridge2.0-0 \
    libnspr4 libnss3 lsb-release xdg-utils libxss1 libdbus-glib-1-2 \
    curl unzip wget \
    xvfb
# Installing chrome
RUN apt-get install -y xdg-utils libxss1 libnss3 libnspr4 libgbm1 libappindicator3-1 fonts-liberation
RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
RUN dpkg -i google-chrome-stable_current_amd64.deb


# install dependencies
RUN pip3 install --upgrade pip
COPY ./api/requirements.txt /usr/src/app/requirements.txt
# Download geckodrivers
RUN GECKODRIVER_VERSION=`curl https://github.com/mozilla/geckodriver/releases/latest | grep -Po 'v[0-9]+.[0-9]+.[0-9]+'` && \
    wget https://github.com/mozilla/geckodriver/releases/download/$GECKODRIVER_VERSION/geckodriver-$GECKODRIVER_VERSION-linux64.tar.gz && \
    tar -zxf geckodriver-$GECKODRIVER_VERSION-linux64.tar.gz -C /usr/bin/ && \
    chmod +x /usr/bin/geckodriver && \
    rm geckodriver-$GECKODRIVER_VERSION-linux64.tar.gz
RUN FIREFOX_SETUP=firefox-setup.tar.bz2 && \
    apt-get purge -y firefox && \
    wget -O $FIREFOX_SETUP "https://download.mozilla.org/?product=firefox-latest&os=linux64" && \
    tar xjf $FIREFOX_SETUP -C /opt/ && \
    ln -s /opt/firefox/firefox /usr/bin/firefox && \
    rm $FIREFOX_SETUP
# RUN wget http://launchpadlibrarian.net/486693338/firefox-geckodriver_78.0.1+build1-0ubuntu0.18.04.1_amd64.deb
# RUN dpkg -i firefox-geckodriver_78.0.1+build1-0ubuntu0.18.04.1_amd64.deb
# RUN wget https://github.com/mozilla/geckodriver/releases/download/v0.26.0/geckodriver-v0.26.0-linux64.tar.gz
# RUN tar -xzf geckodriver-v0.26.0-linux64.tar.gz -C /usr/src/app/
# Download Chrome drivers
# for Chrome 84
# RUN wget https://chromedriver.storage.googleapis.com/84.0.4147.30/chromedriver_linux64.zip
# for Chrome 83
RUN wget https://chromedriver.storage.googleapis.com/83.0.4103.39/chromedriver_linux64.zip
RUN unzip chromedriver_linux64.zip -d /usr/src/app/
# RUN chmod 755 /usr/local/bin/geckodriver
RUN pip install -r requirements.txt

# Set display port and dbus env to avoid hanging
ENV DISPLAY=:99
ENV DBUS_SESSION_BUS_ADDRESS=/dev/null

# copy project
COPY . /usr/src/app/

# run entrypoint.sh
ENTRYPOINT ["/usr/src/app/api/entrypoint.sh"]