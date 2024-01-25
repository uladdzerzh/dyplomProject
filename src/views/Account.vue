<script setup>
import MenuBar from '../components/MenuBar.vue'

import { ref, inject } from 'vue';
import { useUserData } from '../composables/loggedInUserData.js'
import { useRouter, } from 'vue-router'

const apiURL = inject('apiURL')

const router = useRouter()

const loggedInUserData = useUserData()

const newUserData = ref({username:loggedInUserData.value.username,
                        email: loggedInUserData.value.email})


const validationInfo = ref({email:'true', password: 'true', username: 'true'})
const serverError = ref('')

function validateForm(){
    var isValid = true
    if (newUserData.value.email.length == 0 || !newUserData.value.email.toLowerCase()
                        .match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/) )
    {
        validationInfo.value.email = false
        isValid = false
    }else{
        validationInfo.value.email = true
    }
    if(newUserData.value.username.length < 4){
        validationInfo.value.username = false
        isValid = false
    }else{
        validationInfo.value.username = true
    }

    return isValid
}


async function editUserInfo(){
    serverError.value = ''
    if(!validateForm()) return 

    var body = {
        email: newUserData.value.email,
        username: newUserData.value.username 
    }

    try{
        const response = await fetch(apiURL+'/api/update-user-info', {
            method: "POST", 
            mode: "cors", // no-cors, *cors, same-origin
            cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
            credentials: "include", // include, *same-origin, omit
            headers: {
                // "Allow": "OPTIONS, GET, HEAD, POST",
                // "Accept": "text/html, application/json",
                // "Access-Control-Allow-Origin": "*",
                // "Access-Control-Allow-Methods": "*",
                // "Access-Control-Allow-Headers":"*",
                // 'Access-Control-Allow-Credentials': "*",
                "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: "follow", // manual, *follow, error
            referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify(body), // body data type must match "Content-Type" header
        });
    
        console.log(response)

        if(response.status != 200){
            serverError.value = await response.text()
        }
    }catch(err){
        console.log(err)
    }
    
}


async function deleteAccount(){
    const body = {}

    try{
        const response = await fetch(apiURL+'/api/delete-account', {
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
        console.log(response)

        if(response.status != 200){
            serverError.value = await response.text()
        }
        else{
            router.push({name:'home'})
        }
    }catch(err){
        console.log(err)
    }
}

</script>

<template>
<div class="container-fluid">
    <MenuBar/>
    <div class="row">
        <div class="col-md">
            <h1>Dane użytkownika</h1>
            
        </div>
    </div>
    <form @submit.prevent="editUserInfo">
        <div class="row">
            <div class="col-md">
                <h5>Nazwa użytkownika</h5>
                <input v-model="newUserData.username"  name="username" type="text" placeholder="Nazwa użytkownika" require />
                <p v-if="!validationInfo.username">Podaj nazwę użytkownika</p>               
            </div>
        </div>

        <div class="row">
            <div class="col-md">
                <h5>Email</h5>
                <input v-model="newUserData.email"  name="email" type="email" placeholder="Email" require />
                <p v-if="!validationInfo.email">Podaj poprawny email</p>
            </div>
        </div>

        <div v-if="serverError" class="row my-2">
            <div class="col-md my-1 pb-1">
                <p >{{ serverError }}</p>
            </div>
        </div>

        <div class="row">
            <div class="col-md my-1">
                <button type="submit">Zmień dane</button>
            </div>
        </div>
    </form>

    <div class="row">
        <div class="col-md my-1">
            <RouterLink :to="{ name: 'passwordReset'}">Zmień hasło</RouterLink>
        </div>
    </div>

    <div class="row">
        <div class="col-md my-1">
            <button type="button" @click="deleteAccount">Usuń konto</button>
        </div>
    </div>
    

</div>
</template>

<style>
</style>