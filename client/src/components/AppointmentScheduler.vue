<template>
  <v-app light>
    <v-toolbar dark color="primary">
      <v-toolbar-side-icon></v-toolbar-side-icon>
      <v-toolbar-title class="white--text">Appointment Scheduler</v-toolbar-title>
    </v-toolbar>
    <v-content>
      <v-container grid-list-xl text-xs-center>
        <v-layout row wrap>
        <v-flex xs10 offset-xs1>
          <v-card>
            <v-stepper v-model="e6" vertical>
              <v-stepper-step step="1" v-bind:complete="e6 > 1" editable>
                Choose a day for your appointment
              </v-stepper-step>
              <v-stepper-content step="1">
                <v-flex xs11 sm5>
                  <v-dialog persistent v-model="modal" lazy full-width>
                    <v-text-field slot="activator" label="Select Date" v-model="date" prepend-icon="event" readonly></v-text-field>
                    <v-date-picker v-model="date" :allowed-dates="setAvailableDays" scrollable actions>
                      <template>
                        <v-card-actions>
                        <v-spacer></v-spacer>
                          <v-btn flat color="primary" @click.native="modal = false">Cancel</v-btn>
                          <v-btn flat color="primary"  @click.native="e6 = 2; modal = false" >OK</v-btn>
                        </v-card-actions>
                      </template>
                    </v-date-picker>
                  </v-dialog>
                </v-flex>
              </v-stepper-content>
              <v-stepper-step step="2" editable v-bind:complete="e6 > 2" >
                Choose an available time for your appointment
              </v-stepper-step>
              <v-stepper-content step="2">
                <v-flex xs11 sm5>
                  <v-select
                    v-bind:items="items"
                    v-model="e1"
                    label="Select"
                    item-value="text"
                    single-line
                    bottom>
                  </v-select>
                </v-flex>
                <v-radio-group v-model="selected"  v-show="ok"  v-on:change="formatDate">
                  <v-radio v-for = "slot in availableAMs" :key= "slot.id" :label="`${slot.time}`" @click.native="e6 = slot.click_state" :value="`${slot.time}`" :disabled="slot.state"></v-radio>
                </v-radio-group>
                <v-radio-group  v-model="selected" v-show="collapsed" v-on:change="formatDate">
                  <v-radio v-for = "slot in availablePMs" :key= "slot.id" :label="`${slot.time}`" @click.native="e6 = slot.click_state" :value="`${slot.time}`" :disabled="slot.state"></v-radio>
                </v-radio-group>
              </v-stepper-content>
              <v-stepper-step step="3" editable v-bind:complete="e6 > 3">
                Share your contact information with us and we 'll send you a reminder
              </v-stepper-step>
              <v-stepper-content step="3">
                <form  ref="form">
                  <v-text-field name="firstName" label="First Name" v-model="firstName" v-validate ="'required|alpha'" />
                  <span v-show="errors.has('firstName')" class="error_msg">{{ errors.first('firstName') }}</span>
                  <v-text-field name="lastName" label="Last Name"  v-model="lastName" v-validate ="'required|alpha'"/>
                  <span v-show="errors.has('lastName')" class="error_msg">{{ errors.first('lastName') }}</span>
                  <v-text-field name="email" label="Email" v-model="email" v-validate="'required|email'"></v-text-field>
                  <span v-show="errors.has('email')" class="error_msg">{{ errors.first('email') }}</span>
                  <v-text-field name="phone" label="Phone" v-model="phone" v-validate="'required|numeric'" />
                  <span v-show="errors.has('phone')" class="error_msg">{{ errors.first('phone') }}</span>                  <v-spacer></v-spacer>
                  <v-btn block color="primary" @click ="submit" @click.native="e6 = 0">SCHEDULE</v-btn>
                </form>
                <v-dialog v-model = "dialog" persistent max-width ="750">
                <v-card>
                  <div v-for="user in userArray" v-bind:key="user.id">
                    <v-spacer></v-spacer>
                    <v-flex xs12 sm6 md4>
                      <v-spacer></v-spacer>
                      <span>Name: {{user.name}}</span>
                    </v-flex>
                    <v-flex xs12 sm6 md4>
                      <v-spacer></v-spacer>
                      <span>Email: {{user.email}}</span>
                    </v-flex>
                    <v-flex xs12 sm6 md4>
                      <v-spacer></v-spacer>
                      <span>Phone: {{user.phone}}</span>
                    </v-flex>
                    <v-flex xs12 sm6 md4>
                      <v-spacer></v-spacer>
                      <span>Appointment: {{user.appointment}}</span>
                    </v-flex>
                  </div>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" flat @click.native="dialog = false">Confirm</v-btn>
                  </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-stepper-content>
            </v-stepper>
          </v-card>
        </v-flex>
      </v-layout>
    </v-container>
  </v-content>
  <v-footer app></v-footer>
  </v-app>
</template>

<script>
import moment from 'moment'
import axios from 'axios'

