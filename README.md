# Konsensus App Backend

## Getting Started

A bootstrap script is found in script/bootstrap. This will install the required dependencies for this app:

`./script/bootstrap`

### Running Locally

First update your local .env file to reflect your local mysql instance and run:
```
mysql.server start
```

Once you've done this, to run the node application, run the following inside the root of the repo:
```
npm run start
```
The server should be running on port 8080.
