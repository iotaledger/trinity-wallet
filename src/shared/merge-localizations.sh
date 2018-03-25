#!/usr/bin/env bash
# write your script here
git fetch
git checkout l10n_develop
git pull
git diff --quiet develop l10n_develop

if [ $? -eq 0 ] ; then
    echo 'Nothing to merge'
else
    git merge develop
    git add .
    git commit -m "Merge branch develop into l10n_develop (automated merge by Bitrise)" --no-verify && git push

    git checkout develop
    git merge l10n_develop
    git add .
    git diff --quiet HEAD

    if [ $? -eq 0 ] ; then
        echo 'Nothing to merge'
    else
        git commit -m "Merge branch l10n_develop into develop (automated merge by Bitrise)" --no-verify && git push
    fi

fi


# or run a script from your repository, like:
# bash ./path/to/script.sh
# not just bash, e.g.:
# ruby ./path/to/script.rb
