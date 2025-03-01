const router = require('express').Router();
const Post = require('../models/Post');
const User = require('../models/user');

//create a post
router.post('/', async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();
    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json(err);
  }
});

//update a post
router.put('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.userId === req.body.userId) {
      await post.updateOne({ $set: req.body });
      res.status(200).json('the post has been updated');
    } else {
      res.status(403).json('you can update only your post');
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//delete a post
router.delete("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post.userId === req.body.userId) {
            await post.deleteOne();
            return res.status(200).json("The post has been deleted");
        } else {
            return res.status(403).json("You can only delete your posts");
        }
    } catch (err) {
        return res.status(404).json("post not found");
    }
});


//like / dislike a post
router.put('/:id/like', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).json('The post has been liked');
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json('The post has been disliked');
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//get a post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get timeline posts
router.get("/timeline/all", async (req, res) => {
    try {
    const currentUser = await User.findById(req.query.userId); // The user who wants to see the timeline
    const userPosts = await Post.find({ userId: currentUser._id });
    const friendPosts = await Promise.all(
    currentUser.followings.map((friendId) => {
    return Post.find({ userId: friendId });
  })
);
    res.json(userPosts.concat(...friendPosts))
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;