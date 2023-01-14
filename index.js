const express = require('express');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

const url = 'mongodb+srv://kheira:06012003@testdb.nclhsev.mongodb.net/first';

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

const Course = require('./models/CourseModel');

app.use(express.json());

app.get('/api/courses', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/api/courses',async(req,res)=>{

 const newCourse = new Course(req.body);
 await newCourse.save()
    res.json(newCourse)
})
app.patch('/api/courses/:courseId',async(req,res)=>{
    const courseId = req.params.courseId
    const  course = await Course.findByIdAndUpdate(courseId,{$set:{...req.body}})

    if(!course){
        return res.send('course not found').status(404)
    }

    res.json(course)
})
app.get('/api/courses/:courseId',async(req,res)=>{
    const courseId = req.params.courseId
     const course =await  Course.findById(courseId).lean()
    if(!course){
        return res.send('course not found').status(404)
    }
    res.json(course)
})


app.delete('/api/courses/:courseId',(req, res) => {
    const courseId = req.params.courseId
     courses = courses.filter((course)=>course.id !== courseId)
res.json('course deleted successfully')

})

app.listen(5000,()=>{
    console.log('listening on port 5000')
})