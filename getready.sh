#!/bin/bash

node ace migration:rollback
node ace migration:run;
node ace db:seed

mysql -ukamus -pBaat3saam1_ -e 'alter table lucid.skus add fulltext idx_fulltext(name, description) with parser ngram'
