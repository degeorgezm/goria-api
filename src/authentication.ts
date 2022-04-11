/**
 * authentication.ts
 *
 * api.goria.com
 * by AS3ICS
 *
 * Zach DeGeorge
 * zach@as3ics.com
 *
 * Defines the Authentication Strategy for Username/Password (Local) and JWT (REST API)
 *
 * @format
 */

import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import express, { Request, Response } from "express";

import { User } from "./schemas";

import { CONFIG, JWT_AUTH_HEADER } from "./config";

export type JWT_PAYLOAD = {
  user_id: string;
  username: string;
  email: string;
  role: number;
  admin: boolean;
};

export const set_authorization_strategy = (app) => {
  // Define Passport strategy for authenticating with a username and password.
  app.use(passport.initialize());

  // The local authentication strategy authenticates users using a username and password
  // The strategy requires a verify callback, which accepts these credentials and calls done providing a user.
  // https://github.com/jaredhanson/passport-local
  passport.use(
    new LocalStrategy(async function (username, password, done) {
      try {
        const user = await User.findOne({ username: username });
        if (!user) return done("User not found", null);

        if (await !user.validPassword(password)) {
          return done("Incorrect password", null);
        } else {
          return done(null, user);
        }
      } catch (error) {
        console.error(error);
        return done(error, null);
      }
    })
  );

  const JWT_STRATEGY_CONFIG = {
    secretOrKey: CONFIG.jwt.secretOrKey,
    issuer: CONFIG.jwt.issuer,
    audience: CONFIG.jwt.audience,
    jwtFromRequest: ExtractJwt.fromHeader(JWT_AUTH_HEADER),
  };

  // This module lets you authenticate endpoints using a JSON web token.
  // It is intended to be used to secure RESTful endpoints without sessions.
  // https://github.com/themikenicholson/passport-jwt
  passport.use(
    new JwtStrategy(JWT_STRATEGY_CONFIG, async function (
      jwt_payload: JWT_PAYLOAD,
      done
    ) {
      try {
        const user = await User.findOne({ _id: jwt_payload.user_id });
        return done(null, user);
      } catch (error) {
        console.error(error);
        return done(error, null);
      }
    })
  );
};

/*

 $$$$$$\              $$\     $$\             $$$$$$$$\                                      
$$  __$$\             $$ |    $$ |            \__$$  __|                                     
$$ /  $$ |$$\   $$\ $$$$$$\   $$$$$$$\           $$ |$$\   $$\  $$$$$$\   $$$$$$\   $$$$$$$\ 
$$$$$$$$ |$$ |  $$ |\_$$  _|  $$  __$$\          $$ |$$ |  $$ |$$  __$$\ $$  __$$\ $$  _____|
$$  __$$ |$$ |  $$ |  $$ |    $$ |  $$ |         $$ |$$ |  $$ |$$ /  $$ |$$$$$$$$ |\$$$$$$\  
$$ |  $$ |$$ |  $$ |  $$ |$$\ $$ |  $$ |         $$ |$$ |  $$ |$$ |  $$ |$$   ____| \____$$\ 
$$ |  $$ |\$$$$$$  |  \$$$$  |$$ |  $$ |         $$ |\$$$$$$$ |$$$$$$$  |\$$$$$$$\ $$$$$$$  |
\__|  \__| \______/    \____/ \__|  \__|         \__| \____$$ |$$  ____/  \_______|\_______/ 
                                                     $$\   $$ |$$ |                          
                                                     \$$$$$$  |$$ |                          
                                                      \______/ \__|                          
*/

export const auth = {
  NONE: undefined,
  BASIC: undefined,
  TOKEN: undefined,
};

// No Authentication required (for endpoints that need to be accessible to guests, such as registration)
auth.NONE = function (req, res, next) {
  return next();
};

// Basic Authentication strategy is used to verify username and password for an Admin, and set the JWT Token
// which is passed to the /controllers/administrators/authenticate function
auth.BASIC = function (req, res, next) {
  passport.authenticate("local", function (err, user, info) {
    if (err) {
      console.error("Basic auth error: ", err);
      return next(err);
    }
    if (!user) {
      console.error("Basic auth failed: no user returned");
      return res.status(401).send({});
    }

    var token = user.generateToken();
    req.token = token;
    req.user = user;

    return next();
  })(req, res, next);
};

// Verify the JWT is valid and set the user role before executing the rest of the route
auth.TOKEN = function (req, res, next) {
  passport.authenticate("jwt", { session: false }, (err, user) => {
    if (err) {
      console.error("Token auth failed: ", err);
      return next(err);
    } else if (!user) {
      console.log("Token auth failed: no user returned");
      return res.status(400).send({});
    } else {
      req.user = user;
      return next();
    }
  })(req, res, next);
};

/*

$$$$$$$\            $$\                     
$$  __$$\           $$ |                    
$$ |  $$ | $$$$$$\  $$ | $$$$$$\   $$$$$$$\ 
$$$$$$$  |$$  __$$\ $$ |$$  __$$\ $$  _____|
$$  __$$< $$ /  $$ |$$ |$$$$$$$$ |\$$$$$$\  
$$ |  $$ |$$ |  $$ |$$ |$$   ____| \____$$\ 
$$ |  $$ |\$$$$$$  |$$ |\$$$$$$$\ $$$$$$$  |
\__|  \__| \______/ \__| \_______|\_______/ 

*/

export const roles = {
  NONE: undefined,
  USER: undefined,
  ADMIN: undefined,
};

// No Special Role is required - used for API calls that require no validation
roles.NONE = function (req, res, next) {
  return next();
};

// Anyone who is logged in
roles.USER = function (req, res, next) {
  if (req.user) {
    return next();
  } else {
    return res.status(401).send({});
  }
};

// Admins
roles.ADMIN = function (req, res, next) {
  if (req.user.admin()) {
    return next();
  } else {
    return res.status(401).send({});
  }
};

// Controller Functions

export const authenticate = function (req, res) {
  res.status(200).set(JWT_AUTH_HEADER, req.token).send(req.user);
};

export const verifyToken = function (req, res) {
  const user = req.user;
  if (user)
    return res.status(200).send({
      user_id: user._id,
      role: user.role,
      admin: user.admin(),
      updatedAt: user.updatedAt,
    });
  return res.status(401).send({});
};

// Routes

export const authRouter = express.Router({
  strict: true,
});

authRouter.post("/", auth.BASIC, roles.NONE, authenticate);
authRouter.get("/", auth.TOKEN, roles.USER, verifyToken);
