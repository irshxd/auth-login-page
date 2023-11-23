import express from "express";
import path from "path";
import mongoose,  {Mongoose}  from "mongoose";
import cookieParser from "cookie-parser";
import  Jwt  from "jsonwebtoken";

const app = express();
const port = 3000;

mongoose.connect("mongodb://localhost:27017", {
  dbName: "someDb",
}).then(() => {
  console.log("Database connected");
}).catch((e) => {
  console.log(e);
});
const mSchema = new mongoose.Schema({
  name: String,
  email: String,
  comment: String,
  password: String,
});

const Mmessege = mongoose.model("someCollection", mSchema);

// Middleware declarations
app.use(express.static(path.join(path.resolve(), "public")));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.get("/", async (req, res) => {
  const token = req.cookies.token;
  if (token) {
    try {
      const decodedToken = Jwt.verify(token, "somesecretidk");
      // Use Mmessege model to find the user based on the decoded token
      const foundUser = await Mmessege.findById(decodedToken._id);
      
      if (foundUser) {
        // Attach the user to the request object
        req.newUser = foundUser;
        console.log(req.newUser);
        res.sendFile(path.join(path.resolve(), "logout.html"));
        
      } else {
        res.sendFile(path.join(path.resolve(), "login.html"));
      }
    } catch (error) {
      console.error('Error decoding token:', error);
      res.sendFile(path.join(path.resolve(), "login.html"));
    }
  } else {
    res.sendFile(path.join(path.resolve(), "login.html"));
  }
});
// start

  app.post('/login', async (req, res) => {
    try {
      // Create a new user
      const newUser = await Mmessege.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
      });
  
      // Create a JWT token for the newly created user
      const token = Jwt.sign({ _id: newUser._id }, 'somesecretidk');
  
      // Set the token as a cookie in the response
      res.cookie('token', token, {
        httpOnly: true,
        expires: new Date(Date.now() + 60 * 1000),
      });
  
      console.log(token);
  
      // Redirect to the home page or any other page as needed
      res.redirect('/');
    } catch (error) {
      // Handle errors, e.g., if user creation fails
      console.error('Error creating user:', error);
      res.status(500).send('Internal Server Error');
    }
  });
  // css
  // app.get('/styles.css', (req, res) => {
  //   res.setHeader('Content-Type', 'text/css');
  //   // Send the contents of your CSS file
  // });
  // //js 
  // app.get('/script.js', (req, res) => {
  //   res.setHeader('Content-Type', 'application/javascript');
  //   // Send the contents of your JavaScript file
  // });
   

  // logout btn
  app.get("/logout", (req, res) => {
    res.cookie("token", null,{
      httpOnly:true, 
      expires:new Date(Date.now()),
  });
   res.redirect("/");
}); 

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

