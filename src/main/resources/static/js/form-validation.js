// src/main/resources/static/js/form-validation.js

/**
 * Sistema HIS+ - Validaciones de Formularios
 * Validaciones específicas para cada tipo de formulario
 */

document.addEventListener('DOMContentLoaded', function() {
    initFormValidations();
});

/**
 * Inicializar todas las validaciones
 */
function initFormValidations() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', handleFormSubmit);
        addRealTimeValidation(form);
    });
    
    // Validaciones específicas
    validatePacienteForm();
    validateEmpleadoForm();
    validateCitaForm();
    validateEquipamientoForm();
    validateUsuarioForm();
}

/**
 * Manejar envío de formulario
 */
function handleFormSubmit(e) {
    const form = e.target;
    
    if (!validateRequiredFields(form)) {
        e.preventDefault();
        showError('Por favor complete todos los campos requeridos');
        return false;
    }
    
    // Mostrar indicador de carga
    showLoadingIndicator(form);
    return true;
}

/**
 * Validar campos requeridos
 */
function validateRequiredFields(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            markFieldAsInvalid(field);
        } else {
            markFieldAsValid(field);
        }
    });
    
    return isValid;
}

/**
 * Marcar campo como inválido
 */
function markFieldAsInvalid(field) {
    field.style.borderColor = '#dc3545';
    field.style.background = '#fff5f5';
    
    // Agregar mensaje de error si no existe
    let errorMsg = field.parentElement.querySelector('.error-message');
    if (!errorMsg) {
        errorMsg = document.createElement('small');
        errorMsg.className = 'error-message';
        errorMsg.style.color = '#dc3545';
        errorMsg.textContent = 'Este campo es obligatorio';
        field.parentElement.appendChild(errorMsg);
    }
}

/**
 * Marcar campo como válido
 */
function markFieldAsValid(field) {
    field.style.borderColor = '#28a745';
    field.style.background = '#f5fff5';
    
    // Remover mensaje de error
    const errorMsg = field.parentElement.querySelector('.error-message');
    if (errorMsg) errorMsg.remove();
    
    // Remover estilos después de 1 segundo
    setTimeout(() => {
        field.style.borderColor = '';
        field.style.background = '';
    }, 1000);
}

/**
 * Agregar validación en tiempo real
 */
function addRealTimeValidation(form) {
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.hasAttribute('required') && !this.value.trim()) {
                markFieldAsInvalid(this);
            } else if (this.value.trim()) {
                markFieldAsValid(this);
            }
        });
        
        input.addEventListener('input', function() {
            if (this.value.trim()) {
                const errorMsg = this.parentElement.querySelector('.error-message');
                if (errorMsg) errorMsg.remove();
                this.style.borderColor = '';
                this.style.background = '';
            }
        });
    });
}

/**
 * Validaciones específicas para formulario de Paciente
 */
function validatePacienteForm() {
    const form = document.querySelector('form[action*="pacientes"]');
    if (!form) return;
    
    const codPaciente = form.querySelector('[name="codPaciente"]');
    const direccion = form.querySelector('[name="dirPaciente"]');
    
    if (codPaciente) {
        codPaciente.addEventListener('input', function() {
            if (this.value < 0) {
                this.value = 0;
            }
        });
    }
    
    if (direccion) {
        direccion.addEventListener('input', function() {
            if (this.value.length > 50) {
                showError('La dirección no puede exceder 50 caracteres');
                this.value = this.value.substring(0, 50);
            }
        });
    }
}

/**
 * Validaciones específicas para formulario de Empleado
 */
function validateEmpleadoForm() {
    const form = document.querySelector('form[action*="empleados"]');
    if (!form) return;
    
    const cargo = form.querySelector('[name="cargo"]');
    
    if (cargo) {
        cargo.addEventListener('input', function() {
            // Capitalizar primera letra de cada palabra
            this.value = this.value.replace(/\b\w/g, char => char.toUpperCase());
        });
    }
}

/**
 * Validaciones específicas para formulario de Cita
 */
function validateCitaForm() {
    const form = document.querySelector('form[action*="citas"]');
    if (!form) return;
    
    const fechaInput = form.querySelector('[name="fecha"]');
    const horaInput = form.querySelector('[name="hora"]');
    
    if (fechaInput) {
        fechaInput.addEventListener('change', function() {
            const selectedDate = new Date(this.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate < today) {
                showError('No puede seleccionar una fecha pasada');
                this.value = '';
            }
        });
    }
    
    if (horaInput && fechaInput) {
        horaInput.addEventListener('change', function() {
            validateDateTime(fechaInput, horaInput);
        });
    }
}

/**
 * Validar fecha y hora combinadas
 */
function validateDateTime(dateField, timeField) {
    if (!dateField.value || !timeField.value) return;
    
    const selectedDate = new Date(dateField.value + 'T' + timeField.value);
    const now = new Date();
    
    if (selectedDate < now) {
        showError('La fecha y hora deben ser futuras');
        timeField.value = '';
        return false;
    }
    
    // Validar horario laboral (8:00 AM - 6:00 PM)
    const hours = parseInt(timeField.value.split(':')[0]);
    if (hours < 8 || hours >= 18) {
        showError('El horario debe estar entre 8:00 AM y 6:00 PM');
        timeField.value = '';
        return false;
    }
    
    return true;
}

