#!/bin/bash
if [[ $TRAVIS_BRANCH == 'master' ]] ; then
  ssh -i key.pem root@159.65.38.228  'bash -s' < ./deploy/deploy.sh 
else
  echo "Not deploying, since this branch isn't master."
fi