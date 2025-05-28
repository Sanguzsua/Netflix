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
const menuPerfil = document.getElementById('menu-perfil');
const modalPerfil = document.getElementById('modal-perfil');
const closeModalPerfil = document.querySelector('.close-modal-perfil');
const perfilForm = document.getElementById('perfil-form');
const perfilEmail = document.getElementById('perfil-email');
const perfilNombre = document.getElementById('perfil-nombre');

// Función para cambiar la pestaña activa
function setActiveMenu(menu) {
  document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'))
  menu.classList.add('active')
}

let peliculaActual = null; // Guardará la película/serie mostrada en el modal
const addToListBtn = document.getElementById('add-to-list-btn');

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
        peliculaActual = {
          id: pelicula.id,
          title: pelicula.title,
          overview: pelicula.overview,
          poster_path: pelicula.poster_path,
          type: 'movie'
        }
        addToListBtn.textContent = 'Agregar a Mi Lista'
        addToListBtn.onclick = addToListHandler

        // Agrega o muestra el botón de trailer
        let trailerBtn = document.getElementById('trailer-btn')
        if (!trailerBtn) {
          trailerBtn = document.createElement('button')
          trailerBtn.id = 'trailer-btn'
          trailerBtn.className = 'add-list-btn'
          trailerBtn.style.marginTop = '10px'
          addToListBtn.parentNode.insertBefore(trailerBtn, addToListBtn.nextSibling)
        }
        trailerBtn.textContent = 'Ver trailer'
        trailerBtn.onclick = async () => {
          trailerBtn.textContent = 'Cargando...'
          const url = await obtenerTrailer(pelicula.id, 'movie')
          trailerBtn.textContent = url ? 'Ver trailer' : 'No disponible'
          const trailerContainer = document.getElementById('trailer-container')
          const trailerIframe = document.getElementById('trailer-iframe')
          if (url) {
            // Extrae el ID del video de YouTube
            const videoId = url.split('v=')[1]
            trailerIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`
            trailerContainer.style.display = 'block'
          } else {
            trailerContainer.style.display = 'none'
            trailerIframe.src = ''
            showToast('Trailer no disponible', '#e87c03')
          }
        }
      })
      peliculasContainer.appendChild(div)
    })
  } catch (error) {
    peliculasContainer.innerHTML = '<p>Hubo un error cargando las películas.</p>'
    console.error(error)
  }
}

// Cerrar modal al hacer click en la X o fuera del contenido
closeModal.addEventListener('click', () => {
  modal.classList.add('hidden');
  document.getElementById('trailer-iframe').src = '';
  document.getElementById('trailer-container').style.display = 'none';
});
modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.add('hidden');
    document.getElementById('trailer-iframe').src = '';
    document.getElementById('trailer-container').style.display = 'none';
  }
});

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
  e.preventDefault();
  setActiveMenu(menuLista);
  let miLista = JSON.parse(localStorage.getItem('miListaNetflix')) || [];
  peliculasContainer.innerHTML = '';
  if (miLista.length === 0) {
    peliculasContainer.innerHTML = '<p style="color:#fff;">Tu lista está vacía.</p>';
    return;
  }
  miLista.forEach(item => {
    const div = document.createElement('div');
    div.classList.add('pelicula');
    div.innerHTML = `
      <img src="${IMG_URL + item.poster_path}" alt="${item.title}" />
      <h3>${item.title}</h3>
      <p>${item.overview.substring(0, 150)}...</p>
      <button class="ver-mas-btn">Ver más</button>
    `;
    div.querySelector('.ver-mas-btn').addEventListener('click', () => {
      modalImg.src = IMG_URL + item.poster_path;
      modalTitle.textContent = item.title;
      modalDesc.textContent = item.overview || 'Sin descripción disponible.';
      modal.classList.remove('hidden');
      peliculaActual = item;

      // Cambia el texto y función del botón
      addToListBtn.textContent = 'Borrar de Mi Lista';
      addToListBtn.onclick = () => {
        let miLista = JSON.parse(localStorage.getItem('miListaNetflix')) || [];
        miLista = miLista.filter(p => !(p.id === item.id && p.type === item.type));
        localStorage.setItem('miListaNetflix', JSON.stringify(miLista));
        showToast('Eliminado de tu lista', '#e50914');
        modal.classList.add('hidden');
        // Refresca la lista en pantalla
        menuLista.click();
      };

      // Trailer
      const trailerBtn = document.getElementById('trailer-btn');
      trailerBtn.textContent = 'Ver trailer';
      trailerBtn.onclick = async () => {
        trailerBtn.textContent = 'Cargando...';
        const url = await obtenerTrailer(item.id, item.type === 'movie' ? 'movie' : 'serie');
        trailerBtn.textContent = url ? 'Ver trailer' : 'No disponible';
        const trailerContainer = document.getElementById('trailer-container');
        const trailerIframe = document.getElementById('trailer-iframe');
        if (url) {
          // Extrae el ID del video de YouTube
          const videoId = url.split('v=')[1];
          trailerIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
          trailerContainer.style.display = 'block';
        } else {
          trailerContainer.style.display = 'none';
          trailerIframe.src = '';
          showToast('Trailer no disponible', '#e87c03');
        }
      };
    });
    peliculasContainer.appendChild(div);
  });
});


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
        peliculaActual = {
          id: serie.id,
          title: serie.name,
          overview: serie.overview,
          poster_path: serie.poster_path,
          type: 'serie'
        }
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

function addToListHandler() {
  if (!peliculaActual) return;
  let miLista = JSON.parse(localStorage.getItem('miListaNetflix')) || [];
  if (!miLista.some(item => item.id === peliculaActual.id && item.type === peliculaActual.type)) {
    miLista.push(peliculaActual);
    localStorage.setItem('miListaNetflix', JSON.stringify(miLista));
    showToast('¡Agregado a Mi Lista!', '#b00610');
  } else {
    showToast('Ya está en tu lista.', '#e87c03');
  }
}

async function obtenerTrailer(id, tipo = 'movie') {
  const url = `https://api.themoviedb.org/3/${tipo}/${id}/videos?api_key=${API_KEY}&language=es-ES`
  try {
    const res = await fetch(url)
    const data = await res.json()
    // Busca el primer trailer de YouTube
    const trailer = data.results.find(
      v => v.type === 'Trailer' && v.site === 'YouTube'
    )
    return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null
  } catch (error) {
    return null
  }
}

menuPerfil.addEventListener('click', async (e) => {
  e.preventDefault();
  setActiveMenu(menuPerfil);
  // Obtén el usuario actual de Supabase
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    perfilEmail.value = user.email || '';
    // Puedes guardar el nombre en user.user_metadata.nombre o similar
    perfilNombre.value = user.user_metadata?.nombre || '';
    modalPerfil.classList.remove('hidden');
  } else {
    showToast('Debes iniciar sesión para ver tu perfil');
  }
});

closeModalPerfil.addEventListener('click', () => {
  modalPerfil.classList.add('hidden');
});
modalPerfil.addEventListener('click', (e) => {
  if (e.target === modalPerfil) {
    modalPerfil.classList.add('hidden');
  }
});
perfilForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nombre = perfilNombre.value;
  // Actualiza el user_metadata en Supabase
  const { data, error } = await supabase.auth.updateUser({
    data: { nombre }
  });
  if (error) {
    showToast('Error al actualizar perfil: ' + error.message);
  } else {
    showToast('Perfil actualizado', '#43b581');
    modalPerfil.classList.add('hidden');
  }
});

const logoutBtn = document.getElementById('logout-btn');

logoutBtn.addEventListener('click', async () => {
  await supabase.auth.signOut();
  showToast('Sesión cerrada', '#e50914');
  modalPerfil.classList.add('hidden');
  // Opcional: recarga la página o muestra el login
  loginContainer.style.display = 'flex';
  peliculasContainer.style.display = 'none';
});
