require("dotenv").config(".env");
const cors = require("cors");
const express = require("express");
const app = express();
const morgan = require("morgan");
const { PORT = 3000 } = process.env;
// TODO - require express-openid-connect and destructure auth from it
const { auth, requiresAuth } = require("express-openid-connect");

const { User, Cupcake } = require("./db");

// middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* *********** YOUR CODE HERE *********** */
// follow the module instructions: destructure config environment variables from process.env
// follow the docs:
// define the config object
const config = {
	authRequired: true,
	auth0Logout: true,
	secret: process.env.AUTH0_SECRET,
	baseURL: process.env.AUTH0_BASE_URL,
	clientID: process.env.AUTH0_CLIENT_ID,
	issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
};

// attach Auth0 OIDC auth router
app.use(auth(config));

// create a GET / route handler that sends back Logged in or Logged out
app.get("/", (req, res) => {
	res.send(req.oidc.isAuthenticated() ? "Logged in" : "Logged out");
  console.log(req.oidc.user)
});

// create a GET /profile route handler that sends back the user profile
app.get("/profile", requiresAuth(), (req, res) => {
	res.send(JSON.stringify(req.oidc.user));
});

app.get("/cupcakes", async (req, res, next) => {
	try {
		const cupcakes = await Cupcake.findAll();
		res.send(cupcakes);
	} catch (error) {
		console.error(error);
		next(error);
	}
});

// error handling middleware
app.use((error, req, res, next) => {
	console.error("SERVER ERROR: ", error);
	if (res.statusCode < 400) res.status(500);
	res.send({
		error: error.message,
		name: error.name,
		message: error.message,
	});
});

app.listen(PORT, () => {
	console.log(`Cupcakes are ready at http://localhost:${PORT}`);
});
