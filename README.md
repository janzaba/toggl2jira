# Toggl2Jira [![Build Status](https://travis-ci.org/janzaba/toggl2jira.svg?branch=master)](https://travis-ci.org/janzaba/toggl2jira)

Simple tool for migrating Toggle time entries into Jira as work logs.

## Install

`npm install`

## Toggl entries format

Name entries like

`#<jira_task_id> <Eny string here like task title> : <worklog_comment>`

#### Example

`#34256 Add site header : This is my worklog comment`

## Usage

`node index.js [--group] <toggl-api-key> <jira-url> <jira-api-key> <date>`

Options
- *--group* - enable grouping entries with the same description and tags

Parameters:
- *toggl-api-key*   - API key to your Toggl account
- *jira-url*     - Jira URL
- *jira-api-key* - Credentials to JIRA in format username:password
- *date*            - date in format *mm.dd.YYYY*, filters entries to given day

## Use with bash script

``` 
cp toggl.sh.example toggl.sh
# Fill toggl.sh file with toggl and jira api keys and jira url

sh toggl.sh mm.dd.yyyy    # with specific date
sh toggl.sh               # with current date
``` 
