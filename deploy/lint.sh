#!/usr/bin/sh

# Lint the Web
pycodestyle ./web

# Lint the API
pycodestyle ./api
pycodestyle ./models