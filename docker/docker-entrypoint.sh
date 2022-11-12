#!/bin/sh

# TODO: Move migrations to before api is run
npm run migration:run;

if [ "$ENVIRONMENT" == "local" ];
then
  npm run watch:tsc;
else 
  npm run start:prod;
fi
