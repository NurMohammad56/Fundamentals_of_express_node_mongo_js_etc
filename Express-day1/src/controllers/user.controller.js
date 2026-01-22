export const userController = {
  getAllUsers: async (req, res, next) => {
    try {
      const users = [
        { id: 1, name: "Nur" },
        { id: 2, name: "Ain" },
      ];

      res.status(200).json({
        success: true,
        count: users.length,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  },

  createUser: async (req, res, next) => {
    try {
      const { name, email } = req.body;

      if (!name || !email) {
        const error = new Error("Name and email are required");
        error.status = 400;
        throw error;
      }

      const newUser = { id: Date.now(), name, email };

      res.status(201).location(`/api/users/${newUser.id}`).json({
        success: true,
        data: newUser,
      });
    } catch (error) {
      next(error);
    }
  },
};
