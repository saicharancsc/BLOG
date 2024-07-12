const mongoose = require("mongoose");
const { createHmac, randomBytes } = require('node:crypto');
const { createTokenForUser } = require("../services/authentication");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique:true,
    },
    salt : {
        type: String,
        
    },
    password: {
      type: String,
      required: true,
    },
    profileImageURL: {
        type: String,
        default: "/images/default.png"
    },
    role : {
      type:String,
      enum:["USER","ADMIN"],
      default:"USER"
    },
  },
  { timestamps: true }
);


userSchema.pre('save', function(next) {
  const user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next() ;

  // generate a salt
  const salt=randomBytes(16).toString();
  const hashedPassword= createHmac('sha256', 'salt').update(user.password).digest("hex");
  this.salt=salt;
  this.password=hashedPassword;
  next();
});
   
//mongoose virtual function
userSchema.static("matchPasswordAndGenerateToken",  async function (email,password){
  const user = await this.findOne({email});
  if(!user) throw new Error("user not found") ;

  const salt=user.salt;
  const hashedPassword=user.password;
  //by taking user provided password
  const userProvidedHash=createHmac('sha256', 'salt').update(password).digest("hex");

  if (hashedPassword!== userProvidedHash)throw new Error("incorrect password") ;

  const token=createTokenForUser(user);
  return token;
});



const User = mongoose.model("user", userSchema);

module.exports = User;