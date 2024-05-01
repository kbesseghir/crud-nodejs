const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser'); // Import body-parser
var cors=require("cors");

const app = express();
const port = 3000;

var corsOptions = {
  origin: ["http://localhost:4200"],
  credentials: true
}
app.use(cors(corsOptions));


const url = 'mongodb+srv://kheira:06012003@dbweb.2oedl5u.mongodb.net/Dbweb';

mongoose.connect(url)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:');
  });

  const { Course, Passport, Student } = require('./models/CourseModel');


// Use body-parser middleware
app.use(bodyParser.json());

app.get('/api/courses', async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/api/courses', async (req, res) => {
  const newCourse = new Course(req.body);
  await newCourse.save()
  res.json(newCourse)
});
app.post('/api/students', async (req, res) => {
  const newCourse = new Student(req.body);
  await newCourse.save()
  res.json(newCourse)
});
app.post('/api/passports', async (req, res) => {
  const newCourse = new Passport(req.body);
  await newCourse.save()
  res.json(newCourse)
});

app.patch('/api/courses/:courseId', async (req, res) => {
  const courseId = req.params.courseId
  const course = await Course.findByIdAndUpdate(courseId, { $set: { ...req.body } })

  if (!course) {
    return res.send('course not found').status(404)
  }

  res.json(course)
});

app.get('/api/courses/:courseId', async (req, res) => {
  const courseId = req.params.courseId
  const course = await Course.findById(courseId).lean()
  if (!course) {
    return res.send('course not found').status(404)
  }
  res.json(course)
});

app.delete('/api/courses/:courseId', async (req, res) => {
  const courseId = req.params.courseId
  const course = await Course.findByIdAndDelete(courseId);
  if (!course) {
    return res.send('course not found').status(404)
  }
  res.json('course deleted successfully')
});

app.get('/api/students-with-passports', async (req, res) => {
  try {
    const results = await Student.aggregate([
      {
        $lookup: {
          from: "passports",           // The collection in the DB, make sure it's correctly named
          localField: "passport",      // The field in students that contains the passport ObjectId
          foreignField: "_id",         // The matching field in passports
          as: "passportDetails"        // The array to populate with the joined documents
        }
      },
      {
        $unwind: {
          path: "$passportDetails",   // Unwind the passportDetails to de-array if there's exactly 1 per student
          preserveNullAndEmptyArrays: false  // Keep students with no passports in the result
        }
      }
    ]);

    res.json(results);
  } catch (error) {
    res.status(500).send(error.toString());
  }
});
app.get('/students-in-expensive-courses', async (req, res) => {
  try {
    const results = await Student.aggregate([
      {
        $lookup: {
          from: "courses",  // Ensures the collection name matches your actual MongoDB collection for courses
          localField: "courses",
          foreignField: "_id",
          as: "enrolledCourses"
        }
      },
      {
        $unwind: {
          path: "$enrolledCourses",  // Deconstructs the enrolledCourses array
          preserveNullAndEmptyArrays: true  // Will exclude students who don't have any courses in the result
        }
      },
      {
        $match: {
          "enrolledCourses.price": { $gt: 30 }  // Filters courses with prices greater than $20
        }
      },
     
      {
        $project: {
          _id: 0,
          name: 1,
          enrolledCourses: {
            title: 1,
            price: 1
          }        }
      }
    ]).exec();

    res.json(results);
  } catch (error) {
    console.error('Failed to fetch students in expensive courses:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/students-with-details', async (req, res) => {
  try {
    const results = await Student.aggregate([
      {
        $lookup: {
          from: "passports",
          localField: "passport",
          foreignField: "_id",
          as: "passportDetails"
        }
      },
      {
        $unwind: "$passportDetails"
      },
      {
        $lookup: {
          from: "courses",
          localField: "courses",
          foreignField: "_id",
          as: "enrolledCourses"
        }
      },
      {
        $unwind: "$enrolledCourses"
      },
      {
        $match: {
          "enrolledCourses.price": { $gt: 20 }
        }
      },
      {
        $project: {
          _id: 0,
          name: 1,
          passportNumber: "$passportDetails.number",
          courseTitle: "$enrolledCourses.title",
          coursePrice: "$enrolledCourses.price"
        }
      }
    ]).exec();  // Ensure to call exec() to execute the aggregation pipeline

    res.json(results);
  } catch (error) {
    console.error("Error in fetching data", error);
    res.status(500).send("An error occurred while fetching student details.");
  }
});


app.listen(5000, () => {
  console.log('listening on port 5000')
});
