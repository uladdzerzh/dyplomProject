<script setup>
import MenuBar from '../components/MenuBar.vue'
import { useUserData } from '../composables/loggedInUserData.js'
import { ref, computed, inject } from 'vue'
import { useRouter, useRoute, onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'

const apiURL = inject('apiURL')
const router = useRouter()

const loggedInUserData = useUserData()

const loginData = ref({emailOrUsername: "", password: ""})
const validationInfo = ref({emailOrUsername:true, password: true})
const serverError = ref('')

function validateForm(){
    var isValid = true
    if(loginData.value.emailOrUsername.length == 0){
        validationInfo.value.emailOrUsername = false
        isValid = false
    }else{
        validationInfo.value.emailOrUsername = true
    }
    if(loginData.value.password.length == 0){
        validationInfo.value.password = false
        isValid = false
    }else{
        validationInfo.value.password = true
    }
    return isValid
}

async function logIn(){
    serverError.value=''
    if(!validateForm()) return 

    var body = {
        emailOrUsername: loginData.value.emailOrUsername.trim(), 
        password: loginData.value.password.trim() 
    }

    try{
        const response = await fetch(apiURL + '/api/login', {
            method: "POST", 
            mode: "cors",
            cache: "no-cache", 
            credentials: "include",
            headers: {            
                "Content-Type": "application/json",
            },
            redirect: "follow",
            referrerPolicy: "no-referrer",
            body: JSON.stringify(body), 
        });

        if(response.status != 200){
            serverError.value = await response.text()
            return
        }
        //set global state
        var respJson = await response.json()
        loggedInUserData.value.email = respJson.email
        loggedInUserData.value.username = respJson.username

        router.push({name:'home'})
    }catch(err){
        console.log(err)
    }
    
}
</script>

<template>
    
<div class="container-fluid ">
         
    <MenuBar/>        
    
    <div class="row">
        <div class="col-md">
            <h1>Zaloguj się</h1>
        </div>
    </div>
        
    <form @submit.prevent="logIn">
        <div class="row my-2">
            <div class="col-md-4 my-1 pb-1">
                <input v-model="loginData.emailOrUsername" class="rounded-1" name="emailOrUsername" type="text" placeholder="Podaj email lub nazwę użytkownika" />
                <br/><span v-if="!validationInfo.emailOrUsername">Nie pozostawiaj puste</span>
            </div>
        </div>

        <div class="row">
            <div class="col-md pb-1">
                <input v-model="loginData.password" @submit.prevent class="rounded-1" name="password" type="password" placeholder="Hasło" />
                <br/><span v-if="!validationInfo.password" class="p-0 m-0">Nie pozostawiaj puste</span>
                <br/><span v-if="serverError">{{ serverError }}</span>
            </div>
        </div>

        <div class="row">
            <div class="col-md my-1">
                <button type="submit">Log in</button>
            </div>
        </div>
    </form>

    <div class="row">
        <div class="col">
            Nie masz konta? <RouterLink :to="{ name: 'register'}">Załóż</RouterLink>
        </div>
    </div>

</div>

</template>

<style>

</style>