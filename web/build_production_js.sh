#!/usr/bin/env bash

pwd

for file in $(ls datainmotion/static/scripts)
do
	uglifyjs "datainmotion/static/scripts/${file}" \
		--compress --mangle | remove-console-logs \
		-i stdin -o "datainmotion/static/compressed/${file}"
done