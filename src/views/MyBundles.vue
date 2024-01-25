<script setup>
import MenuBar from '../components/MenuBar.vue'
import { inject, onMounted, ref } from 'vue';
import { useRouter, } from 'vue-router'
import { useUserData } from '../composables/loggedInUserData.js'

const router = useRouter()
const loggedInUserData = useUserData()
const apiURL = inject('apiURL')

const aggregatedFiles = ref({"bundles": []})

async function getFiles(){
    try{
        const response = await fetch(apiURL + '/api/user/files', {
            method: "GET",
            mode: "cors",
            cache: "no-cache", 
            credentials: "include",
            redirect: "follow", 
            referrerPolicy: "no-referrer",
        });
        var respJson = await response.json()
        console.log(respJson)
        aggregatedFiles.value = respJson
            
    }catch(err){
        console.log(err)
    } 
}

async function deleteBundle(bundle_id){
    try{
        const response = await fetch(apiURL + '/api/delete-bundle/' + bundle_id, {
            method: "POST",
            mode: "cors",
            cache: "no-cache", 
            credentials: "include",
            redirect: "follow", 
            referrerPolicy: "no-referrer",
        });
        var respText = await response.text()
        console.log(respText)    
        router.go({name: 'my-files' })
    }catch(err){
        console.log(err)
    } 
}

onMounted(async()=>{
    await getFiles()
    
})

console.log(window.location.origin)
const serverAddressOrigin = window.location.origin

</script>

<template>
<div class="container-fluid">
    <MenuBar/>
    <div>
        <template v-if="aggregatedFiles['bundles'].length != 0" v-for="bundle in aggregatedFiles['bundles']">
            <div class="bundle p-3 border border-3" :id="bundle.id" >
                <p class="link mb-1">Link: <RouterLink :to="{ name: 'Download', params: { link: bundle.link }}"> {{ serverAddressOrigin }}/download/{{ bundle.link }}</RouterLink></p>
                <p class="dateCreated mb-1">Data utworzenia: {{ bundle.dateCreated }}</p>
                <p class="dateExpires mb-1">Data wygaśnęcia: {{ bundle.dateExpires }}</p>
                <button @click="deleteBundle(bundle.id)" type="button">Usuń pakiet</button>
                <template v-for="file in bundle.files">
                    <div class="file border border-2 border-top mb-0" :id="file.id">
                        <p class="mb-1">Name: {{ file.name }}</p>
                        <p class="mb-1">Size: {{ file.size }}</p>
                    </div>
                </template>
            </div>
        </template>
        <template v-else>
            <div >
                <h3>Nie masz zapisanych plików</h3>
            </div>
        </template>
        

    </div>
</div>
</template>

<style>
</style>