const search = window.location.search 
const params = new URLSearchParams(search.substring(1)) 
const code = params.get('code') 
const redirectUri = localStorage.getItem('redirectUri')
const clientId = localStorage.getItem('clientId')
if(code) {
    localStorage.setItem('spotifyCode', code)
    getToken()
} else {
    console.log('Pas de token trouvé')
}

async function getToken() {

    try {

        const response = await fetch(`https://accounts.spotify.com/api/token`, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            method: 'POST',
            body: new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirectUri,
            client_id: clientId,
            code_verifier: localStorage.getItem('codeVerifier')
        
        })})

        const data = await response.json()
        const token = data.access_token
        localStorage.setItem('token', token)
        window.location.href = 'index.html'

    }catch{

    }


}