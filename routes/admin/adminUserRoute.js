const express = require("express")
const router = express.Router()
const { createUser, getUsers, updateOneUser, deleteOneUser, getOneUser, getUserCount} = require("../../controllers/admin/userManagementController")

router.post(
    '/create',
    createUser
)
router.get(
    "/",
    getUsers
)
router.put(
    "/:id",
    updateOneUser
)
router.get(
    "/:id",
    getOneUser
)
router.get('/count', getUserCount);

router.delete(
    "/:id",
    deleteOneUser
)

module.exports = router