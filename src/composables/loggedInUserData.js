import { ref } from 'vue'

const userData = ref({username: null, email: null})

export function useUserData(){

    return userData
}