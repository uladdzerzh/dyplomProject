<script setup>
import { inject, onMounted } from 'vue';
import { useRouter, } from 'vue-router'
import { useUserData } from '../composables/loggedInUserData.js'

const router = useRouter()
const loggedInUserData = useUserData()
const apiURL = inject('apiURL')

async function logout(){
    try{
            const response = await fetch(apiURL + '/api/logout', {
            method: "POST",
            mode: "cors",
            cache: "no-cache", 
            credentials: "include",
            redirect: "follow", 
            referrerPolicy: "no-referrer",
            });
            console.log(response)
            loggedInUserData.value.email = null
            loggedInUserData.value.username = null

        }catch(err){
            console.log(err)
        } 
}

onMounted(async()=>{
    await logout()
    router.push({name:'home'})
})

</script>

<template>
    
        <div></div>
    
</template>

<style>
</style>