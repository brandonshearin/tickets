import mongoose from "mongoose";
import { Password } from "../services/password";

// An interface that describes the properties that are required to create a new user
interface UserAttrs {
  email: string;
  password: string;
}

// An interface that describes the properties that a user MODEL has
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

// An interface that describes the properties that a user DOCUMENT has
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema({
  email: {
    // not related to type script.  this is a mongoose-related type. doesn't tell typescript anything whatsoever
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
}, {
  toJSON: { // mongoose will invoke this function to turn our document into JSON
    transform(doc, ret) {
      ret.id = ret._id
      delete ret._id
      delete ret.password // delete is a JS keyword. (not used often)
      delete ret.__v
    }
  }
});

// this is a mongoose pre-save hook. it hashes a password before saving to db
userSchema.pre("save", async function (done) {
  if (this.isModified("password")) {
    const hashed = await Password.toHash(this.get("password"));
    this.set("password", hashed);
  }
  done()
});

// to get typescript involved, write this little decorator to wrap the mongoose API
userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>("User", userSchema);

export { User };
