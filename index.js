
const clientId = 'c25a7fdc8d544e1799ad5d8abb7ff292'
localStorage.setItem('clientId', clientId)
const redirectUri = 'http://127.0.0.1:5500/callback.html'
localStorage.setItem('redirectUri', redirectUri)
const token = localStorage.getItem('token')
const loginBtn = document.querySelector('#login-btn')
const loginScreen = document.querySelector('.login-screen')
const dashboard = document.querySelector('.dashboard')



if (token) {
    loginScreen.style.display = 'none'
    dashboard.style.display = 'block'
    getUserInfo()
} else {
    loginScreen.style.display = 'block'
    dashboard.style.display = 'none'
}

const timeSelect = document.querySelector('#time-range')
timeSelect.addEventListener('change', () => {
    getTopArtists(timeSelect.value)
    getTopTracks(timeSelect.value)
})



function generateCodeVerifier() {
    const array = new Uint8Array(64)
    crypto.getRandomValues(array)
    return btoa(String.fromCharCode(...array))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '')
}

async function generateCodeChallenge(verifier) {
    const data = new TextEncoder().encode(verifier)
    const hash = await crypto.subtle.digest('SHA-256', data)
    return btoa(String.fromCharCode(...new Uint8Array(hash)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '')
}

loginBtn.addEventListener('click', async () => {
    const verifier = generateCodeVerifier()
    const challenge = await generateCodeChallenge(verifier)
    localStorage.setItem('codeVerifier', verifier)

    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=streaming user-read-email user-read-private playlist-read-private user-top-read user-follow-read&code_challenge_method=S256&code_challenge=${challenge}`

    window.location.href = authUrl
})


async function getUserInfo() {
    
    try{
        const responseUserInfos = await fetch('https://api.spotify.com/v1/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        const dataUser = await responseUserInfos.json()

        const responseFollowing = await fetch('https://api.spotify.com/v1/me/following?type=artist', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        const dataFollowing = await responseFollowing.json()
        

        const responsePlaylist = await fetch('https://api.spotify.com/v1/me/playlists', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        const dataPlaylists = await responsePlaylist.json()

    
        getTopArtists('short_term')
        getTopTracks('short_term')


       changeProfilInfos({
        name: dataUser.display_name,
        followers: dataUser.followers.total,
        following: dataFollowing.artists.total,
        nbPlaylists: dataPlaylists.total,
        avatar: dataUser.images[0]?.url,
       })



    }catch(e){

        console.error(e)


    }


}

// à faire: input select avec: 4 dernieres semaines, 6 derniers mois et tous les temps,
// ajouter en parametre de getTopArtists(url), change l'url de responseTA par url dcp, mets les différentes url &time_range=short_term etc
// features à add: Un score de compatibilité musicale entre deux utilisateurs
//Des stats sous forme de graphiques (Chart.js)
//Un historique de tes tops sur plusieurs semaines
// https://api.spotify.com/v1/me/top/tracks


async function getTopArtists(timeRange) {
    
    try {

        const responseTA = await fetch(`https://api.spotify.com/v1/me/top/artists?limit=4&time_range=${timeRange}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        let changeTimeValue = document.querySelector('.time-value')

        const dataTA = await responseTA.json()
        console.log(dataTA)
        let artistName = ''
        let artistAvatar = ''
        let timeValueObject = {
            'short_term' : 'des 4 dernières semaines',
            'medium_term' : 'des 6 derniers mois',
            'long_term' : 'de tous les temps',

        }

        changeTimeValue.textContent = timeValueObject[`${timeRange}`]

        document.querySelector('.all-top-artists').innerHTML = ''

        dataTA.items.forEach(element => {
            artistAvatar = element.images[0]?.url
            artistName = element.name
            createTopArtists(artistAvatar, artistName)
        });

        console.log(artistName)
    } catch (error) {
        console.error(error)
    }

}


async function getTopTracks(timeRange) {
    
    try {
        const responseTracks = await fetch(`https://api.spotify.com/v1/me/top/tracks?limit=4&time_range=${timeRange}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })

        const dataTracks = await responseTracks.json()
        console.log(dataTracks)

    } catch (error) {
        console(error)
    }


}


function createTopArtists(artistAvatar, artistName) {

    const allTopArtists = document.querySelector('.all-top-artists')
    
    const artistCard = document.createElement('div')
    const img = document.createElement('img')
    const name = document.createElement('span')
    const label = document.createElement('span')
    const playBtn = document.createElement('div')

    artistCard.classList.add('artist-card')
    img.classList.add('artist-avatar')
    name.classList.add('artist-name')
    label.classList.add('artist-label')
    playBtn.classList.add('play-btn')

    img.src = artistAvatar
    name.textContent = artistName
    label.textContent = 'Artiste'
    playBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>`

    artistCard.append(img, playBtn, name, label)
    allTopArtists.append(artistCard)

}



function changeProfilInfos( { name, followers, following, nbPlaylists, avatar } )  {

    const  changeAvatar = document.querySelector('.profil-avatar')
    const  changeName = document.querySelector('.profil-name')
    const  changeStats = document.querySelector('.profil-stats')
    let firstLetter = name.slice(0, 1)
    if (!avatar) {
        changeAvatar.src = `https://ui-avatars.com/api/?name=${firstLetter}&background=535353&color=fff&size=150&rounded=true`
    }else{
        changeAvatar.src = avatar
    }

    changeName.textContent = name
    changeStats.textContent = `${nbPlaylists} playlists • ${followers} abonnés • ${following} abonnements`
    


}