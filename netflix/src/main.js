import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ikxsjizfjhwfdvystfyh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlreHNqaXpmamh3ZmR2eXN0ZnloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyODg4NzIsImV4cCI6MjA2Mzg2NDg3Mn0.AEIEHwZv-MEov5km2w1HH4C-dfrK6pWHETLc-A7tWIQ'

const supabase = createClient(supabaseUrl, supabaseKey)

// Elementos del DOM
const loginForm = document.getElementById('login-form')
const registerForm = document.getElementById('register-form')
const loginContainer = document.querySelector('.container')
const peliculasContainer = document.getElementById('contenedor-peliculas')
const switchText = document.getElementById('switch-text')
const formTitle = document.getElementById('form-title')

// API de películas
const API_KEY = 'c1a6fd718fbc339f88326a7dddf29c54'
const API_URL = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=es-ES&page=1`
const IMG_URL = 'https://image.tmdb.org/t/p/w500'

// Iniciar sesión
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault()

  const email = document.getElementById('login-email').value
  const password = document.getElementById('login-password').value

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    alert('Error al iniciar sesión: ' + error.message)
  } else {
    alert('¡Inicio de sesión exitoso!')
    loginContainer.style.display = 'none'
    peliculasContainer.style.display = 'flex'
    cargarPeliculas()
  }
})

// Registro
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault()

  const email = document.getElementById('register-email').value
  const password = document.getElementById('register-password').value

  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) {
    alert('Error al registrarse: ' + error.message)
  } else {
    alert('¡Registro exitoso! Ahora inicia sesión.')
    formTitle.textContent = 'Iniciar Sesión'
    registerForm.classList.add('hidden')
    loginForm.classList.remove('hidden')
    switchText.innerHTML = `¿Nuevo en Netflix? <span id="switch-link" class="link">Regístrate ahora</span>`
  }
})

// Cambiar entre login y registro
switchText.addEventListener('click', (e) => {
  if (e.target.id === 'switch-link') {
    const isLoginVisible = !loginForm.classList.contains('hidden')
    loginForm.classList.toggle('hidden')
    registerForm.classList.toggle('hidden')
    formTitle.textContent = isLoginVisible ? 'Registrarse' : 'Iniciar Sesión'
    e.target.textContent = isLoginVisible
      ? '¿Ya tienes cuenta? Inicia sesión'
      : 'Regístrate ahora'
  }
})

// Cargar películas
async function cargarPeliculas() {
  try {
    const respuesta = await fetch(API_URL)
    if (!respuesta.ok) throw new Error('Error en la petición')
    const datos = await respuesta.json()

    peliculasContainer.innerHTML = ''

    datos.results.forEach(pelicula => {
      const div = document.createElement('div')
      div.classList.add('pelicula')
      div.innerHTML = `
        <img src="${IMG_URL + pelicula.poster_path}" alt="${pelicula.title}" />
        <h3>${pelicula.title}</h3>
        <p>${pelicula.overview.substring(0, 150)}...</p>
        <button onclick="alert('mu pronto')">Ver más</button>
      `
      peliculasContainer.appendChild(div)
    })
  } catch (error) {
    peliculasContainer.innerHTML = '<p>Hubo un error cargando las películas.</p>'
    console.error(error)
  }
}
