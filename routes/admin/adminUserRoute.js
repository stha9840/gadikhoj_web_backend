const express = require("express")
const router = express.Router()
const { createUser, getUsers, updateOneUser, deleteOneUser} = require("../../controllers/admin/userManagementController")

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
router.delete(
    "/:id",
    deleteOneUser
)

module.exports = router