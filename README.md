# Watchtowr

Watchtowr API monitoring and testing.

## Getting Started

Install nvm, clone the repo, and then...

Install and use Node version references in .nvm: `nvm install && nvm use`  
Install yarn: `brew install yarn watchman && yarn`  
Install global dependencies: `yarn global add serverless snyk`  

Some scripts assume the following in your ~/.bashrc or ~/.bash_profile:  
```
export NODE_ENV=dev

export ACME_DIR=<path_to_acme_install>
. "$ACME_DIR/acme.sh.env"
```
