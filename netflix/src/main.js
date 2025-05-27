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
const categoryForm = document.getElementById('category-form')
const categorySelect = document.getElementById('category-select')

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
    showToast('Error al iniciar sesión: ' + error.message)
  } else {
    showToast('¡Inicio de sesión exitoso!', '#e50914')
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
    showToast('Error al registrarse: ' + error.message)
  } else {
    showToast('¡Registro exitoso! Ahora inicia sesión.', '#e50914')
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

// Cargar categorías al iniciar
async function cargarCategorias() {
  const url = `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=es-ES`
  try {
    const res = await fetch(url)
    const data = await res.json()
    data.genres.forEach(cat => {
      const option = document.createElement('option')
      option.value = cat.id
      option.textContent = cat.name
      categorySelect.appendChild(option)
    })
  } catch (error) {
    console.error('Error cargando categorías', error)
  }
}

// Filtrar películas por categoría
categoryForm.addEventListener('submit', async (e) => {
  e.preventDefault()
  const genreId = categorySelect.value
  let url = API_URL
  if (genreId) {
    url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=es-ES&with_genres=${genreId}`
  }
  await cargarPeliculas(url)
})

// Filtrar películas automáticamente al cambiar la categoría
categorySelect.addEventListener('change', async () => {
  const genreId = categorySelect.value
  let url = API_URL
  if (genreId) {
    url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=es-ES&with_genres=${genreId}`
  }
  await cargarPeliculas(url)
})

// Referencias al modal
const modal = document.getElementById('modal-pelicula')
const modalImg = document.getElementById('modal-img')
const modalTitle = document.getElementById('modal-title')
const modalDesc = document.getElementById('modal-desc')
const closeModal = document.querySelector('.close-modal')

// Referencias a los botones del menú
const menuInicio = document.getElementById('menu-inicio')
const menuSeries = document.getElementById('menu-series')
const menuPeliculas = document.getElementById('menu-peliculas')
const menuNovedades = document.getElementById('menu-novedades')
const menuLista = document.getElementById('menu-lista')

// Función para cambiar la pestaña activa
function setActiveMenu(menu) {
  document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'))
  menu.classList.add('active')
}

async function cargarPeliculas(url = API_URL) {
  try {
    const respuesta = await fetch(url)
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
        <button class="ver-mas-btn">Ver más</button>
      `
      // Evento para abrir el modal
      div.querySelector('.ver-mas-btn').addEventListener('click', () => {
        modalImg.src = IMG_URL + pelicula.poster_path
        modalTitle.textContent = pelicula.title
        modalDesc.textContent = pelicula.overview || 'Sin descripción disponible.'
        modal.classList.remove('hidden')
      })
      peliculasContainer.appendChild(div)
    })
  } catch (error) {
    peliculasContainer.innerHTML = '<p>Hubo un error cargando las películas.</p>'
    console.error(error)
  }
}

// Cerrar modal al hacer click en la X o fuera del contenido
closeModal.addEventListener('click', () => modal.classList.add('hidden'))
modal.addEventListener('click', (e) => {
  if (e.target === modal) modal.classList.add('hidden')
})

// Llama a cargarCategorias al iniciar
cargarCategorias()

// Inicio: populares
menuInicio.addEventListener('click', async (e) => {
  e.preventDefault()
  setActiveMenu(menuInicio)
  await cargarPeliculas(API_URL)
})

// Películas: populares 
menuPeliculas.addEventListener('click', async (e) => {
  e.preventDefault()
  setActiveMenu(menuPeliculas)
  await cargarPeliculas(API_URL)
})

// Series: muestra series populares
menuSeries.addEventListener('click', async (e) => {
  e.preventDefault()
  setActiveMenu(menuSeries)
  const url = `https://api.themoviedb.org/3/tv/popular?api_key=${API_KEY}&language=es-ES&page=1`
  await cargarSeries(url)
})

// Novedades: películas recientes
menuNovedades.addEventListener('click', async (e) => {
  e.preventDefault()
  setActiveMenu(menuNovedades)
  const url = `https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}&language=es-ES&page=1`
  await cargarPeliculas(url)
})


menuLista.addEventListener('click', (e) => {
  e.preventDefault()
  setActiveMenu(menuLista)
  peliculasContainer.innerHTML = '<p style="color:#fff;">Funcionalidad de "Mi lista" próximamente.</p>'
})


async function cargarSeries(url) {
  try {
    const respuesta = await fetch(url)
    if (!respuesta.ok) throw new Error('Error en la petición')
    const datos = await respuesta.json()

    peliculasContainer.innerHTML = ''

    datos.results.forEach(serie => {
      const div = document.createElement('div')
      div.classList.add('pelicula')
      div.innerHTML = `
        <img src="${IMG_URL + serie.poster_path}" alt="${serie.name}" />
        <h3>${serie.name}</h3>
        <p>${serie.overview.substring(0, 150)}...</p>
        <button class="ver-mas-btn">Ver más</button>
      `
      div.querySelector('.ver-mas-btn').addEventListener('click', () => {
        modalImg.src = IMG_URL + serie.poster_path
        modalTitle.textContent = serie.name
        modalDesc.textContent = serie.overview || 'Sin descripción disponible.'
        modal.classList.remove('hidden')
      })
      peliculasContainer.appendChild(div)
    })
  } catch (error) {
    peliculasContainer.innerHTML = '<p>Hubo un error cargando las series.</p>'
    console.error(error)
  }
}

function showToast(message, color = '#e50914') {
  const toast = document.getElementById('toast')
  toast.textContent = message
  toast.style.background = color
  toast.classList.remove('hidden')
  setTimeout(() => {
    toast.classList.add('hidden')
  }, 2500)
}
