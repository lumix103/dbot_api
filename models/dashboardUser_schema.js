const mongoose = require('mongoose');

const dashboardUserSchema = new mongoose.Schema({
    username: String,
    email: String,
    id: String,
    accessToken: String
});

const DashboardUserModel = mongoose.model('DashboardUser', dashboardUserSchema,);

module.exports = DashboardUserModel; 