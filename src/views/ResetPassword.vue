<script setup>
import MenuBar from '../components/MenuBar.vue'

import { useUserData } from '../composables/loggedInUserData.js'
import { ref, inject } from 'vue';
import { useRouter, } from 'vue-router'

const apiURL = inject('apiURL')
const router = useRouter()
const loggedInUserData = useUserData()

const newPasswordData = ref({oldPassword:'',
                        newPassword: '',
                        newPasswordRepeat: ''})


const validationInfo = ref({oldPasswordSet: 'true',
                            newPasswordSet: 'true',
                            newPasswordRepeatSet: 'true',
                            newPasswordSame: 'true',})
const serverError = ref('')

function validateForm(){
    var isValid = true
    if(newPasswordData.value.oldPassword.length == 0){
        validationInfo.value.oldPasswordSet = false
        isValid = false
    }else{
        validationInfo.value.oldPasswordSet = true
    }
    if(newPasswordData.value.newPassword.length < 2 ){
        validationInfo.value.newPasswordSet = false
        isValid = false
    }else{
        validationInfo.value.newPasswordSet = true
    }
    if(newPasswordData.value.newPasswordRepeat.length < 2 ){
        validationInfo.value.newPasswordRepeatSet = false
        isValid = false
    }else{
        validationInfo.value.newPasswordRepeatSet = true
    }
    if(newPasswordData.value.newPassword != newPasswordData.value.newPasswordRepeat){
        validationInfo.value.newPasswordSame = false
        isValid = false
    }else{
        validationInfo.value.newPasswordSame = true
    }   
    return isValid
}


async function resetPassword(){
    serverError.value = ''
    if(!validateForm()) return 

    var body = {
        newPassword: newPasswordData.value.newPassword,
        oldPassword: newPasswordData.value.oldPassword 
    }

    try{
        const response = await fetch(apiURL+'/api/password-reset', {
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
        else{
            router.push({name: 'account'})
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
            <h1>Zmiana hasła</h1>
        </div>
    </div>
    <form @submit.prevent="resetPassword">
        <div class="row">
            <div class="col-md my-2">
                <h5>Aktualne hasło</h5>
                <input v-model="newPasswordData.oldPassword"  name="oldPass" type="password" placeholder="" require />
                <p v-if="!validationInfo.oldPasswordSet">Podaj aktualne hasło</p>
            </div>
        </div>

        <div class="row">
            <div class="col-md">
                <h5>Nowe hasło</h5>
                <input v-model="newPasswordData.newPassword"  name="newPass" type="password" placeholder="" require />
                <p v-if="!validationInfo.newPasswordSet">Podaj nowe hasło</p>
            </div>
        </div>
        <div class="row">
            <div class="col-md">
                <h5>Powtórz nowe hasło</h5>
                <input v-model="newPasswordData.newPasswordRepeat"  name="newPassRepeat" type="password" placeholder="" require />
                <p v-if="!validationInfo.newPasswordRepeatSet">Powtórz nowe hasło</p>
                <p v-if="validationInfo.newPasswordRepeatSet && validationInfo.newPasswordSet && !validationInfo.newPasswordSame">Nowe hasła się nie zgadzają</p>
            </div>
        </div>

        <div v-if="serverError" class="row my-2">
            <div class="col-md my-1 pb-1">
                <p >{{ serverError }}</p>
            </div>
        </div>

        <div class="row">
            <div class="col-md my-1">
                <button type="submit">Zmień hasło</button>
            </div>
        </div>

    </form>
    

</div>
</template>

<style>
</style>