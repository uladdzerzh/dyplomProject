<script setup>
import MenuBar from '../components/MenuBar.vue'
import { ref, inject, onMounted} from 'vue'
import { useRouter, } from 'vue-router'
import { useUserData } from '../composables/loggedInUserData.js'

const streamSaver = window.streamSaver

const loggedInUserData = useUserData()

const apiURL = inject('apiURL')
const router = useRouter()
const filesSelected = ref([])

const sixDigitCode = ref('100001')

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


//checking if logged in
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


function addFile(e){
    console.log(e.target.files)
    var fileNames = filesSelected.value.map(it => it.name)
    for(var i=0; i<e.target.files.length; i++){
        if(!fileNames.includes(e.target.files[i].name)){
            filesSelected.value.push(e.target.files[i])
        }
    }
}


function removeFile(fileName){
    filesSelected.value = filesSelected.value.filter(it => it.name != fileName)
}
function callFileInput(){
    document.getElementById('chooseFile').click()
}


const getFileSize = (sizeInBytes)=>{
    if(sizeInBytes < 1024) return ' '+sizeInBytes.toFixed(1)+' B'
    var sizeInKB = sizeInBytes/1024
    if(sizeInKB < 1024) return ' '+sizeInKB.toFixed(1)+' KB'
    var sizeInMB = sizeInKB/1024
    if(sizeInMB < 1024) return ' '+ sizeInMB.toFixed(1)+' MB'
    var sizeInGB = sizeInMB/1024
    return ' '+sizeInGB.toFixed(1)+' GB'
}


async function sendFiles(){
    var formData = new FormData()
    for(var i=0; i< filesSelected.value.length; i++){
        formData.append('file'+i, filesSelected.value[i])
        //console.log(filesSelected.value[i])
    }

    try{
        const response = await fetch(apiURL + '/api/add-file-bundle', {
            method: "POST", 
            mode: "cors",     
            credentials: "include",
            body: formData, 
        });
        console.log(response)
        filesSelected.value = []
        if(response.status >= 200 && response.status < 300){
            router.push({name:'my-files'})
        }
    }catch(err){
        console.log(err)
    }
}

import { useSocketIO } from '../composables/socketio.js'
const socket = useSocketIO()

socket.on('stream_created', message => {
        console.log("The requested stream is created: ", message)
})

socket.on('stream_invalid', () => {
    console.log('INVALID CODE')
})
socket.on('stream_valid', () => {
    console.log('VALID CODE')
})

async function createStream(){
    socket.emit('create_stream', 'Request new stream')
}
function downloadStreamFiles(){
    socket.emit('download_stream', {code:sixDigitCode.value})
}


////////////
////////////
//Upload////
////////////

var uploadState = {
    chunkSize: 1024*512,
    currentFile: 0,
    currentChunk: 0,
    numChunksPerFile: []
}

socket.on('stream_start_upload', (destination) => {
    console.log('PREPARING TO UPLOAD TO SERVER')
    setUpTheUpload(destination.destination)
    console.log(uploadState)

    uploadNextChunk()

})
socket.on('request_next_chunk', () => {
    uploadNextChunk()
})


function setUpTheUpload(destination){
    uploadState.destination = destination
    uploadState.currentFile = 0
    uploadState.currentChunk = 0

    console.log("Num of files: ", filesSelected.value.length)

    for(const currentFile of filesSelected.value){

        const chunkSize = uploadState.chunkSize

        var currentFileSize = currentFile.size
        var numberOfChunks = Math.ceil(currentFile.size/chunkSize)
        console.log("Rozmiar pliku w B:", currentFileSize)
        console.log("Number of chunks: ", numberOfChunks)

        uploadState.numChunksPerFile.push(numberOfChunks)
    }
}

function uploadNextChunk(){    

    if(uploadState.currentChunk >= uploadState.numChunksPerFile[uploadState.currentFile]){
        uploadState.currentFile += 1
        uploadState.currentChunk = 0

        if(uploadState.currentFile >= uploadState.numChunksPerFile.length){
            socket.emit('end_stream', {destination: uploadState.destination})
            return 
        }
    }
    console.log("UPLOAD STATE", uploadState)

    var body = {destination: uploadState.destination}
    if(uploadState.currentChunk == 0){
        body['new_file'] = true
        body['filename'] = filesSelected.value[uploadState.currentFile].name
    }else{
        body['new_file'] = false
    }

    var currentFile = filesSelected.value[uploadState.currentFile]
    var offset = uploadState.currentChunk * uploadState.chunkSize
    var chunkEnd = Math.min(offset + uploadState.chunkSize, currentFile.size)
    const chunk = currentFile.slice(offset, chunkEnd)

    body['chunk'] = chunk
    console.log("Body for next chunk:")
    console.log(body)

    socket.emit('next_chunk', body)

    uploadState.currentChunk += 1
}

