/*const express = require('express');
const router = express.Router();
const User = require('../models/users');
const multer = require('multer');

//image upload
var storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null,"./uploads");
    },
    filename: function (req, file, cb){
        cb(null, file.filename+"_"+ Date.now() +"_"+file.originalname);
    },
});

var upload = multer ({
    storage: storage,
}).single("image");
 
//  insert an user into database route
router.post('/add', upload, (req, res) => {
    const user = new User({
        name : req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: req.file.filename
    });
    user.save((err) =>{
        if(err){
            res.json({message: err.message, type: 'danger'});
        }else{
            req.session.message = {
                type: 'success',
                message:'User added successfully!'
            };
            res.redirect("/");
        }
    });
});

router.get("/", (req, res) =>{
    res.render('index',{title:'Home Page'})
});

router.get('/add',(req, res) =>{
    res.render('add_users',{title: 'Add Users'});
});

module.exports = router;*/
const express = require('express');
const router = express.Router();
const User = require('../models/users');
const multer = require('multer');
const fs = require('fs').promises;

// Image upload
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    }
});

var upload = multer({
    storage: storage,
}).single("image");

// Insert a user into the database route
router.post('/add', upload, async (req, res) => {
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        image: req.file.filename
    });

    try {
        await user.save();
        req.session.message = {
            type: 'success',
            message: 'User added successfully!'
        };
        res.redirect("/");
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});

router.get("/", async (req, res) => {
    try {
        const users = await User.find().exec();
        res.render('index', {
            title: 'Home Page',
            users: users,
        });
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});

router.get('/add', (req, res) => {
    res.render('add_users', { title: 'Add Users' });
});

// Edit a user route
router.get('/edit/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id).exec();
        
        if (!user) {
            res.redirect("/");
        } else {
            res.render("edit_users", {
                title: "Edit User",
                user: user,
            });
        }
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});

// Update user route
router.post('/update/:id', upload, async (req, res) => {
    const id = req.params.id;
    let new_image = '';

    if (req.file) {
        new_image = req.file.filename;
        try {
            await fs.unlink('./uploads/' + req.body.old_image);
        } catch (err) {
            console.log(err);
        }
    } else {
        new_image = req.body.old_image;
    }

    try {
        const user = await User.findByIdAndUpdate(id, {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: new_image,
        });

        if (!user) {
            res.json({ message: 'User not found', type: 'danger' });
        } else {
            req.session.message = {
                type: 'success',
                message: 'User updated successfully!',
            };
            res.redirect('/');
        }
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});

// Delete user route
router.get('/delete/:id', async (req , res) => {
    const id = req.params.id;
    try {
        const user = await User.findById(id).exec();
        if (user.image) {
            await fs.unlink('./uploads/' + user.image);
        }
        const result = await User.findByIdAndRemove(id).exec();
        if (result) {
            req.session.message = {
                type: 'info',
                message: "User deleted successfully!"
            };
            res.redirect("/");
        } else {
            res.json({ message: 'User not found', type: 'danger' });
        }
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});

module.exports = router;
