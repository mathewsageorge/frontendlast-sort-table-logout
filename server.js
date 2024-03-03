// server.js
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mongoose = require('mongoose');

// Connect to MongoDB Cloud
mongoose.connect('mongodb+srv://mathewsgeorge202:ansu@cluster0.ylyaonw.mongodb.net/test?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB Connection Error:', err));

// Define mongoose schema and model for attendance data
const attendanceSchema = new mongoose.Schema({
    serialNumber: String,
    logData: String,
    time: Date
}, { collection: 'records' }); // Specify the collection name with dot notation

const Attendance = mongoose.model('Attendance', attendanceSchema);

const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

const users = {
    mathews: { username: 'mathews', password: '1', students: [{ name: 'Student 1', attendance: 'Present' }, { name: 'Student 2', attendance: 'Absent' }] },
    keshav: { username: 'keshav', password: '2', students: [{ name: 'Student 1', attendance: 'Present' }, { name: 'Student 2', attendance: 'Absent' }] },
    ansu: { username: 'ansu', password: '3', students: [{ name: 'Student 1', attendance: 'Present' }, { name: 'Student 2', attendance: 'Absent' }] },
    teacher4: { username: 'neha', password: '4', students: [{ name: 'Student 1', attendance: 'Present' }, { name: 'Student 2', attendance: 'Absent' }] }
};


// Function to map serial numbers to student names
function mapSerialToStudentName(serialNumber) {
    // Implement your logic to map serial numbers to student names
    // For example, you can hardcode a mapping or fetch it from another source
    // For demonstration purposes, I'm hardcoding a simple mapping
    const serialToNameMap = {
        "05:34:6a:64:26:b0:c1": "Mathews",
        "05:39:01:60:06:b0:c1":"ANSU",
     "05:33:96:60:06:b0:c1":"KESHAV",

        // Add more mappings as needed
    };
    return serialToNameMap[serialNumber] || "Unknown"; // Return student name or "Unknown" if not found
}

app.get('/', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = users[username];
    if (user && user.password === password) {
        try {
            // Fetch attendance data from MongoDB and pass it to dashboard template
            const attendanceData = await Attendance.find({});
            console.log('Attendance Data:', attendanceData); // Log attendance data
            
            // Map attendance data to include student names
            const mappedAttendanceData = attendanceData.map(data => {
                return {
                    studentName: mapSerialToStudentName(data.serialNumber),
                    logData: data.logData,
                    time: data.time
                };
            });

            res.render('dashboard', { username: user.username, students: user.students, attendanceData: mappedAttendanceData });
        } catch (err) {
            console.error('Error retrieving attendance data:', err);
            res.render('error', { message: 'Error retrieving attendance data' });
        }
    } else {
        res.render('error', { message: 'Invalid username or password' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});