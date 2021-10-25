module.exports = function(app, passport, db) {

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
        db.collection('todo').find().toArray((err, result) => {
          if (err) return console.log(err)
          res.render('profile.ejs', { todos: result });
          })
        })

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

// message board routes ===============================================================

app.post('/todo', (req, res) => {
	db.collection('todo').insertOne(
		{
			todo: req.body.todo,
			status: 'incomplete',
		},
		(err, result) => {
			if (err) return console.log(err);
			console.log('saved to database');
			res.redirect('/profile');
		}
	);
});


app.put('/upVote', (req, res) => {
	console.log(req.body.todo);
	db.collection('todo').findOneAndUpdate(
		{ todo: req.body.todo },
		{
			$set: {
				status: 'complete',
			},
		},
		{
			sort: { _id: -1 },
		},
		(err, result) => {
			if (err) return res.send(err);

			res.send(result);
		}
	);
});

app.put('/downVote', (req, res) => {
	req.body.todo;
	db.collection('todo').findOneAndUpdate(
		{ todo: req.body.todo, status: req.body.status },
		{
			$set: {
				status: 'incomplete',
			},
		},
		{
			sort: { _id: -1 },
		},
		(err, result) => {
			if (err) return res.send(err);
			res.send(result);
		}
	);
});

app.delete('/delete', (req, res) => {
	db.collection('todo').findOneAndDelete(
		{ todo: req.body.todo },
		(err, result) => {
			if (err) return res.send(500, err);
			res.send('Message deleted!');
		}
	);
});

app.delete('/deleteAll', (req, res) => {
	db.collection('todo').deleteMany({}, (err, result) => {
		if (err) return res.send(500, err);
		res.send('Message deleted!');
	});
});

app.delete('/deleteCompleted', (req, res) => {
	db.collection('todo').deleteMany({ status: 'complete' }, (err, result) => {
		if (err) return res.send(500, err);
		res.send('Message deleted!');
	});
});

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
