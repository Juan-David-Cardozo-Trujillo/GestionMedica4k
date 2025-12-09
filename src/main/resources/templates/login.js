// login.js
const API_URL = 'http://localhost:8080';

// Verificar si ya hay sesión activa
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        window.location.href = 'dashboard.html';
    }
});

// Toggle mostrar/ocultar contraseña
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.querySelector('.toggle-password');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.textContent = '🙈';
    } else {
        passwordInput.type = 'password';
        toggleIcon.textContent = '👁️';
    }
}

// Manejar login
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    if (!username || !password) {
        showAlert('Por favor complete todos los campos', 'error');
        return;
    }
    
    // Mostrar loader
    const btnLogin = document.getElementById('btnLogin');
    const btnText = btnLogin.querySelector('.btn-text');
    const btnLoader = btnLogin.querySelector('.btn-loader');
    
    btnLogin.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline-block';
    const tokenUsuarioData = {
        nombreUsuario: username,
        password: password,
    };

try {
        
        const response = await fetch(`${API_URL}/login`, {
            method: "POST", 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(tokenUsuarioData)
        });

        const resultadoLogin = await response.json();
        
        
        console.log('Respuesta del servidor:', resultadoLogin, 'Status:', response.status);

        if (response.ok) { 
            
            console.log('Login exitoso para usuario:', usuario);
            localStorage.setItem('rolUsuario', resultadoLogin.rol);
            window.location.href = 'dashboard.html';

        } else {
            
            const mensajeError = resultadoLogin.mensaje || 'Usuario o Contraseña incorrecta.';
            console.error('Error de autenticación:', mensajeError);
            alert(mensajeError); 
        }

    } catch (error) {
        
        console.error('Error durante la comunicación con el servidor:', error);
        alert('No se pudo conectar con el servicio de autenticación. Verifica tu conexión.');
    }
 

        // Si llegamos aquí y la respuesta fue OK o redirigida a otro lado (dashboard), es éxito.
        if (response.ok) {
            // Login exitoso
            
            // ... Aquí va tu lógica de obtener datos (/api/usuarios/me) ...
            // ESTA PARTE QUE HICISTE ES GENIAL, MUY BUENA IDEA
            const userResponse = await fetch(`${API_URL}/api/usuarios/me`, {
                 credentials: 'include' // Importante para enviar la cookie recién creada
            });

            if (userResponse.ok) {
                const userData = await userResponse.json();
                // ... guardar en localStorage ...
                
                showAlert('¡Inicio de sesión exitoso!', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html'; // Ojo: Asegúrate que sea .html o la ruta de Thymeleaf (/dashboard)
                }, 1000);
            } else {
                 console.error("No se pudieron cargar los datos del usuario");
                 // Aún así redirigimos porque el login en sí fue exitoso
                 window.location.href = 'dashboard.html';
            }
        } 

    } catch (error) {
        console.error('Error:', error);
        // Aquí caerá si lanzamos el error de 'Credenciales incorrectas' arriba
        const mensaje = error.message === 'Credenciales incorrectas' 
            ? 'Usuario o contraseña incorrectos' 
            : 'Error de conexión con el servidor';
            
        showAlert(mensaje, 'error');
    } finally {
        // Restaurar botón
        btnLogin.disabled = false;
        btnText.style.display = 'inline-block';
        btnLoader.style.display = 'none';
    }
}

// Mostrar alerta
function showAlert(message, type) {
    const alert = document.getElementById('alert');
    alert.textContent = message;
    alert.className = `alert alert-${type}`;
    alert.style.display = 'block';
    
    setTimeout(() => {
        alert.style.display = 'none';
    }, 4000);
}

// Manejar "Enter" en el formulario
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const form = document.getElementById('loginForm');
        form.dispatchEvent(new Event('submit'));
    }
});