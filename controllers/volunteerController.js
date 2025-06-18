// controllers/volunteerController.js
const Volunteer = require('../models/Volunteer'); // Import your Volunteer model

// @desc    Get all volunteers
// @route   GET /api/volunteers
// @access  Public (or Private if you add authentication)
exports.getVolunteers = async (req, res) => {
  try {
    const volunteers = await Volunteer.find();
    res.json(volunteers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Get single volunteer by ID
// @route   GET /api/volunteers/:id
// @access  Public (or Private)
exports.getVolunteerById = async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id);
    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }
    res.json(volunteer);
  } catch (err) {
    console.error(err.message);
    // Check if the error is a CastError (invalid ID format)
    if (err.kind === 'ObjectId') {
        return res.status(400).json({ message: 'Invalid Volunteer ID format' });
    }
    res.status(500).send('Server Error');
  }
};


// @desc    Create a new volunteer
// @route   POST /api/volunteers
// @access  Public (or Private)
exports.createVolunteer = async (req, res) => {
  const { firstName, lastName, email } = req.body; // Add password here if needed

  try {
    const newVolunteer = new Volunteer({
      firstName,
      lastName,
      email,
      // password, // Uncomment if adding password
    });

    const savedVolunteer = await newVolunteer.save();
    res.status(201).json(savedVolunteer);
  } catch (err) {
    console.error(err.message);
    if (err.code === 11000) { // MongoDB duplicate key error (for unique fields like email)
      return res.status(400).json({ message: 'Email already registered.' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Update a volunteer
// @route   PUT /api/volunteers/:id
// @access  Public (or Private)
exports.updateVolunteer = async (req, res) => {
  const { firstName, lastName, email } = req.body;

  try {
    let volunteer = await Volunteer.findById(req.params.id);

    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }

    // Update fields
    volunteer.firstName = firstName || volunteer.firstName;
    volunteer.lastName = lastName || volunteer.lastName;
    volunteer.email = email || volunteer.email;
    // volunteer.password = password ? await bcrypt.hash(password, 10) : volunteer.password; // If updating password

    await volunteer.save(); // Save the updated volunteer

    res.json(volunteer);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
        return res.status(400).json({ message: 'Invalid Volunteer ID format' });
    }
    res.status(500).send('Server Error');
  }
};

// @desc    Delete a volunteer
// @route   DELETE /api/volunteers/:id
// @access  Public (or Private)
exports.deleteVolunteer = async (req, res) => {
  try {
    const volunteer = await Volunteer.findByIdAndDelete(req.params.id);

    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer not found' });
    }

    res.status(204).send(); // No content to send back, successful deletion
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
        return res.status(400).json({ message: 'Invalid Volunteer ID format' });
    }
    res.status(500).send('Server Error');
  }
};