<script setup>
import { inject, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useUserData } from '../composables/loggedInUserData.js'

const apiURL = inject('apiURL')
const loggedInUserData = useUserData()

async function currentUser(){
  const response = await fetch(apiURL+'/api/user', {
        method: "GET", 
        mode: "cors", 
        cache: "no-cache",
        credentials: "include", 
        redirect: "follow", 
        referrerPolicy: "no-referrer", 
    });
  var respJson = await response.json()
  console.log(respJson)
  return respJson
}

onMounted(async()=>{
  var userData = await currentUser()
  if(userData.email && userData.username){
    loggedInUserData.value.email = userData.email
    loggedInUserData.value.username = userData.username
  }
  else{
    loggedInUserData.value.email = null
    loggedInUserData.value.username = null
  }
  
})

</script>

<template>
    <!-- <div class="container-fluid"> -->
      <div class="row">
        <div class="col-6 col-sm col-md-2 col-lg-1">
          <RouterLink to="/">AgileShare</RouterLink>
        </div>
        <div class="col-6 col-sm col-md-2 col-lg-1" v-if="!loggedInUserData.email || !loggedInUserData.username">
          <RouterLink to="/login">Login</RouterLink>
        </div>
        <div class="col-6 col-sm col-md-2 col-lg-1" v-if="!loggedInUserData.email || !loggedInUserData.username">          
          <RouterLink to="/register">Rejestracja</RouterLink>
        </div>
        <div class="col-6 col-sm col-md-2 col-lg-1" v-if="loggedInUserData.email && loggedInUserData.username">
          <RouterLink  to="/my-files">Moje pliki</RouterLink>
        </div>
        <div class="col-6 col-sm col-md-2 col-lg-1" v-if="loggedInUserData.email && loggedInUserData.username" >
          <RouterLink to="/account">Konto</RouterLink>
        </div>
        <div class="col-6 col-sm col-md-2 col-lg-1" v-if="loggedInUserData.email && loggedInUserData.username">
          <RouterLink  to="/logout">Wyloguj się</RouterLink>
        </div>

      </div>

        <!-- <RouterLink to="/">Agile share</RouterLink>
        <RouterLink v-if="!loggedInUserData.email || !loggedInUserData.username" to="/login">Login</RouterLink>
        <RouterLink v-if="!loggedInUserData.email || !loggedInUserData.username" to="/register">Rejestracja</RouterLink>

        <RouterLink v-if="loggedInUserData.email && loggedInUserData.username" to="/my-files">Moje pliki</RouterLink>
        <RouterLink v-if="loggedInUserData.email && loggedInUserData.username" to="/account">Konto</RouterLink>
        <RouterLink v-if="loggedInUserData.email && loggedInUserData.username" to="/logout">Wyloguj się</RouterLink>
        <RouterLink to="/about">O nas</RouterLink> -->
      
    <!-- </div> -->
</template>

<style>
</style>