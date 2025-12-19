const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['tuition', 'exam', 'laboratory', 'other'],
        required: true
    },
    semester: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['paid', 'pending', 'overdue'],
        default: 'pending'
    },
    dueDate: {
        type: Date,
        required: true
    },
    paymentDate: {
        type: Date
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'online', 'cheque'],
    },
    receiptNumber: {
        type: String
    },
    remarks: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Fee', feeSchema);