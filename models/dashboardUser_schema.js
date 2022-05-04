const mongoose = require('mongoose');

const dashboardUserSchema = new mongoose.Schema({
    username: {
        type: String,
        require: true,
    },
    userID: {
        type: String, 
        require: true
    },
    serverID: {
        type: Boolean, 
        require: true,
        default: false
    },
});

const DashboardUserModel = mongoose.model('DashboardUser', ticketSchema,);

module.exports = DashboardUserModel; 