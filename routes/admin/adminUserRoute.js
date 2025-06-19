const express = require("exporess")
const router = express.Router()
const { createUser, getUser, getOneUser, updateOneUser, deleteOne, deleteOneUser} = require("../../controllers/admin/userManagementController")

router.post(
    '/create',
    createUser
)
router.get(
    "/",
    getUser
)
router.put(
    "/:id",
    updateOneUser
)
router.delete(
    "/:id",
    deleteOneUser
)