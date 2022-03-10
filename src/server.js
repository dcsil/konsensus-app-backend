require('rootpath')();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Sentry = require('@sentry/node');
const Tracing = require("@sentry/tracing");
const errorHandler = require('./_middleware/error-handler');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

Sentry.init({
    dsn: "https://d9a67ee83934468ba36c008766bcfeb3@o358880.ingest.sentry.io/6146406",
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // enable Express.js middleware tracing
      new Tracing.Integrations.Express({ app }),
    ],
  
    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  });

// RequestHandler creates a separate execution context using domains, so that every
// transaction/span/breadcrumb is attached to its own Hub instance
app.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());

// api routes
app.get('/', (req, res, next) => {
    res.send({'message': 'Hello World!'});
    next();
});

app.get("/debug-sentry", function mainHandler(req, res) {
    throw new Error("My first Sentry error!");
});

app.use('/users', require('./users/users.controller'));

// The error handler must be before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());

// global error handler
app.use(errorHandler);

// start server
const port = process.env.PORT || 8080;
server = app.listen(port, () => console.log('Server listening on port ' + port));

module.exports = server;