const express = require('express');
const ExpressBrute = require('express-brute');

const bruteforce = (namespace, freeRetries, minWait) => {
  const store = new ExpressBrute.MemoryStore();
  const bruteforce = new ExpressBrute(store, {
    freeRetries,
    minWait,
  });

  return (req, res, next) => {
    bruteforce.prevent(req, res, next, { key: `bruteforce:${namespace}:${req.ip}` });
  };
};

const app = express();
const router = express.Router();

app.use(bruteforce('global', 100, 5));

router.get('/v1/users', bruteforce('users', 50, 1), function (req, res) {
  
});

router.get('/v1/apps', async function (req, res) {
  try {
    await bruteforce('apps', 30, 2)(req, res);
  } catch (err) {
    res.status(429).send(`Too many requests for the ${err.context.brute.namespace} namespace. Please retry in ${err.context.nextValidRequest.getTime() - Date.now()} milliseconds`);
  }
});

app.use('/api', router);

// Start the server with port : 3000
app.listen(3000, () => {
  console.log('port: 3000');
});
