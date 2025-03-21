var mongoose = require("mongoose");
const Schema = mongoose.Schema;
const todoSchema = new Schema({
  
  ownerID: { type: String },
  headline: { type: String },
  description: { type: String },
  chatGPT : {type:String},
  image:{type:Buffer}
});
const Todo = mongoose.model("Todo", todoSchema);

module.exports = Todo;
