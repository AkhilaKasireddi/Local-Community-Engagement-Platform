const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');
const ejs = require('ejs');
const session = require('express-session');

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',  // Your MySQL username
  password: '',  // Your MySQL password
  database: 'community'
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to the database as id', db.threadId);
});

// Set the views directory
app.set('views', path.join(__dirname, 'views'));

// Route to serve the form
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

// Route to serve the event form
app.get('/events', (req, res) => {
  res.render('events');
});

app.post('/submit', (req, res) => {
    const { name, gender, email, phone, address, community, event } = req.body;
  
    const query = 'INSERT INTO events (name, gender, email, phone, address, community, event) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [name, gender, email, phone, address, community, event], (err, results) => {
      if (err) {
        console.error('Error inserting data into database:', err.stack);
        res.status(500).send('An error occurred while saving your data');
        return;
      }
  
      // Redirect based on the selected event
      if (event === 'Volunteering') {
        res.redirect('/volunteering');
      } else if (event === 'Helping the Homeless') {
        res.redirect('/helping-the-homeless');
      } else if (event === 'Recycling Program') {
        res.redirect('/recycling-program');
      } else if (event === 'Clean Up') {
        res.redirect('/clean-up');
      } else {
        res.send('Event not found');
      }
    });
  });

  // Routes for each event (you can add actual handling code for these routes)
  app.get('/volunteering', (req, res) => {
    res.render('volunteering');
  });
  
  app.get('/helping-the-homeless', (req, res) => {
    res.render('homeless');
  });
  
  app.get('/recycling-program', (req, res) => {
    res.render('recycle');
  });
  
  app.get('/clean-up', (req, res) => {
    res.render('clean');
  });
  
  app.get('/fund', (req, res) => {
    res.render('fund'); 
  });
  
  app.post('/submitfund', (req, res) => {
    const { name, community, donation, organisation } = req.body;
    const query = 'INSERT INTO donations (name, community, donation, organisation) VALUES (?, ?, ?, ?)';
    db.query(query, [name, community, donation, organisation], (err, results) => {
      if (err) {
        console.error('Error inserting data into database:', err.stack);
        res.status(500).send('An error occurred while saving your data');
        return;
      }
      res.render('thankyou');
    });
  });


  app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/admin', (req, res) => {
    const { name, password } = req.body;

    if (name === 'admin' && password === 'admin') {
        const donationsQuery = 'SELECT * FROM donations';
        const eventsQuery = 'SELECT * FROM events';

        db.query(donationsQuery, (err, donations) => {
            if (err) {
                console.error('Error fetching donations:', err.stack);
                res.status(500).send('An error occurred while fetching donations');
                return;
            }

            db.query(eventsQuery, (err, events) => {
                if (err) {
                    console.error('Error fetching events:', err.stack);
                    res.status(500).send('An error occurred while fetching events');
                    return;
                }

                res.render('admin', { donations, events });
            });
        });
    } else {
        res.status(401).send('Unauthorized: Incorrect name or password');
    }
});
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
