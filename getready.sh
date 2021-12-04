#!/bin/bash

mysql -ukamus -pBaat3saam1_ -e 'alter table lucid.sku add fulltext idx_fulltext(name, description) with parser ngram'
