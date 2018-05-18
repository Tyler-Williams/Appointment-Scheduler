import Vue from 'vue'
import Router from 'vue-router'
import AppointmentRoute from './AppointmentScheduler'
import HelloWorld from '@/components/HelloWorld'

Vue.use(Router)

export default new Router({
  routes: [
    AppointmentRoute,
    {
      path: '/',
      name: 'HelloWorld',
      component: HelloWorld
    }
  ]
})
