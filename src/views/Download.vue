<script setup>
import { useUserData } from '../composables/loggedInUserData.js'
import { ref, inject, onMounted } from 'vue'
import { useRouter, useRoute, } from 'vue-router'

const router = useRouter()
const route = useRoute()
const apiURL = inject('apiURL')

const bundle = ref({})

async function getBundle(){
    try{
            const response = await fetch(apiURL + '/api/user/files/' + route.params.link, {
            method: "GET",
            mode: "cors",
            cache: "no-cache", 
            credentials: "include",
            redirect: "follow",
            referrerPolicy: "no-referrer",
            });
            var respJson = await response.json()
            console.log(respJson)
            bundle.value = respJson

        }catch(err){
            console.log(err)
        } 
}

onMounted(async()=>{
    await getBundle()
})
const serverAddressOrigin = window.location.origin

</script>

<template>

<div class="container-fluid">
    <div>
        <div class="bundle p-3 border border-3" :id="bundle.id">
            <p class="link mb-1">Link: 
                <RouterLink :to="{ name: 'Download', params: { link: bundle.link }}"> {{ serverAddressOrigin }}/download/{{ bundle.link }}</RouterLink>
            </p>
            <p class="dateCreated mb-1">Data utworzenia: {{ bundle.dateCreated }}</p>
            <p class="dateExpires mb-1">Data wygaśnęcia: {{ bundle.dateExpires }}</p>
            <template v-for="file in bundle.files">
                <div class="file border border-2 border-top mb-0" :id="file.id">
                    <p class="mb-1">Name: {{ file.name }}</p>
                    <p class="mb-1">Size: {{ file.size }}</p>
                </div>
            </template>
        </div>

        <a  :href="apiURL + '/api/download/' + bundle.id" >Pobierz</a>

    </div>
</div>

</template>

<style>
</style>