///////////
////////////
//Download//
/////////////

var downloadState = {
    writer: null
}

socket.on('next_chunk', async (data) => {
    await downloadNextChunk(data)

    socket.emit('request_next_chunk', {source: data['source']})
})

socket.on('end_stream', () => {
    console.log("RECEIVED END STREAM SIGNAL")

    downloadState.writer.close()
})

async function downloadNextChunk(data){
    console.log("RECEIVED CHUNK DATA: ", data)
    if(data.new_file){
        if(downloadState.writer){
            downloadState.writer.close()
        }
        const fileStream = streamSaver.createWriteStream(data.filename)
        downloadState.writer = fileStream.getWriter()
    }

    const readableStream = new Blob([data.chunk]).stream()
    const reader = readableStream.getReader()

    //read from readable stream until the end
    var res = await reader.read()
    while(true){
        console.log(res)
        if(res.done){
            console.log("DONE READING FROM STREAM")
            break
        }else{
            console.log("BEFORE WRITING TO WRITER FROM BLOB STREAM")
            downloadState.writer.write(res.value)
            console.log("AFTER WRITING TO WRITER FROM BLOB STREAM")
            res = await reader.read()
        }
    }

}


async function uploadStreamFiles(){
    console.log("Num of files: ", filesSelected.value.length)
    

    for(const currentFile of filesSelected.value){
            const fileStream = streamSaver.createWriteStream(currentFile.name)
            const writer = fileStream.getWriter()

        var currentFileSize = currentFile.size
        const chunkSize = 1024*1024*5
        var numberOfChunks = Math.ceil(currentFile.size/chunkSize)

        console.log("Rozmiar pliku in B:", currentFileSize)
        console.log("Number of chunks: ", numberOfChunks)

        var offset = 0
        var chunkEnd = Math.min(offset + chunkSize , currentFile.size)

        //loop over all chunks of a file
        for (let j=0; j<numberOfChunks; j++ ){
            const chunk = currentFile.slice(offset, chunkEnd)
            console.log("created chunk ", j, ": ", chunk)


                const readableStream = chunk.stream()
                const reader = readableStream.getReader()

                //read from readable stream until the end
                var res = await reader.read()
                while(true){
                    console.log(res)
                    if(res.done){
                        console.log("DONE READING FROM STREAM")
                        break
                    }else{
                        console.log("BEFORE WRITING TO WRITER FROM BLOB STREAM")
                        writer.write(res.value)
                        console.log("AFTER WRITING TO WRITER FROM BLOB STREAM")
                        res = await reader.read()
                    }
                }

            offset = offset + chunkSize
            chunkEnd = Math.min(offset + chunkSize , currentFile.size)

            if(offset > currentFileSize){
                break
            }
            
        }
        console.log("")
            console.log("DONE WRITING FILE")
            writer.close()
    }
}




</script>

<template>
    
<div class="container-fluid">

    <MenuBar />

    <div class="row">
        <div class="col-md-5">
            <div class="selected-files">
                <ul>
                    <template v-for="file in filesSelected">
                        <li >{{ file.name }} {{ getFileSize(file.size) }}
                        <button @click="removeFile(file.name)" type="button">Usuń</button>
                        </li>
                    </template>
                </ul>
            </div>

            <input @change="addFile($event)" id="chooseFile" style="display:none" type="file" multiple accept="" value=""/>
            <button type="button" class="my-3" @click="callFileInput" >Dodaj pliki</button>
            
            <div class="row">
                <div class="col">
                    <input @click.prevent="sendFiles" type="button" class="my-3" :disabled="!(loggedInUserData.email && loggedInUserData.username)" value="Zapisz paczkę"/>
                </div>
                <div class="col">
                    <input @click.prevent="createStream" type="button" class="my-3" value="Wyślij jako strumień"/>
                </div>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-md">
            <br>
            <input v-model="sixDigitCode" placeholder="Wprowadź kod"/><br><br>
            <button @click="downloadStreamFiles">Odbierz</button>
            
        </div>        
    </div>
</div>
</template>

<style>
.selected-files{
    border: 1px dashed;
    min-width:200px; 
    min-height:200px;
}
</style>