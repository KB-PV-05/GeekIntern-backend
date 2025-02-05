const express = require('express');
const router = express.Router();
const userController = require('../controllers/profileController'); 


router.put('/:userId/update',userController.updateProfile);
router.post('/:userId/upload',  userController.upload, userController.updateProfile);

module.exports = router;