export default {
  name: 'AppointmentScheduler',
  data () {
    return {
      date: null,
      time: null,
      modal: null,
      modal2: null,
      dialog: null,
      loading: false,
      e6: null,
      e1: null,
      allowedDates: null,
      select: null,
      selectedSlots: [],
      selected: null,
      ok: null,
      collapsed: null,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      appointment: '',
      userArray: {},
      availableAMs: [
        { id: 1, time: '9:00am - 10:00am', click_state: 3, state: false },
        { id: 2, time: '10:00am - 11:00am', click_state: 3, state: false },
        { id: 3, time: '11:00am - 12:00pm', click_state: 3, state: false }
      ],
      availablePMs: [
        { id: 4, time: '12:00pm - 1:00pm', click_state: 3, state: false },
        { id: 5, time: '1:00pm - 2:00pm', click_state: 3, state: false },
        { id: 6, time: '2:00pm - 3:00pm', click_state: 3, state: false },
        { id: 7, time: '3:00pm - 4:00pm', click_state: 3, state: false },
        { id: 8, time: '4:00pm - 5:00pm', click_state: 3, state: false }
      ],
      items: [
        { text: 'AM' },
        { text: 'PM' }
      ],
      availableDays: {
        min: null,
        max: null
      }
    }
  },
  created () {
    this.$store.dispatch('allSlots')
  },
  mounted () {
    this.setAvailableDays()
  },
  beforeUpdate () {
    this.setTimeFormat()
  },
  methods: {
    formatDate () {
      console.log('date for appointment: ', moment(this.date, 'YYYY/MM/DD').format('DD/MM/YYYY'))
      console.log('Time for appointment: ', this.selected)

      const day = moment(this.date, 'YYYY/MM/DD').format('dddd')
      const dayNumber = moment(this.date, 'YYYY/MM/DD').format('Do')
      const month = moment(this.date, 'YYYY/MM/DD').format('MMMM')
      const year = moment(this.date, 'YYYY/MM/DD').format('YYYY')
      this.appointment = `${day}   ${dayNumber}   ${month}   ${year}   between   ${this.selected}`
    },
    submit () {
      this.$validator.validateAll().then((result) => {
        if (result) {
          this.addToAPI()
          return
        }
        alert('Invalid form data')
      })
    },
    setTimeFormat () {
      if (this.e1 === 'AM') {
        this.ok = true
        this.collapsed = null
        this.getSlots()
        console.log('value', this.e1)
        this.e1 = null
      } else if (this.e1 === 'PM') {
        this.collapsed = true
        this.ok = null
        this.getSlots()
        console.log('value', this.e1)
        this.e1 = null
      }
    },
    setAvailableDays () {
      const nowDate = new Date()
      let todayDate = new Date()
      const endOfYear = new Date(todayDate.getFullYear(), 12, 31)
      const singleDay = 1000 * 60 * 60 * 24
      const remainingDays = Math.ceil((endOfYear.getTime() - todayDate.getTime()) / singleDay)
      todayDate.setDate(nowDate.getDate() + remainingDays)
      this.availableDays.min = nowDate
      this.availableDays.max = todayDate
      return this.availableDays
    },
    addToAPI () {
      this.loading = true
      const newAppointment = {
        name: `${this.firstName} ${this.lastName}`,
        email: this.email,
        phone: this.phone,
        appointment: this.appointment,
        slot_time: this.selected,
        slot_date: this.date
      }
      axios.post('http://localhost:3000/api/appointmentCreate', newAppointment)
        .then(response => {
          console.log(response)
          this.loading = false
          this.confirmUser()
        })
        .catch(err => {
          console.log(err)
        })
    },
    confirmUser () {
      this.userArray = [{
        name: `${this.firstName} ${this.lastName}`,
        email: this.email,
        phone: this.phone,
        appointment: this.appointment
      }]
      this.dialog = true
      this.clearFields()
    },
    clearFields () {
      this.date = null
      this.selected = null
      this.firstName = null
      this.lastName = null
      this.email = null
      this.phone = null
    },
    setSlots () {
      const selectedSlots = this.$store.getters.allSlots
      if (selectedSlots > 0) {
        this.selectedSlots = selectedSlots
      }
    },
    getSlots () {
      if (this.date !== null) {
        this.setSlots()
        this.setMode = true
        if (this.selectedSlots !== null) {
          console.log('selected slots via database:', this.selectedSlots)
          if (this.e1 === 'AM') {
            for (let i = 0; i < this.selectedSlots.length; i++) {
              for (let x = 0; x < this.availableAMs.length; x++) {
                if (this.date === selectedSlots[i].slot_date) {
                  if (this.availableAMs[x].time === this.selectedSlots[i].slot_time) {
                    this.availableAMs[x].state = 'disabled'
                    this.availableAMs[x].click_state = null
                  }
                }
              }
            }
          } else if (this.e1 === 'PM') {
            for (let i = 0; i < this.selectedSlots.length; i++) {
              for (let x = 0; x < this.availablePMs.length; x++) {
                if (this.date === selectedSlots[i].slot_date) {
                  if (this.availablePMs[x].time === this.selectedSlots[i].slot_time) {
                    this.availablePMs[x].state = 'disabled'
                    this.availablePMs[x].click_state = null
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
