const User = require('../models/user');
const router = require('express').Router();
const bcrypt = require('bcrypt');

//update user
router.put('/:id', async (req, res) => {
if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
        try {
            const salt = await bcrypt.genSalt(10);
            req.body.password = await bcrypt.hash(req.body.password, salt);
        } catch (err) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id, 
            { $set: req.body }, { new: true }
        );
        res.status(200).json({ message: 'Your account has been updated', user });
    } catch (err) {
        return res.status(500).json({ error: 'Internal server error' });
    }
} else {
    return res.status(403).json('You can only update your account!');
}
});

//delete user
router.delete('/:id', async (req, res) => {
    if (req.body.userId === req.params.id || req.body.isAdmin) {
        try {
            const user = await User.findByIdAndDelete(req.params.id);
            res.status(200).json({ message: 'Your account has been deleted', user });
        } catch (err) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        return res.status(403).json('You can only delete your account!');
    }
    });

//get a user
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const { password, updatedAt, ...other } = user._doc;
        res.status(200).json({messgage: 'User found', other});
    } catch (err) {
        return res.status(500).json({ error: 'User not found' });
    }
});

//follow a user
router.put('/:id/follow', async (req, res) => {
    if (req.body.userId !== req.params.id) { // Ensures the user is not following themselves
        try {
            const user = await User.findById(req.params.id); // The user to be followed
            const currentUser = await User.findById(req.body.userId); // The user who wants to follow

            if (!user || !currentUser) {
                return res.status(404).json({ error: 'User not found' });
            }

            if (!user.followers.includes(req.body.userId)) {
                await user.updateOne({ $push: { followers: req.body.userId } });
                await currentUser.updateOne({ $push: { followings: req.params.id } });
                return res.status(200).json('You are now following this user!');
            } else {
                return res.status(403).json('You already follow this user!');
            }
        } catch (err) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        return res.status(403).json('You cannot follow yourself!');
    }
});

//unfollow a user
router.put('/:id/unfollow', async (req, res) => {
    if (req.body.userId !== req.params.id) { // Ensures the user is not following themselves
        try {
            const user = await User.findById(req.params.id); // The user to be followed
            const currentUser = await User.findById(req.body.userId); // The user who wants to follow

            if (!user || !currentUser) {
                return res.status(404).json({ error: 'User not found' });
            }

            if (user.followers.includes(req.body.userId)) {
                await user.updateOne({ $pull: { followers: req.body.userId } });
                await currentUser.updateOne({ $pull: { followings: req.params.id } });
                return res.status(200).json('You are now unfollowing this user!');
            } else {
                return res.status(403).json('You are not following this user!');
            }
        } catch (err) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        return res.status(403).json('You cannot unfollow yourself!');
    }
});
module.exports = router;