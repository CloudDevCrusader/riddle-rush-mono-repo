#!/bin/bash
# Usage: ./assume-aws-role.sh arn:aws:iam::111122223333:role/riddlerush-deployer deploy-session


# Usage: ./assume-aws-role.sh <role-arn> <session-name>

if [ -z "$1" ]; then
    echo "Usage: ./assume-aws-role.sh <role-arn> <session-name>"
    exit 1
fi

:role/PROJECT_NAME-developer-role --role-session-name developer-session

# Admin
aws sts assume-role --role-arn arn:aws:iam::720377205549:role/PROJECT_NAME-admin-role --role-session-name admin-session