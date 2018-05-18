const Model = require('../models/index')
const { Appointment, Slot } = Model

const appointmentController = {
  all(req, res) {
    Appointment.find({}).exec((err, appointments) => res.json(appointments))
  },

  create (req, res) {
    console.log('create request made', req.body)
    const requestBody = req.body

    const newSlot = new Slot({
      slot_time: requestBody.slot_time,
      slot_date: requestBody.slot_date,
      created_at: Date.now()
    })
    newSlot.save()

    const newAppointment = new Appointment({
      name: requestBody.name,
      email: requestBody.email,
      phone: requestBody.phone,
      slots: newSlot._id
    })
    newAppointment.save((err, saved) => {
      Appointment.find({_id: saved._id})
        .populate('slots')
        .exec((err, appointment) => res.json(appointment))
    })

  }
}

module.exports = appointmentController