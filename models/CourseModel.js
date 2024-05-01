const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  student: {type: mongoose.Schema.Types.ObjectId,
    ref:"studentSchema"}
});

const passportSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  countryOfIssue: {
    type: String,
    required: true
  }
});

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'courseSchema'
  }],
  passport: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'passportSchema'
  }
});

const Course = mongoose.model('Course', courseSchema);
const Passport = mongoose.model('Passport', passportSchema);
const Student = mongoose.model('Student', studentSchema);

module.exports = { Course, Passport, Student };
