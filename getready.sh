#!/bin/bash

mysql -ukamus -pBaat3saam1_ -e 'alter table lucid.skus add fulltext idx_fulltext(name, description) with parser ngram'
