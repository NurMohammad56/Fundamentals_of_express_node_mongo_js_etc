import express from express;
import {userController} from '../controllers/user.controller.js';

const router = express.Router();

router.use(authMiddlware);

router.get('/users', userController.getAllUsers);
router.post('/users', userController.createUser);

router.get('/user/:id', (req, res, next) => {
    const userId = req.params.id;

    if (!/^\d+$/.test(userId)) {
        const error = new Error("Invalid user ID");
        error.status = 400;
        return next(error);
    }

    const user = { id: parseInt(userId), name: "Sample User" };

    res.status(200).json({
        success: true,
        data: user,
    });
})

router.put('/user/:id', (req, res, next) => {
    res.json({ message: `Update user with ID ${req.params.id}` });
});

router.delete('/user/:id', (req, res, next) => {
    res.json({ message: `Delete user with ID ${req.params.id}` });
});

export default router;