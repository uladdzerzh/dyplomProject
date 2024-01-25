<script setup>
import MenuBar from '../components/MenuBar.vue'
import { ref, computed, inject } from 'vue'
import { useRouter, useRoute, onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'

const apiURL = inject('apiURL')
const router = useRouter()

const loginData = ref({email: "", password: "", passwordRepeat: "", username: ""})
const validationInfo = ref({email:'true', password: 'true', username: 'true'})
const serverError = ref('')

function validateForm(){
    var isValid = true
    if (loginData.value.email.length == 0 || !loginData.value.email.toLowerCase()
                        .match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/) )
    {
        validationInfo.value.email = false
        isValid = false
    }else{
        validationInfo.value.email = true
    }
    if(loginData.value.password.length < 2 || loginData.value.password != loginData.value.passwordRepeat){
        validationInfo.value.password = false
        isValid = false
    }else{
        validationInfo.value.password = true
    }
    if(loginData.value.username.length < 4){
        validationInfo.value.username = false
        isValid = false
    }else{
        validationInfo.value.username = true
    }

    return isValid
}

async function signUp(){
    serverError.value = ''
    if(!validateForm()) return 

    var body = {
        email: loginData.value.email, 
        password: loginData.value.password,
        username: loginData.value.username 
    }

    try{
        const response = await fetch(apiURL+'/api/register', {
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

        if(response.status != 201){
            serverError.value = await response.text()
        }else{
            router.push({name: 'login'})
        }

    }catch(err){
        console.log(err)
    }

}

</script>

<template>
    
<div class="container-fluid">

    <div class="row">
        <div class="col-md">
            <MenuBar/>
        </div>
    </div>

    <div class="row">
        <div class="col-md">
            <h1>Rejestracja</h1>
        </div>
    </div>        
    
    
    <form @submit.prevent="signUp">        
        <div class="row my-2">
            <div class="col-md-4 my-1 pb-1">
                <input v-model="loginData.username"  name="username" type="text" placeholder="Nazwa użytkownika" require />
                <p v-if="!validationInfo.username">Podaj nazwę użytkownika</p>
            </div>
        </div>
            
        <div class="row">
            <div class="col-md my-1 pb-1">
                <input v-model="loginData.email" class="rounded-1" name="email" type="email" placeholder="Email" require />
                <p v-if="!validationInfo.email">Podaj poprawny email</p>
            </div>
        </div>
        
        
        <div class="row my-2">
            <div class="col-md-4 my-1 pb-1">
                <input v-model="loginData.password" class="rounded-1" :class="{'input-invalid': !validationInfo.password }" name="password" type="password" placeholder="Hasło" require/>
            </div>
        </div>
        <div class="row my-2">
            <div class="col-md-4 my-1 pb-1">
                <input v-model="loginData.passwordRepeat" class="rounded-1" :class="{'input-invalid': !validationInfo.password }" name="password" type="password" placeholder="Potwierdz hasło" require/>
            </div>
        </div>
        <div v-if="!validationInfo.password" class="row my-2">
            <div class="col-md my-1 pb-1">
                <p>Za krótkie hasło lub hasła się nie zgadzają</p>
            </div>
        </div>
        
        <div v-if="serverError" class="row my-2">
            <div class="col-md my-1 pb-1">
                <p >{{ serverError }}</p>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md my-1">
                <button type="submit">Sign Up</button>
            </div>
        </div> 
    </form>

</div>
</template>

<style>

.input-invalid{
    border-color: red;
}


</style>