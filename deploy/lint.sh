#!/usr/bin/bash

# Lint the Web
pycodestyle --ignore=E731,E402 ./web 

# Lint the API
pycodestyle --ignore=E731,E402 ./api 
pycodestyle --ignore=E731,E402 ./models  