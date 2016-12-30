#!/bin/bash
dirs=( components console services )
arg=("$@")

for dir in "${dirs[@]}"; do
  echo "Running in" $dir "..."
	cd $dir
  { # try
    CI=true $arg && cd ..
  } || { # catch
    cd ..
  }
done
