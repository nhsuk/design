# Design

This is a repo for prototype design work.

## Getting started

First up:

- Make sure you have [Node installed](https://nodejs.org/en/)
- Make sure you have Grunt installed

Then:

- Clone this repo
- ```NPM install```
- ```grunt```

To stop it all: ```^c```

### Feedback mechanism

If you want to run ```/feedback/feedback-example``` locally, and successfully
```POST```, you'll need to set the Heroku ```API_KEY``` config on your machine (a
[good way](https://devcenter.heroku.com/articles/heroku-local#copy-heroku-config-vars-to-your-local-env-file)
is with an ```.env``` file). Run the site locally with ```heroku local``` *NOT*
the ```grunt``` command.
