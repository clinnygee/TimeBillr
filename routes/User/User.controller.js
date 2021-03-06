const {
  User,
  EmailVerification,
  sequelize,
} = require("../../database/models/index");
const mailer = require("../../mailer/config");
const mailOptions = require("../../mailer/mailOptions");
const Sequelize = require("sequelize");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const e = require("express");
const { ErrorHandler } = require("../Middleware/ErrorHandler");

const saltRounds = process.env.SALTROUNDS || 10;
const secret = process.env.SECRET || "TimeBillr";

const UserController = {
  async all(req, res, next) {
    try {
      if (req.userId) {
        let user = await User.findOne({
          where: { id: req.userId },
          attributes: {
            exclude: ["password", "emailVerified"],
          },
        });
        res.status(200).json(user);
      } else {
        throw new ErrorHandler(400, "User not Found");
        res.status(400).send({ error: "User Not Found" });
      }
    } catch (error) {
      next(error);
    }
  },
  async register(req, res, next) {
    console.log("hit the register route");
    console.log(User);
    console.log(req.body);
    const { firstName, lastName, password, email } = req.body;

    try {
      let hash = await bcrypt.hash(password, saltRounds);
      console.log(hash);
      const result = await sequelize.transaction(async (t) => {
        const newUser = await User.create({
          firstName: firstName,
          lastName: lastName,
          email: email,
          password: hash,
        });
        if (!newUser) {
          console.log('some error in register')
          throw new ErrorHandler(
            400,
            "Error: A User already exists for this Email. Please Log In, or register under a different email."
          );
        }
        const verificationEmail = await EmailVerification.create({
          UserId: newUser.dataValues.id,
        });
        mailer.sendMail(
          await mailOptions.createVerificationEmailOptions(
            email,
            verificationEmail.dataValues.id
          ),
          (err, info) => {
            if (err) {
              console.log(error);
              throw new ErrorHandler(400, "Invalid email address");
              console.log(err);
            } else {
              console.log("Mail Sent: ", info.response);
            }
          }
        );
        return newUser;
      });
    } catch (error) {
      console.log(
        "--------------------------- Hit error handling block -----------------------"
      );
      console.log(error);
      next(
        new ErrorHandler(
          400,
          "An account is already linked to that email address"
        )
      );
      console.log(error);
      // res.status(400).send({error: 'An account is already linked to that email address.'});
    }
    // create a jwt from the users email, as email is unique.
    // const payload = {email};
    // const token = jwt.sign(payload, secret, {
    //     expiresIn: '24h'
    // });
    res.status(200).send({
      success:
        "Account registered, please check your email and follow the link to verify your address.",
    });
  },
  async logIn(req, res, next) {
    const { email, password } = req.body;

    try {
      let user = await User.findOne({ where: { email: email } });
      if (!user) {
        throw new ErrorHandler(401, "User does not exist, please sign up");
        res.status(401).send({ error: "User does not exist, please sign up" });
      } else {
        console.log(user.dataValues);
        if (user.dataValues.emailVerified === false) {
         
          throw new ErrorHandler(
            400,
            "You need to verify your email to sign in"
          );
          
        } else {
          console.log(password);
          console.log(user.dataValues.password);
          bcrypt.compare(password, user.dataValues.password, (err, result) => {
            try {
              if (err) {
                console.log(err);
                
                
              } else if(result) {
                const payload = { email };
  
                const token = jwt.sign(payload, secret, {
                  expiresIn: "24h",
                });
                res.status(200).cookie("jwt", token).send();
              } else {
                console.log('invalid username or pw')
                throw new ErrorHandler(400, "Invalid email or password.");
              }
            } catch (error) {
              console.log('in try catch in bcrypt.compare')
              next(error);
            }
            
          });
        }
      }
    } catch (error) {
      console.log('in try catch login')
      console.log(error);
      next(error);
      
    }
  },
  logOut(req, res, next) {
    console.log("haha");
    res.clearCookie("jwt");
    res.status(200).send("Logged out");
  },

  async checkToken(req, res, next) {
    if (req.userId) {
      let user = await User.findOne({
        where: { id: req.userId },
        attributes: {
          exclude: ["password"],
        },
      });
      console.log(user.dataValues);
      if (user.dataValues.emailVerified === false) {
        next(new ErrorHandler(400, "Need to verify email"));
        // res.status(400).send({error: 'Need to verify email'})
      } else {
        res.status(200).json(user);
      }
    } else {
      next(new ErrorHandler(400, "User not Found"));
      res.status(400).send({ error: "User Not Found" });
    }
  },

  async verifyEmail(req, res, next) {
    const { id, email } = req.body;
    try {
      const result = await sequelize.transaction(async (t) => {
        let user = await User.findOne({ where: { email: email } });
        let emailVerification = await EmailVerification.findOne({
          where: { id: id },
        });
        if (emailVerification.dataValues.UserId === user.dataValues.id) {
          user.emailVerified = true;
        } else {
          throw new ErrorHandler(401, "Email does not match verification Id");
          res
            .status(401)
            .json({ error: "Email does not match verification Id" });
        }
        user.save();
        return user;
      });
      res.status(200).send();
    } catch (error) {
      next(error);
      console.log(error);
    }
  },
};

module.exports = UserController;