/**
 * Validaciones específicas para formulario de Equipamiento
 */
function validateEquipamientoForm() {
    const form = document.querySelector('form[action*="equipamientos"]');
    if (!form) return;
    
    const nombreEquip = form.querySelector('[name="nombreEquip"]');
    const estado = form.querySelector('[name="estado"]');
    
    if (nombreEquip) {
        nombreEquip.addEventListener('input', function() {
            // Capitalizar primera letra
            this.value = this.value.charAt(0).toUpperCase() + this.value.slice(1);
        });
    }
    
    if (estado) {
        estado.addEventListener('change', function() {
            const fechaMantenimiento = form.querySelector('[name="fechaMantenimiento"]');
            if (this.value === 'En Mantenimiento' && fechaMantenimiento) {
                fechaMantenimiento.style.borderColor = '#ffc107';
                showWarning('Recuerde actualizar la fecha de mantenimiento');
            }
        });
    }
}

/**
 * Validaciones específicas para formulario de Usuario
 */
function validateUsuarioForm() {
    const form = document.querySelector('form[action*="usuarios"]');
    if (!form) return;
    
    const nombreUsuario = form.querySelector('[name="nombreUsuario"]');
    const password = form.querySelector('[name="contrasenaEncriptada"]');
    
    if (nombreUsuario) {
        nombreUsuario.addEventListener('input', function() {
            // Solo permitir letras, números y guiones bajos
            this.value = this.value.replace(/[^a-zA-Z0-9_]/g, '');
            
            if (this.value.length < 4) {
                markFieldAsInvalid(this);
                const errorMsg = this.parentElement.querySelector('.error-message');
                if (errorMsg) {
                    errorMsg.textContent = 'El usuario debe tener al menos 4 caracteres';
                }
            }
        });
    }
    
    if (password) {
        // Agregar indicador de fortaleza de contraseña
        addPasswordStrengthIndicator(password);
        
        password.addEventListener('input', function() {
            validatePasswordStrength(this);
        });
    }
}

/**
 * Agregar indicador de fortaleza de contraseña
 */
function addPasswordStrengthIndicator(passwordField) {
    const indicator = document.createElement('div');
    indicator.className = 'password-strength';
    indicator.innerHTML = `
        <div class="strength-bar">
            <div class="strength-fill"></div>
        </div>
        <small class="strength-text">Ingrese su contraseña</small>
    `;
    passwordField.parentElement.appendChild(indicator);
    
    // Agregar estilos
    const style = document.createElement('style');
    style.textContent = `
        .password-strength {
            margin-top: 5px;
        }
        .strength-bar {
            height: 5px;
            background: #e0e0e0;
            border-radius: 3px;
            overflow: hidden;
        }
        .strength-fill {
            height: 100%;
            width: 0%;
            transition: all 0.3s;
        }
        .strength-text {
            display: block;
            margin-top: 5px;
            font-size: 12px;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Validar fortaleza de contraseña
 */
function validatePasswordStrength(passwordField) {
    const password = passwordField.value;
    const indicator = passwordField.parentElement.querySelector('.password-strength');
    const fill = indicator.querySelector('.strength-fill');
    const text = indicator.querySelector('.strength-text');
    
    let strength = 0;
    let strengthText = '';
    let color = '';
    
    if (password.length >= 8) strength += 25;
    if (password.match(/[a-z]/)) strength += 25;
    if (password.match(/[A-Z]/)) strength += 25;
    if (password.match(/[0-9]/)) strength += 25;
    
    if (strength <= 25) {
        strengthText = 'Débil';
        color = '#dc3545';
    } else if (strength <= 50) {
        strengthText = 'Regular';
        color = '#ffc107';
    } else if (strength <= 75) {
        strengthText = 'Buena';
        color = '#17a2b8';
    } else {
        strengthText = 'Fuerte';
        color = '#28a745';
    }
    
    fill.style.width = strength + '%';
    fill.style.background = color;
    text.textContent = strengthText;
    text.style.color = color;
}

/**
 * Mostrar indicador de carga
 */
function showLoadingIndicator(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Guardando...</span>';
    }
}

/**
 * Mostrar error
 */
function showError(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-danger';
    alert.textContent = message;
    alert.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999;';
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.style.opacity = '0';
        setTimeout(() => alert.remove(), 500);
    }, 3000);
}

/**
 * Mostrar advertencia
 */
function showWarning(message) {
    const alert = document.createElement('div');
    alert.className = 'alert';
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        background: #fff3cd;
        color: #856404;
        padding: 12px 20px;
        border-radius: 5px;
        border: 1px solid #ffeaa7;
    `;
    alert.textContent = message;
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.style.opacity = '0';
        setTimeout(() => alert.remove(), 500);
    }, 3000);
}