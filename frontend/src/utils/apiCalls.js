import axios from 'axios'

const api = axios.create({
    baseURL: "http://localhost:3000/api",
    headers:{
        "Content-Type": "application/json",
        "Authorization": `Bearer ${sessionStorage.getItem("token")}`
    }
})

export const fetchAPI = async (url, method, data) => {
    try {
        const response = await api.request({
            url,
            method,
            data
        })
        return response.data
    } catch (error) {
        console.log(error)
    }
}
