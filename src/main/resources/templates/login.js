// login.js - Versión REST API
const API_URL = 'http://localhost:8080';

// Verificar si ya hay sesión activa
document.addEventListener('DOMContentLoaded', () => {
    const usuario = localStorage.getItem('usuario');
    if (usuario) {
        window.location.href = '/dashboard';
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

    try {
        const response = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombreUsuario: username,
                password: password
            })
        });

        const data = await response.json();
        
        console.log('Respuesta del servidor:', data);

        if (data.ok) {
            // Guardar información del usuario en localStorage
            //localStorage.setItem('usuario', JSON.stringify(data.usuario));
            localStorage.setItem('userRole', data.usuario.rol);
            //localStorage.setItem('userName', data.usuario.nombreUsuario);
            //localStorage.setItem('userId', data.usuario.idUsuario);
            
            if (rememberMe) {
                localStorage.setItem('rememberMe', 'true');
            }
            
            showAlert('¡Inicio de sesión exitoso!', 'success');
            
            
            window.location.href = 'dashboard.html';
            
        } else {
            showAlert(data.mensaje || 'Usuario o contraseña incorrectos', 'error');
        }
        
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error de conexión con el servidor', 'error');
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