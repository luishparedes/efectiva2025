// ============================================
// CONFIGURACIÓN DE CLAVES DE ACCESO
// ============================================
// AQUÍ ES DONDE VAS A AGREGAR/EDITAR LAS CLAVES
// Formato: Letra-Número-Letra-Número (4 dígitos)
// Ejemplos: A1B2, C3D4, E5F6, X9Y8
// ============================================

const ACCESS_KEYS = [
    "A1B4",  // Clave ejemplo 1
    "C3D4",  // Clave ejemplo 2  
    "E5F6",  // Clave ejemplo 3
    "X9Y8",  // Clave ejemplo 4
    "Z7W3"   // Clave ejemplo 5
];

// ============================================
// NO MODIFIQUES NADA DEBAJO DE ESTA LÍNEA
// A MENOS QUE SEPAS LO QUE ESTÁS HACIENDO
// ============================================

// Variables globales
let currentUser = {
    nombre: 'Usuario PPB',
    email: 'usuario@ppb.com',
    plan: 'pro',
    activo: true,
    accessKey: '',
    sessionStart: null
};

let companyData = null;
let cobranzas = [];
let proveedores = [];
let mensajes = [];
let abonos = [];
let pagosProveedores = [];
let actividades = [];
let statusChart = null;
let currentTab = 'all';
let currentTabProv = 'all-prov';
let isAuthenticated = false;

// Elementos DOM
const authScreen = document.getElementById('authScreen');
const appContainer = document.getElementById('appContainer');
const authForm = document.getElementById('authForm');
const authMessage = document.getElementById('authMessage');
const accessKeyInput = document.getElementById('accessKey');
const userNameInput = document.getElementById('userName');
const displayUserName = document.getElementById('displayUserName');

// Elementos de la aplicación principal
const dashboard = document.getElementById('dashboard');
const cobranzasSection = document.getElementById('cobranzas');
const proveedoresSection = document.getElementById('proveedores');
const mensajesSection = document.getElementById('mensajes');
const empresaSection = document.getElementById('empresa');
const userInfo = document.getElementById('userInfo');
const userAvatar = document.getElementById('userAvatar');
const userPlanBadge = document.getElementById('userPlanBadge');
const logoutBtn = document.getElementById('logoutBtn');
const notificationBtn = document.getElementById('notificationBtn');
const notificationBadge = document.getElementById('notificationBadge');
const notificationCenter = document.getElementById('notificationCenter');
const closeNotifications = document.getElementById('closeNotifications');
const notificationList = document.getElementById('notificationList');
const companyForm = document.getElementById('companyForm');
const cobranzaForm = document.getElementById('cobranzaForm');
const proveedorForm = document.getElementById('proveedorForm');
const abonoForm = document.getElementById('abonoForm');
const pagoProveedorForm = document.getElementById('pagoProveedorForm');
const messageForm = document.getElementById('messageForm');
const navLinks = document.querySelectorAll('.nav-link');
const tabs = document.querySelectorAll('.tab');
const cobranzasTableBody = document.getElementById('cobranzasTableBody');
const proveedoresTableBody = document.getElementById('proveedoresTableBody');
const messagesTableBody = document.getElementById('messagesTableBody');
const addCobranzaBtn = document.getElementById('addCobranzaBtn');
const addCobranzaBtn2 = document.getElementById('addCobranzaBtn2');
const addProveedorBtn = document.getElementById('addProveedorBtn');
const addProveedorBtn2 = document.getElementById('addProveedorBtn2');
const addMessageBtn = document.getElementById('addMessageBtn');
const exportExcelBtn = document.getElementById('exportExcelBtn');
const exportProveedoresBtn = document.getElementById('exportProveedoresBtn');
const cobranzaModal = document.getElementById('cobranzaModal');
const proveedorModal = document.getElementById('proveedorModal');
const abonoModal = document.getElementById('abonoModal');
const pagoProveedorModal = document.getElementById('pagoProveedorModal');
const messageModal = document.getElementById('messageModal');
const reciboModal = document.getElementById('reciboModal');
const closeModals = document.querySelectorAll('.close-modal');
const cobranzaModalTitle = document.getElementById('cobranzaModalTitle');
const proveedorModalTitle = document.getElementById('proveedorModalTitle');
const cobranzaSubmitBtn = document.getElementById('cobranzaSubmitBtn');
const proveedorSubmitBtn = document.getElementById('proveedorSubmitBtn');
const cobranzaIdInput = document.getElementById('cobranzaId');
const proveedorIdInput = document.getElementById('proveedorId');
const printReciboBtn = document.getElementById('printReciboBtn');
const sendReciboBtn = document.getElementById('sendReciboBtn');
const copyNotification = document.getElementById('copyNotification');
const messageChannel = document.getElementById('messageChannel');
const messageIcon = document.getElementById('messageIcon');
const messageText = document.getElementById('messageText');
const upcomingList = document.getElementById('upcomingList');

// ============================================
// SISTEMA DE SEGURIDAD
// ============================================

// Proteger contra F12 y herramientas de desarrollador
function setupSecurity() {
    console.log("🛡️ Configurando sistema de seguridad...");
    
    // Deshabilitar F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
    document.addEventListener('keydown', function(e) {
        // Detectar F12
        if (e.key === 'F12') {
            e.preventDefault();
            showNotification('Acceso a herramientas de desarrollador deshabilitado', 'warning');
            return false;
        }
        
        // Detectar Ctrl+Shift+I (Chrome/Firefox/Edge)
        if (e.ctrlKey && e.shiftKey && e.key === 'I') {
            e.preventDefault();
            showNotification('Acceso a herramientas de desarrollador deshabilitado', 'warning');
            return false;
        }
        
        // Detectar Ctrl+Shift+J (Chrome Console)
        if (e.ctrlKey && e.shiftKey && e.key === 'J') {
            e.preventDefault();
            showNotification('Acceso a herramientas de desarrollador deshabilitado', 'warning');
            return false;
        }
        
        // Detectar Ctrl+U (Ver código fuente)
        if (e.ctrlKey && e.key === 'u') {
            e.preventDefault();
            showNotification('Acceso al código fuente deshabilitado', 'warning');
            return false;
        }
    });
    
    // Protección contra clic derecho
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        showNotification('Menú contextual deshabilitado por seguridad', 'warning');
        return false;
    }, false);
    
    // Protección para móviles (solo prevenir F12, no afectar otras funcionalidades)
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        console.log("📱 Dispositivo móvil detectado, ajustando seguridad...");
        // En móviles, solo deshabilitamos el menú contextual
        document.removeEventListener('keydown', arguments.callee);
    }
    
    console.log("✅ Sistema de seguridad configurado");
}

// Validar clave de acceso
function validateAccessKey(key) {
    // Limpiar y normalizar la clave
    key = key.trim().toUpperCase();
    
    // Validar formato: Letra-Número-Letra-Número
    const keyRegex = /^[A-Z][0-9][A-Z][0-9]$/;
    if (!keyRegex.test(key)) {
        return {
            valid: false,
            message: 'Formato inválido. Use: Letra, Número, Letra, Número (ej: A1B2)'
        };
    }
    
    // Verificar si la clave está en la lista autorizada
    if (!ACCESS_KEYS.includes(key)) {
        return {
            valid: false,
            message: 'Clave de acceso incorrecta'
        };
    }
    
    return {
        valid: true,
        message: 'Clave válida'
    };
}

// Mostrar mensaje de autenticación
function showAuthMessage(message, type = 'danger') {
    if (!authMessage) return;
    
    authMessage.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    authMessage.className = `alert alert-${type}`;
    authMessage.style.display = 'flex';
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
        authMessage.style.display = 'none';
    }, 5000);
}

// Iniciar sesión
function login(accessKey, userName = '') {
    console.log("🔑 Intentando inicio de sesión...");
    
    const validation = validateAccessKey(accessKey);
    if (!validation.valid) {
        showAuthMessage(validation.message, 'danger');
        accessKeyInput.focus();
        return false;
    }
    
    // Configurar usuario
    currentUser.accessKey = accessKey;
    currentUser.sessionStart = new Date();
    
    if (userName && userName.trim() !== '') {
        currentUser.nombre = userName.trim();
    }
    
    isAuthenticated = true;
    
    // Mostrar mensaje de éxito
    showAuthMessage('Acceso autorizado. Iniciando sesión...', 'success');
    
    // Transición suave
    setTimeout(() => {
        // Ocultar pantalla de autenticación
        authScreen.style.opacity = '0';
        authScreen.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            authScreen.style.display = 'none';
            appContainer.style.display = 'block';
            
            // Inicializar aplicación
            initializeApp();
            
            // Registrar actividad
            registrarActividad('sistema', `Inicio de sesión - Clave: ${accessKey}`, `Usuario: ${currentUser.nombre}`);
            
            // Mostrar notificación de bienvenida
            showNotification(`Bienvenido ${currentUser.nombre}`, 'success');
            showNotificationInCenter('Sesión iniciada', `Acceso autorizado con clave: ${accessKey}`, 'success');
        }, 300);
    }, 1000);
    
    return true;
}

// Cerrar sesión
function logout() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        // Registrar actividad
        registrarActividad('sistema', 'Cierre de sesión', `Usuario: ${currentUser.nombre}, Duración: ${Math.round((new Date() - currentUser.sessionStart) / 60000)} minutos`);
        
        // Limpiar datos de sesión
        currentUser.accessKey = '';
        currentUser.sessionStart = null;
        isAuthenticated = false;
        
        // Mostrar pantalla de autenticación
        appContainer.style.display = 'none';
        authScreen.style.display = 'flex';
        authScreen.style.opacity = '1';
        authScreen.style.transform = 'translateY(0)';
        
        // Limpiar formulario
        if (authForm) authForm.reset();
        if (authMessage) authMessage.style.display = 'none';
        
        // Limpiar notificaciones
        if (notificationList) notificationList.innerHTML = '';
        if (notificationBadge) notificationBadge.style.display = 'none';
        
        showNotification('Sesión cerrada correctamente', 'info');
    }
}

// Verificar autenticación antes de acciones críticas
function requireAuth(action) {
    if (!isAuthenticated) {
        showNotification('Debe iniciar sesión para realizar esta acción', 'warning');
        return false;
    }
    return true;
}

// ============================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ============================================

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Aplicación iniciada");
    
    // Configurar seguridad
    setupSecurity();
    
    // Configurar formulario de autenticación
    if (authForm) {
        authForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const accessKey = accessKeyInput.value.trim();
            const userName = userNameInput.value.trim();
            
            if (!accessKey) {
                showAuthMessage('Por favor ingrese la clave de acceso', 'warning');
                accessKeyInput.focus();
                return;
            }
            
            login(accessKey, userName);
        });
        
        // Validación en tiempo real
        accessKeyInput.addEventListener('input', function() {
            const value = this.value.toUpperCase();
            this.value = value;
            
            // Validar formato básico
            if (value.length === 4) {
                const keyRegex = /^[A-Z][0-9][A-Z][0-9]$/;
                if (!keyRegex.test(value)) {
                    this.style.borderColor = 'var(--danger)';
                    showAuthMessage('Formato: Letra, Número, Letra, Número', 'warning');
                } else {
                    this.style.borderColor = 'var(--success)';
                    authMessage.style.display = 'none';
                }
            } else {
                this.style.borderColor = '';
                authMessage.style.display = 'none';
            }
        });
    }
    
    // Configurar logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Configurar inputs de teléfono
    setupPhoneInput();
    
    console.log("✅ Sistema listo para autenticación");
});

// Inicializar aplicación después de login
function initializeApp() {
    console.log("🏠 Inicializando aplicación principal...");
    
    // Configurar navegación
    setupNavigation();
    
    // Configurar notificaciones
    setupNotifications();
    
    // Configurar cambio de ícono en mensajes
    setupMessageChannelListener();
    
    // Configurar modales y formularios
    setupModals();
    setupForms();
    setupTabs();
    
    // Cargar datos iniciales
    loadInitialData();
    
    // Actualizar UI del usuario
    updateUserUI();
}

// ============================================
// FUNCIONALIDADES EXISTENTES (modificadas para seguridad)
// ============================================

// Configurar sistema de notificaciones
function setupNotifications() {
    console.log("🔔 Configurando notificaciones...");
    
    if (notificationBtn) {
        notificationBtn.addEventListener('click', function() {
            if (!requireAuth('ver notificaciones')) return;
            notificationCenter.classList.toggle('active');
        });
    }
    
    if (closeNotifications) {
        closeNotifications.addEventListener('click', function() {
            notificationCenter.classList.remove('active');
        });
    }
    
    // Cerrar notificaciones al hacer clic fuera
    window.addEventListener('click', function(e) {
        if (notificationCenter && !notificationCenter.contains(e.target) && notificationBtn && !notificationBtn.contains(e.target)) {
            notificationCenter.classList.remove('active');
        }
    });
}

// Mostrar notificación en el centro de notificaciones
function showNotificationInCenter(title, message, type = 'info') {
    if (!notificationList || !requireAuth('ver notificaciones')) return;
    
    const notificationItem = document.createElement('div');
    notificationItem.className = `notification-item ${type}`;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    
    notificationItem.innerHTML = `
        <div class="notification-title">${title}</div>
        <div class="notification-message">${message}</div>
        <div class="notification-time">${timeString}</div>
    `;
    
    notificationList.insertBefore(notificationItem, notificationList.firstChild);
    
    // Actualizar badge
    updateNotificationBadge();
    
    // Auto-eliminar después de 10 segundos
    setTimeout(() => {
        if (notificationItem.parentNode) {
            notificationItem.remove();
            updateNotificationBadge();
        }
    }, 10000);
}

// Actualizar badge de notificaciones
function updateNotificationBadge() {
    if (!notificationBadge || !notificationList) return;
    
    const count = notificationList.children.length;
    if (count > 0) {
        notificationBadge.textContent = count > 99 ? '99+' : count;
        notificationBadge.style.display = 'flex';
    } else {
        notificationBadge.style.display = 'none';
    }
}

// Configurar inputs de teléfono
function setupPhoneInput() {
    console.log("📞 Configurando inputs de teléfono...");
    
    const phoneInputs = [
        document.getElementById('clientPhone'),
        document.getElementById('proveedorPhone')
    ];
    
    phoneInputs.forEach(input => {
        if (input) {
            input.addEventListener('input', function(e) {
                let value = e.target.value.replace(/[^\d]/g, ''); // Solo números
                
                // Validar que sea un número venezolano válido
                if (value.length > 0 && !value.startsWith('4')) {
                    showNotification('Los números venezolanos deben comenzar con 4', 'warning');
                    value = value.substring(1); // Remover primer carácter inválido
                }
                
                // Formato automático: 412-1234567 (solo un guión)
                if (value.length > 3 && value.length <= 10) {
                    value = value.substring(0, 3) + '-' + value.substring(3);
                }
                
                // Limitar a 11 caracteres máximo (3+1+7)
                if (value.length > 11) {
                    value = value.substring(0, 11);
                }
                
                e.target.value = value;
                
                // Validar en tiempo real
                if (value.length >= 11 && !validatePhoneNumber(value)) {
                    input.style.borderColor = 'var(--danger)';
                } else {
                    input.style.borderColor = '';
                }
            });
            
            input.addEventListener('keydown', function(e) {
                // Permitir teclas de control, números y guión
                if (
                    e.key === 'Backspace' || e.key === 'Delete' || e.key === 'Tab' || 
                    e.key === 'ArrowLeft' || e.key === 'ArrowRight' ||
                    (e.key >= '0' && e.key <= '9') || e.key === '-'
                ) {
                    return;
                }
                e.preventDefault();
            });
            
            // Establecer placeholder de ejemplo
            input.placeholder = '412-1234567';
            
            // Agregar validación al perder foco
            input.addEventListener('blur', function() {
                if (this.value && !validatePhoneNumber(this.value)) {
                    showNotification('Número de teléfono venezolano inválido. Formato: 412-1234567', 'warning');
                    this.focus();
                }
            });
        }
    });
}

// Validar número de teléfono
function validatePhoneNumber(phone) {
    const phoneRegex = /^(\+58|58)?(4(1[2-9]|2[0-9]|3[0-9]|4[0-9]))-?\d{7}$/;
    return phoneRegex.test(phone.replace(/-/g, ''));
}

// Configurar cambio de ícono en mensajes
function setupMessageChannelListener() {
    if (messageChannel) {
        messageChannel.addEventListener('change', function() {
            const channel = this.value;
            if (channel === 'whatsapp') {
                messageIcon.className = 'fab fa-whatsapp';
                messageText.textContent = 'Enviar por WhatsApp';
            } else {
                messageIcon.className = 'fas fa-envelope';
                messageText.textContent = 'Copiar para Email';
            }
        });
    }
}

// Cargar datos iniciales
function loadInitialData() {
    console.log("📂 Cargando datos iniciales...");
    
    // Cargar datos del localStorage
    loadFromLocalStorage();
    
    // Actualizar UI
    updateCobranzasUI();
    updateProveedoresUI();
    updateDashboardStats();
    updateUpcomingList();
    updateRecentActivityUI();
    
    // Mostrar notificación de bienvenida
    showNotificationInCenter('Sistema cargado', 'Datos cargados correctamente', 'success');
}

// Cargar datos del localStorage
function loadFromLocalStorage() {
    try {
        companyData = JSON.parse(localStorage.getItem('ppb_companyData')) || {};
        cobranzas = JSON.parse(localStorage.getItem('ppb_cobranzas')) || [];
        proveedores = JSON.parse(localStorage.getItem('ppb_proveedores')) || [];
        mensajes = JSON.parse(localStorage.getItem('ppb_mensajes')) || [];
        abonos = JSON.parse(localStorage.getItem('ppb_abonos')) || [];
        pagosProveedores = JSON.parse(localStorage.getItem('ppb_pagosProveedores')) || [];
        actividades = JSON.parse(localStorage.getItem('ppb_actividades')) || [];
        
        console.log("✅ Datos cargados del localStorage");
    } catch (error) {
        console.error("❌ Error al cargar datos del localStorage:", error);
        // Inicializar datos vacíos si hay error
        companyData = {};
        cobranzas = [];
        proveedores = [];
        mensajes = [];
        abonos = [];
        pagosProveedores = [];
        actividades = [];
    }
}

// Guardar datos en localStorage
function saveToLocalStorage() {
    try {
        localStorage.setItem('ppb_companyData', JSON.stringify(companyData));
        localStorage.setItem('ppb_cobranzas', JSON.stringify(cobranzas));
        localStorage.setItem('ppb_proveedores', JSON.stringify(proveedores));
        localStorage.setItem('ppb_mensajes', JSON.stringify(mensajes));
        localStorage.setItem('ppb_abonos', JSON.stringify(abonos));
        localStorage.setItem('ppb_pagosProveedores', JSON.stringify(pagosProveedores));
        localStorage.setItem('ppb_actividades', JSON.stringify(actividades));
        console.log("💾 Datos guardados en localStorage");
    } catch (error) {
        console.error("❌ Error al guardar datos en localStorage:", error);
    }
}

// Mostrar notificación
function showNotification(message, type = 'info') {
    console.log(`📢 Notificación: ${message}`);
    
    const notification = document.createElement('div');
    notification.className = `alert alert-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(notification, container.firstChild);
    }
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Mostrar notificación de copiado
function showCopyNotification() {
    if (copyNotification) {
        copyNotification.classList.add('show');
        setTimeout(() => {
            copyNotification.classList.remove('show');
        }, 3000);
    }
}

// Copiar texto al portapapeles
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showCopyNotification();
    }).catch(err => {
        console.error('Error al copiar: ', err);
        // Fallback para navegadores antiguos
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showCopyNotification();
    });
}

// Actualizar UI del usuario
function updateUserUI() {
    console.log("👤 Actualizando UI del usuario");
    
    if (displayUserName) displayUserName.textContent = currentUser.nombre;
    if (userAvatar) userAvatar.textContent = currentUser.nombre.charAt(0).toUpperCase();
    
    if (userPlanBadge) {
        userPlanBadge.textContent = currentUser.plan === 'free' ? 'Free' : 'Pro';
        userPlanBadge.className = `plan-badge plan-${currentUser.plan}`;
    }
}

// Configurar navegación
function setupNavigation() {
    console.log("🧭 Configurando navegación");
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (!requireAuth('navegar')) return;
            
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            if (dashboard) dashboard.style.display = 'none';
            if (cobranzasSection) cobranzasSection.style.display = 'none';
            if (proveedoresSection) proveedoresSection.style.display = 'none';
            if (mensajesSection) mensajesSection.style.display = 'none';
            if (empresaSection) empresaSection.style.display = 'none';
            
            const target = this.getAttribute('data-target');
            const targetElement = document.getElementById(target);
            if (targetElement) {
                targetElement.style.display = 'block';
            }
        });
    });
}

// Configurar modales
function setupModals() {
    console.log("📦 Configurando modales");
    
    if (addCobranzaBtn) {
        addCobranzaBtn.addEventListener('click', function() {
            if (!requireAuth('agregar cobranza')) return;
            openCobranzaModal();
        });
    }
    if (addCobranzaBtn2) {
        addCobranzaBtn2.addEventListener('click', function() {
            if (!requireAuth('agregar cobranza')) return;
            openCobranzaModal();
        });
    }
    if (addProveedorBtn) {
        addProveedorBtn.addEventListener('click', function() {
            if (!requireAuth('agregar proveedor')) return;
            openProveedorModal();
        });
    }
    if (addProveedorBtn2) {
        addProveedorBtn2.addEventListener('click', function() {
            if (!requireAuth('agregar proveedor')) return;
            openProveedorModal();
        });
    }
    if (addMessageBtn) {
        addMessageBtn.addEventListener('click', function() {
            if (!requireAuth('enviar mensaje')) return;
            openMessageModal();
        });
    }
    
    closeModals.forEach(btn => {
        btn.addEventListener('click', function() {
            if (cobranzaModal) cobranzaModal.classList.remove('active');
            if (proveedorModal) proveedorModal.classList.remove('active');
            if (abonoModal) abonoModal.classList.remove('active');
            if (pagoProveedorModal) pagoProveedorModal.classList.remove('active');
            if (messageModal) messageModal.classList.remove('active');
            if (reciboModal) reciboModal.classList.remove('active');
        });
    });
    
    window.addEventListener('click', function(e) {
        if (cobranzaModal && e.target === cobranzaModal) cobranzaModal.classList.remove('active');
        if (proveedorModal && e.target === proveedorModal) proveedorModal.classList.remove('active');
        if (abonoModal && e.target === abonoModal) abonoModal.classList.remove('active');
        if (pagoProveedorModal && e.target === pagoProveedorModal) pagoProveedorModal.classList.remove('active');
        if (messageModal && e.target === messageModal) messageModal.classList.remove('active');
        if (reciboModal && e.target === reciboModal) reciboModal.classList.remove('active');
    });
    
    if (printReciboBtn) {
        printReciboBtn.addEventListener('click', function() {
            if (!requireAuth('imprimir recibo')) return;
            const reciboContent = document.getElementById('reciboContent');
            if (reciboContent) {
                const reciboHTML = reciboContent.innerHTML;
                const ventana = window.open('', '_blank');
                ventana.document.write(`
                    <html>
                        <head>
                            <title>Recibo de Cobranza</title>
                            <style>
                                body { font-family: Arial, sans-serif; padding: 20px; }
                                .recibo-container { max-width: 600px; margin: 0 auto; }
                            </style>
                        </head>
                        <body>
                            <div class="recibo-container">${reciboHTML}</div>
                        </body>
                    </html>
                `);
                ventana.document.close();
                ventana.print();
            }
        });
    }
    
    if (sendReciboBtn) {
        sendReciboBtn.addEventListener('click', function() {
            if (!requireAuth('enviar recibo')) return;
            const reciboText = document.getElementById('reciboContent');
            if (reciboText) {
                copyToClipboard(reciboText.innerText);
                showNotification('Recibo copiado al portapapeles. Péguelo en su cliente de email.', 'success');
            }
        });
    }
}

// Configurar formularios
function setupForms() {
    console.log("📝 Configurando formularios");
    
    // Formulario de empresa
    if (companyForm) {
        companyForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!requireAuth('guardar datos empresa')) return;
            
            companyData = {
                nombre: document.getElementById('companyName').value,
                rif: document.getElementById('companyRif').value,
                telefono: document.getElementById('companyPhone').value,
                email: document.getElementById('companyEmail').value,
                contactos: document.getElementById('companyContacts').value,
                fechaActualizacion: new Date().toISOString()
            };
            
            saveToLocalStorage();
            showNotification('Datos de empresa guardados correctamente', 'success');
            registrarActividad('sistema', 'Datos de empresa actualizados', `Empresa: ${companyData.nombre}`);
        });
    }
    
    // Formulario de cobranza
    if (cobranzaForm) {
        cobranzaForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!requireAuth('guardar cobranza')) return;
            
            // Formatear teléfono
            let telefono = document.getElementById('clientPhone').value;
            let telefonoLimpio = telefono.replace(/-/g, '');
            if (telefonoLimpio && !telefonoLimpio.startsWith('+58')) {
                telefonoLimpio = '+58' + telefonoLimpio;
            }
            
            const cobranzaData = {
                id: cobranzaIdInput.value || generateId(),
                cliente: document.getElementById('clientName').value,
                telefono: telefonoLimpio,
                email: document.getElementById('clientEmail').value,
                monto: parseFloat(document.getElementById('amount').value),
                fechaEmision: document.getElementById('issueDate').value,
                fechaVencimiento: document.getElementById('dueDate').value,
                estado: 'pendiente',
                notas: document.getElementById('notes').value,
                fechaCreacion: new Date().toISOString(),
                saldoPendiente: parseFloat(document.getElementById('amount').value)
            };
            
            if (cobranzaIdInput.value) {
                // Actualizar cobranza existente
                const index = cobranzas.findIndex(c => c.id === cobranzaIdInput.value);
                if (index !== -1) {
                    cobranzas[index] = { ...cobranzas[index], ...cobranzaData };
                    showNotification('Cobranza actualizada correctamente', 'success');
                    registrarActividad('cobranza', `Cobranza actualizada - ${cobranzaData.cliente}`, `Monto: $${cobranzaData.monto}`);
                }
            } else {
                // Nueva cobranza
                cobranzas.push(cobranzaData);
                showNotification('Cobranza agregada correctamente', 'success');
                registrarActividad('cobranza', `Nueva cobranza creada - ${cobranzaData.cliente}`, `Monto: $${cobranzaData.monto}, Vence: ${formatDate(cobranzaData.fechaVencimiento)}`);
            }
            
            saveToLocalStorage();
            cobranzaForm.reset();
            cobranzaModal.classList.remove('active');
            cobranzaIdInput.value = '';
            cobranzaModalTitle.textContent = 'Nueva Cobranza';
            
            updateCobranzasUI();
            updateDashboardStats();
            updateUpcomingList();
        });
    }
    
    // Formulario de proveedor
    if (proveedorForm) {
        proveedorForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!requireAuth('guardar proveedor')) return;
            
            let telefono = document.getElementById('proveedorPhone').value;
            let telefonoLimpio = telefono.replace(/-/g, '');
            if (telefonoLimpio && !telefonoLimpio.startsWith('+58')) {
                telefonoLimpio = '+58' + telefonoLimpio;
            }
            
            const proveedorData = {
                id: proveedorIdInput.value || generateId(),
                nombre: document.getElementById('proveedorName').value,
                contacto: document.getElementById('proveedorContact').value,
                telefono: telefonoLimpio,
                email: document.getElementById('proveedorEmail').value,
                concepto: document.getElementById('proveedorConcepto').value,
                monto: parseFloat(document.getElementById('proveedorMonto').value),
                fechaEmision: document.getElementById('proveedorIssueDate').value,
                fechaVencimiento: document.getElementById('proveedorDueDate').value,
                estado: 'pendiente',
                notas: document.getElementById('proveedorNotes').value,
                fechaCreacion: new Date().toISOString(),
                saldoPendiente: parseFloat(document.getElementById('proveedorMonto').value)
            };
            
            if (proveedorIdInput.value) {
                // Actualizar proveedor existente
                const index = proveedores.findIndex(p => p.id === proveedorIdInput.value);
                if (index !== -1) {
                    proveedores[index] = { ...proveedores[index], ...proveedorData };
                    showNotification('Proveedor actualizado correctamente', 'success');
                    registrarActividad('proveedor', `Proveedor actualizado - ${proveedorData.nombre}`, `Monto: $${proveedorData.monto}`);
                }
            } else {
                // Nuevo proveedor
                proveedores.push(proveedorData);
                showNotification('Proveedor agregado correctamente', 'success');
                registrarActividad('proveedor', `Nuevo proveedor creado - ${proveedorData.nombre}`, `Monto: $${proveedorData.monto}, Vence: ${formatDate(proveedorData.fechaVencimiento)}`);
            }
            
            saveToLocalStorage();
            proveedorForm.reset();
            proveedorModal.classList.remove('active');
            proveedorIdInput.value = '';
            proveedorModalTitle.textContent = 'Nuevo Proveedor';
            
            updateProveedoresUI();
            updateDashboardStats();
            updateUpcomingList();
        });
    }
    
    // Formulario de abono
    if (abonoForm) {
        abonoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!requireAuth('registrar abono')) return;
            
            const cobranzaId = document.getElementById('abonoCobranzaId').value;
            const cobranza = cobranzas.find(c => c.id === cobranzaId);
            
            if (!cobranza) {
                showNotification('Cobranza no encontrada', 'danger');
                return;
            }
            
            const abonoData = {
                id: generateId(),
                cobranzaId: cobranzaId,
                monto: parseFloat(document.getElementById('abonoMonto').value),
                fecha: document.getElementById('abonoFecha').value,
                notas: document.getElementById('abonoNotas').value,
                fechaRegistro: new Date().toISOString()
            };
            
            abonos.push(abonoData);
            
            // Actualizar saldo pendiente en la cobranza
            const nuevoSaldo = calcularSaldoPendiente(cobranza) - abonoData.monto;
            cobranza.saldoPendiente = nuevoSaldo;
            
            // Si el saldo llega a cero, marcar como pagado
            if (nuevoSaldo <= 0) {
                cobranza.estado = 'pagado';
                registrarActividad('pago', `Cobranza pagada completamente - ${cobranza.cliente}`);
            }
            
            saveToLocalStorage();
            showNotification('Abono registrado correctamente', 'success');
            abonoForm.reset();
            abonoModal.classList.remove('active');
            
            // Registrar actividad
            registrarActividad('abono', `Abono registrado - ${cobranza.cliente}`, `Monto: $${abonoData.monto}, Nuevo saldo: $${nuevoSaldo.toFixed(2)}`);
            
            updateCobranzasUI();
            updateDashboardStats();
        });
    }
    
    // Formulario de pago a proveedor
    if (pagoProveedorForm) {
        pagoProveedorForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!requireAuth('registrar pago')) return;
            
            const proveedorId = document.getElementById('pagoProveedorId').value;
            const proveedor = proveedores.find(p => p.id === proveedorId);
            
            if (!proveedor) {
                showNotification('Proveedor no encontrada', 'danger');
                return;
            }
            
            const pagoData = {
                id: generateId(),
                proveedorId: proveedorId,
                monto: parseFloat(document.getElementById('pagoMonto').value),
                fecha: document.getElementById('pagoFecha').value,
                notas: document.getElementById('pagoNotas').value,
                fechaRegistro: new Date().toISOString()
            };
            
            pagosProveedores.push(pagoData);
            
            // Actualizar saldo pendiente en el proveedor
            const nuevoSaldo = calcularSaldoPendienteProveedor(proveedor) - pagoData.monto;
            proveedor.saldoPendiente = nuevoSaldo;
            
            // Si el saldo llega a cero, marcar como pagado
            if (nuevoSaldo <= 0) {
                proveedor.estado = 'pagado';
                registrarActividad('pago', `Proveedor pagado completamente - ${proveedor.nombre}`);
            }
            
            saveToLocalStorage();
            showNotification('Pago registrado correctamente', 'success');
            pagoProveedorForm.reset();
            pagoProveedorModal.classList.remove('active');
            
            // Registrar actividad
            registrarActividad('pago_proveedor', `Pago registrado - ${proveedor.nombre}`, `Monto: $${pagoData.monto}, Nuevo saldo: $${nuevoSaldo.toFixed(2)}`);
            
            updateProveedoresUI();
            updateDashboardStats();
        });
    }
    
    // Formulario de mensaje
    if (messageForm) {
        messageForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!requireAuth('enviar mensaje')) return;
            
            const clientId = document.getElementById('messageClient').value;
            const client = cobranzas.find(c => c.id === clientId);
            
            if (!client) {
                showNotification('Cliente no encontrado', 'danger');
                return;
            }
            
            const messageType = document.getElementById('messageType').value;
            const messageContent = document.getElementById('messageContent').value;
            const channel = document.getElementById('messageChannel').value;
            
            const messageData = {
                id: generateId(),
                tipo: messageType,
                contenido: messageContent,
                cliente: client.cliente,
                clienteId: clientId,
                canal: channel,
                fechaEnvio: new Date().toISOString(),
                estado: 'pendiente'
            };
            
            // Enviar mensaje por WhatsApp si está seleccionado
            if (channel === 'whatsapp') {
                if (enviarWhatsApp(client, messageContent)) {
                    messageData.estado = 'enviado';
                    showNotification('Mensaje enviado por WhatsApp', 'success');
                    registrarActividad('mensaje', `Mensaje WhatsApp enviado - ${client.cliente}`, `Tipo: ${messageType}`);
                }
            } else if (channel === 'email') {
                // Copiar mensaje al portapapeles para email
                copyToClipboard(messageContent);
                showNotification('Mensaje copiado al portapapeles. Péguelo en su cliente de email.', 'success');
                registrarActividad('mensaje', `Mensaje Email preparado - ${client.cliente}`, `Tipo: ${messageType} - Mensaje copiado al portapapeles`);
            }
            
            mensajes.push(messageData);
            saveToLocalStorage();
            
            messageForm.reset();
            messageModal.classList.remove('active');
        });
        
        // Cambiar contenido del mensaje según el tipo seleccionado
        document.getElementById('messageType').addEventListener('change', function() {
            const type = this.value;
            let content = '';
            
            if (type === 'recordatorio_amable') {
                content = 'Hola {cliente}, desde {empresa} te recordamos que tu pago de {monto} vence el {vencimiento}. Contáctanos: {telefono}.';
            } else if (type === 'recordatorio_cercano') {
                content = 'Hola {cliente}, tu pago de {monto} con {empresa} vence hoy ({vencimiento}). Agradecemos tu pronta atención.';
            } else if (type === 'vencido_leve') {
                content = 'Hola {cliente}, tu pago de {monto} con {empresa} está vencido desde {vencimiento}. Por favor realiza tu pago cuanto antes.';
            } else if (type === 'ultima_advertencia') {
                content = 'Estimado {cliente}, tu pago de {monto} con {empresa} está vencido desde {vencimiento}. Esta es la última notificación antes de tomar medidas. Contáctanos: {telefono}.';
            }
            
            if (content && document.getElementById('messageClient').value) {
                const clientId = document.getElementById('messageClient').value;
                const client = cobranzas.find(c => c.id === clientId);
                
                if (client && companyData) {
                    content = content
                        .replace('{cliente}', client.cliente)
                        .replace('{empresa}', companyData.nombre || 'PPB Cobranza')
                        .replace('{monto}', `$${client.monto}`)
                        .replace('{vencimiento}', formatDate(client.fechaVencimiento))
                        .replace('{telefono}', companyData.telefono || 'No disponible');
                }
            }
            
            document.getElementById('messageContent').value = content;
        });
        
        document.getElementById('messageClient').addEventListener('change', function() {
            const type = document.getElementById('messageType').value;
            if (type && type !== 'personalizado') {
                document.getElementById('messageType').dispatchEvent(new Event('change'));
            }
        });
    }
}

// Configurar tabs
function setupTabs() {
    console.log("📑 Configurando tabs");
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabType = this.getAttribute('data-tab');
            
            if (!requireAuth('cambiar pestaña')) return;
            
            if (tabType.includes('prov')) {
                // Tabs de proveedores
                tabs.forEach(t => {
                    if (t.getAttribute('data-tab').includes('prov')) {
                        t.classList.remove('active');
                    }
                });
                this.classList.add('active');
                currentTabProv = tabType;
                updateProveedoresUI();
            } else {
                // Tabs de cobranzas
                tabs.forEach(t => {
                    if (!t.getAttribute('data-tab').includes('prov')) {
                        t.classList.remove('active');
                    }
                });
                this.classList.add('active');
                currentTab = tabType;
                updateCobranzasUI();
            }
        });
    });
}

// Generar ID único
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Calcular saldo pendiente
function calcularSaldoPendiente(cobranza) {
    const abonosCobranza = abonos.filter(a => a.cobranzaId === cobranza.id);
    const totalAbonado = abonosCobranza.reduce((sum, abono) => sum + parseFloat(abono.monto), 0);
    return parseFloat(cobranza.monto) - totalAbonado;
}

// Calcular saldo pendiente de proveedor
function calcularSaldoPendienteProveedor(proveedor) {
    const pagosProveedor = pagosProveedores.filter(p => p.proveedorId === proveedor.id);
    const totalPagado = pagosProveedor.reduce((sum, pago) => sum + parseFloat(pago.monto), 0);
    return parseFloat(proveedor.monto) - totalPagado;
}

// Registrar actividad
function registrarActividad(tipo, descripcion, detalles = null) {
    const actividadData = {
        id: generateId(),
        tipo: tipo,
        descripcion: descripcion,
        detalles: detalles,
        fecha: new Date().toISOString(),
        usuario: currentUser.nombre
    };
    
    actividades.push(actividadData);
    saveToLocalStorage();
    
    // Mantener solo las últimas 50 actividades
    if (actividades.length > 50) {
        actividades = actividades.slice(-50);
    }
    
    updateRecentActivityUI();
    console.log('✅ Actividad registrada:', descripcion);
}

// Abrir modal de cobranza
function openCobranzaModal() {
    if (document.getElementById('issueDate')) {
        document.getElementById('issueDate').valueAsDate = new Date();
        
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        document.getElementById('dueDate').valueAsDate = dueDate;
    }
    
    if (cobranzaForm) cobranzaForm.reset();
    if (cobranzaIdInput) cobranzaIdInput.value = '';
    if (cobranzaModalTitle) cobranzaModalTitle.textContent = 'Nueva Cobranza';
    if (cobranzaSubmitBtn) {
        cobranzaSubmitBtn.textContent = 'Guardar Cobranza';
        cobranzaSubmitBtn.disabled = false;
    }
    
    if (cobranzaModal) cobranzaModal.classList.add('active');
}

// Abrir modal de proveedor
function openProveedorModal() {
    if (document.getElementById('proveedorIssueDate')) {
        document.getElementById('proveedorIssueDate').valueAsDate = new Date();
        
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        document.getElementById('proveedorDueDate').valueAsDate = dueDate;
    }
    
    if (proveedorForm) proveedorForm.reset();
    if (proveedorIdInput) proveedorIdInput.value = '';
    if (proveedorModalTitle) proveedorModalTitle.textContent = 'Nuevo Proveedor';
    if (proveedorSubmitBtn) proveedorSubmitBtn.textContent = 'Guardar Proveedor';
    
    if (proveedorModal) proveedorModal.classList.add('active');
}

// Abrir modal para registrar abono
function openAbonoModal(cobranzaId) {
    const cobranza = cobranzas.find(c => c.id === cobranzaId);
    if (!cobranza) return;
    
    if (document.getElementById('abonoCobranzaId')) {
        document.getElementById('abonoCobranzaId').value = cobranzaId;
    }
    if (document.getElementById('deudaTotal')) {
        document.getElementById('deudaTotal').textContent = cobranza.monto;
    }
    
    const saldoPendiente = cobranza.saldoPendiente || calcularSaldoPendiente(cobranza);
    if (document.getElementById('abonoMonto')) {
        document.getElementById('abonoMonto').setAttribute('max', saldoPendiente);
        document.getElementById('abonoMonto').value = '';
        
        document.getElementById('abonoMonto').addEventListener('input', function() {
            const montoAbono = parseFloat(this.value) || 0;
            const nuevoSaldo = saldoPendiente - montoAbono;
            if (document.getElementById('saldoDespues')) {
                document.getElementById('saldoDespues').textContent = nuevoSaldo.toFixed(2);
            }
        });
    }
    
    if (document.getElementById('abonoFecha')) {
        document.getElementById('abonoFecha').valueAsDate = new Date();
    }
    if (document.getElementById('abonoNotas')) {
        document.getElementById('abonoNotas').value = '';
    }
    if (document.getElementById('saldoDespues')) {
        document.getElementById('saldoDespues').textContent = saldoPendiente.toFixed(2);
    }
    
    if (abonoModal) abonoModal.classList.add('active');
}

// Abrir modal para registrar pago a proveedor
function openPagoProveedorModal(proveedorId) {
    const proveedor = proveedores.find(p => p.id === proveedorId);
    if (!proveedor) return;
    
    if (document.getElementById('pagoProveedorId')) {
        document.getElementById('pagoProveedorId').value = proveedorId;
    }
    if (document.getElementById('deudaTotalProv')) {
        document.getElementById('deudaTotalProv').textContent = proveedor.monto;
    }
    
    const saldoPendiente = proveedor.saldoPendiente || calcularSaldoPendienteProveedor(proveedor);
    if (document.getElementById('pagoMonto')) {
        document.getElementById('pagoMonto').setAttribute('max', saldoPendiente);
        document.getElementById('pagoMonto').value = '';
        
        document.getElementById('pagoMonto').addEventListener('input', function() {
            const montoPago = parseFloat(this.value) || 0;
            const nuevoSaldo = saldoPendiente - montoPago;
            if (document.getElementById('saldoDespuesProv')) {
                document.getElementById('saldoDespuesProv').textContent = nuevoSaldo.toFixed(2);
            }
        });
    }
    
    if (document.getElementById('pagoFecha')) {
        document.getElementById('pagoFecha').valueAsDate = new Date();
    }
    if (document.getElementById('pagoNotas')) {
        document.getElementById('pagoNotas').value = '';
    }
    if (document.getElementById('saldoDespuesProv')) {
        document.getElementById('saldoDespuesProv').textContent = saldoPendiente.toFixed(2);
    }
    
    if (pagoProveedorModal) pagoProveedorModal.classList.add('active');
}

// Abrir modal de mensaje
function openMessageModal() {
    const clientSelect = document.getElementById('messageClient');
    if (clientSelect) {
        clientSelect.innerHTML = '<option value="">Selecciona un cliente</option>';
        
        cobranzas.forEach(cobranza => {
            const saldoPendiente = cobranza.saldoPendiente || calcularSaldoPendiente(cobranza);
            if (cobranza.estado !== 'pagado' && saldoPendiente > 0) {
                const option = document.createElement('option');
                option.value = cobranza.id;
                option.textContent = `${cobranza.cliente} - $${cobranza.monto}`;
                clientSelect.appendChild(option);
            }
        });
    }
    
    if (messageModal) messageModal.classList.add('active');
}

// Abrir modal de mensaje para una cobranza específica
function openMessageModalForCobranza(cobranzaId) {
    openMessageModal();
    if (document.getElementById('messageClient')) {
        document.getElementById('messageClient').value = cobranzaId;
    }
    
    const cobranza = cobranzas.find(c => c.id === cobranzaId);
    if (cobranza) {
        const today = new Date();
        const dueDate = new Date(cobranza.fechaVencimiento);
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        let messageType = 'recordatorio_amable';
        
        if (diffDays < 0) {
            const daysOverdue = Math.abs(diffDays);
            if (daysOverdue > 15) {
                messageType = 'ultima_advertencia';
            } else {
                messageType = 'vencido_leve';
            }
        } else if (diffDays === 0) {
            messageType = 'recordatorio_cercano';
        }
        
        if (document.getElementById('messageType')) {
            document.getElementById('messageType').value = messageType;
            document.getElementById('messageType').dispatchEvent(new Event('change'));
        }
    }
}

// Enviar mensaje por WhatsApp
function enviarWhatsApp(cliente, mensaje) {
    const telefono = cliente.telefono;
    if (!telefono) {
        showNotification('El cliente no tiene número de teléfono registrado', 'warning');
        return false;
    }
    
    let telefonoLimpio = telefono.replace(/\D/g, '');
    if (telefonoLimpio.startsWith('58')) {
        telefonoLimpio = telefonoLimpio;
    } else if (telefonoLimpio.startsWith('0')) {
        telefonoLimpio = '58' + telefonoLimpio.substring(1);
    } else {
        telefonoLimpio = '58' + telefonoLimpio;
    }
    
    const mensajeCodificado = encodeURIComponent(mensaje);
    const whatsappURL = `https://web.whatsapp.com/send?phone=${telefonoLimpio}&text=${mensajeCodificado}`;
    
    // SOLUCIÓN: Forzar a que use siempre la misma pestaña
    // Primero intentar cerrar cualquier pestaña anterior con ese nombre
    try {
        const ventanaAnterior = window.open('', 'WHATSAPP_FIJO');
        if (ventanaAnterior) {
            ventanaAnterior.close();
        }
    } catch (e) {
        // Ignorar errores
    }
    
    // Pequeña pausa para asegurar que se cerró
    setTimeout(() => {
        window.open(whatsappURL, 'WHATSAPP_FIJO');
    }, 100);
    
    return true;
}

// Actualizar UI de cobranzas
function updateCobranzasUI() {
    if (!cobranzasTableBody || !requireAuth('ver cobranzas')) return;
    
    cobranzasTableBody.innerHTML = '';
    
    if (cobranzas.length === 0) {
        cobranzasTableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 30px;">
                    <i class="fas fa-inbox" style="font-size: 2rem; color: var(--gray); margin-bottom: 10px; display: block;"></i>
                    <p>No hay cobranzas registradas</p>
                    <button class="btn btn-primary" id="addFirstCobranza" style="margin-top: 15px;">
                        <i class="fas fa-plus"></i> Agregar Primera Cobranza
                    </button>
                </td>
            </tr>
        `;
        
        const addFirstBtn = document.getElementById('addFirstCobranza');
        if (addFirstBtn) {
            addFirstBtn.addEventListener('click', function() {
                if (!requireAuth('agregar cobranza')) return;
                openCobranzaModal();
            });
        }
        
        return;
    }
    
    let filteredCobranzas = cobranzas;
    if (currentTab === 'pending') {
        filteredCobranzas = cobranzas.filter(c => c.estado === 'pendiente' && c.saldoPendiente > 0);
    } else if (currentTab === 'paid') {
        filteredCobranzas = cobranzas.filter(c => c.estado === 'pagado' || c.saldoPendiente <= 0);
    } else if (currentTab === 'overdue') {
        filteredCobranzas = cobranzas.filter(c => {
            const today = new Date();
            const dueDate = new Date(c.fechaVencimiento);
            return (c.estado !== 'pagado' && c.saldoPendiente > 0) && dueDate < today;
        });
    }
    
    if (filteredCobranzas.length === 0) {
        cobranzasTableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 30px;">
                    <i class="fas fa-inbox" style="font-size: 2rem; color: var(--gray); margin-bottom: 10px; display: block;"></i>
                    <p>No hay cobranzas en esta categoría</p>
                </td>
            </tr>
        `;
        return;
    }
    
    filteredCobranzas.forEach(cobranza => {
        const tr = document.createElement('tr');
        
        let estado = 'pendiente';
        let estadoClass = 'status-pending';
        let estadoText = 'Pendiente';
        
        const today = new Date();
        const dueDate = new Date(cobranza.fechaVencimiento);
        const saldoPendiente = cobranza.saldoPendiente || calcularSaldoPendiente(cobranza);
        
        if (cobranza.estado === 'pagado' || saldoPendiente <= 0) {
            estado = 'pagado';
            estadoClass = 'status-paid';
            estadoText = 'Pagado';
        } else if (dueDate < today) {
            estado = 'vencido';
            estadoClass = 'status-overdue';
            estadoText = 'Vencido';
        }
        
        const abonosCobranza = abonos.filter(a => a.cobranzaId === cobranza.id);
        
        tr.innerHTML = `
            <td>
                <strong class="clickable-name" style="color: var(--primary); cursor: pointer; text-decoration: underline;" data-id="${cobranza.id}">
                    ${cobranza.cliente}
                </strong>
                ${abonosCobranza.length > 0 ? 
                  `<br><small>${abonosCobranza.length} abono(s)</small>` : ''}
            </td>
            <td>
                $${cobranza.monto}
                ${saldoPendiente < parseFloat(cobranza.monto) ? 
                  `<br><small>Saldo: $${saldoPendiente.toFixed(2)}</small>` : ''}
            </td>
            <td>${formatDate(cobranza.fechaEmision)}</td>
            <td>${formatDate(cobranza.fechaVencimiento)}</td>
            <td><span class="status-badge ${estadoClass}">${estadoText}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" title="Registrar abono" data-id="${cobranza.id}">
                        <i class="fas fa-hand-holding-usd" style="color: var(--success);"></i>
                    </button>
                    <button class="btn-icon" title="Ver abonos" data-id="${cobranza.id}">
                        <i class="fas fa-list" style="color: var(--primary);"></i>
                    </button>
                    <button class="btn-icon" title="Generar recibo" data-id="${cobranza.id}">
                        <i class="fas fa-receipt" style="color: var(--primary);"></i>
                    </button>
                    <button class="btn-icon" title="Enviar mensaje" data-id="${cobranza.id}">
                        <i class="fas fa-envelope" style="color: var(--primary);"></i>
                    </button>
                    <button class="btn-icon" title="Marcar como pagado" data-id="${cobranza.id}">
                        <i class="fas fa-check" style="color: var(--success);"></i>
                    </button>
                    <button class="btn-icon" title="Editar" data-id="${cobranza.id}">
                        <i class="fas fa-edit" style="color: var(--warning);"></i>
                    </button>
                    <button class="btn-icon" title="Eliminar" data-id="${cobranza.id}">
                        <i class="fas fa-trash" style="color: var(--danger);"></i>
                    </button>
                </div>
            </td>
        `;
        
        cobranzasTableBody.appendChild(tr);
    });
    
    document.querySelectorAll('.action-buttons .btn-icon').forEach(button => {
        button.addEventListener('click', function() {
            if (!requireAuth('acciones cobranza')) return;
            
            const cobranzaId = this.getAttribute('data-id');
            const action = this.querySelector('i').className;
            
            if (action.includes('fa-hand-holding-usd')) {
                openAbonoModal(cobranzaId);
            } else if (action.includes('fa-list')) {
                verAbonos(cobranzaId);
            } else if (action.includes('fa-check')) {
                markAsPaid(cobranzaId);
            } else if (action.includes('fa-trash')) {
                deleteCobranza(cobranzaId);
            } else if (action.includes('fa-envelope')) {
                openMessageModalForCobranza(cobranzaId);
            } else if (action.includes('fa-edit')) {
                editCobranza(cobranzaId);
            } else if (action.includes('fa-receipt')) {
                generateRecibo(cobranzaId);
            }
        });
    });

    // Event listeners para los nombres clickeables de clientes
    document.querySelectorAll('.clickable-name').forEach(name => {
        name.addEventListener('click', function() {
            if (!requireAuth('ver ficha cliente')) return;
            const id = this.getAttribute('data-id');
            mostrarFichaCliente(id);
        });
    });
}

// Mostrar ficha completa del cliente
function mostrarFichaCliente(cobranzaId) {
    const cobranza = cobranzas.find(c => c.id === cobranzaId);
    if (!cobranza) return;
    
    // Calcular estadísticas del cliente
    const cobranzasCliente = cobranzas.filter(c => c.cliente === cobranza.cliente);
    const totalCobranzas = cobranzasCliente.length;
    const cobranzasPagadas = cobranzasCliente.filter(c => c.estado === 'pagado').length;
    const tasaPago = totalCobranzas > 0 ? (cobranzasPagadas / totalCobranzas) * 100 : 0;
    
    // Calcular totales
    const totalPrestado = cobranzasCliente.reduce((sum, c) => sum + parseFloat(c.monto), 0);
    const totalPagado = cobranzasCliente
        .filter(c => c.estado === 'pagado')
        .reduce((sum, c) => sum + parseFloat(c.monto), 0);
    
    // Formatear teléfono para mostrar
    let telefonoMostrar = cobranza.telefono || 'No registrado';
    if (telefonoMostrar.startsWith('+58')) {
        telefonoMostrar = telefonoMostrar.substring(3);
    }
    if (telefonoMostrar.length > 3) {
        telefonoMostrar = telefonoMostrar.substring(0, 3) + '-' + telefonoMostrar.substring(3);
    }
    
    const modalHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h3 class="modal-title">👤 Ficha de Cliente: ${cobranza.cliente}</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="ficha-section">
                    <h4>📋 Información de Contacto</h4>
                    <div class="ficha-grid">
                        <div class="ficha-item">
                            <label>Teléfono:</label>
                            <span>${telefonoMostrar}</span>
                        </div>
                        <div class="ficha-item">
                            <label>Email:</label>
                            <span>${cobranza.email || 'No registrado'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="ficha-section">
                    <h4>📊 Estadísticas del Cliente</h4>
                    <div class="ficha-grid">
                        <div class="ficha-item">
                            <label>Total Cobranzas:</label>
                            <span>${totalCobranzas}</span>
                        </div>
                        <div class="ficha-item">
                            <label>Tasa de Pago:</label>
                            <span>${tasaPago.toFixed(1)}%</span>
                        </div>
                        <div class="ficha-item">
                            <label>Total Prestado:</label>
                            <span>$${totalPrestado.toFixed(2)}</span>
                        </div>
                        <div class="ficha-item">
                            <label>Total Pagado:</label>
                            <span>$${totalPagado.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="ficha-section">
                    <h4>💰 Cobranzas Activas</h4>
                    ${cobranzasCliente.filter(c => c.estado !== 'pagado' && c.saldoPendiente > 0).length > 0 ? 
                        cobranzasCliente.filter(c => c.estado !== 'pagado' && c.saldoPendiente > 0).map(c => `
                            <div class="cobranza-activa">
                                <strong>$${c.monto}</strong> - Vence: ${formatDate(c.fechaVencimiento)}
                                <span class="status-badge ${new Date(c.fechaVencimiento) < new Date() ? 'status-overdue' : 'status-pending'}">
                                    ${new Date(c.fechaVencimiento) < new Date() ? 'Vencida' : 'Pendiente'}
                                </span>
                            </div>
                        `).join('') : 
                        '<p>No hay cobranzas activas</p>'
                    }
                </div>
                
                ${cobranza.notas ? `
                <div class="ficha-section">
                    <h4>📝 Notas</h4>
                    <p>${cobranza.notas}</p>
                </div>
                ` : ''}
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="cerrarFicha">Cerrar</button>
                <button class="btn btn-primary" id="editarCliente" data-id="${cobranzaId}">
                    <i class="fas fa-edit"></i> Editar Cliente
                </button>
                <button class="btn btn-warning" id="enviarMensajeCliente" data-id="${cobranzaId}">
                    <i class="fas fa-envelope"></i> Enviar Mensaje
                </button>
            </div>
        </div>
    `;
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = modalHTML;
    document.body.appendChild(modal);
    
    // Event listeners
    modal.querySelector('.close-modal').addEventListener('click', function() {
        modal.remove();
    });
    
    modal.querySelector('#cerrarFicha').addEventListener('click', function() {
        modal.remove();
    });
    
    modal.querySelector('#editarCliente').addEventListener('click', function() {
        modal.remove();
        editCobranza(cobranzaId);
    });
    
    modal.querySelector('#enviarMensajeCliente').addEventListener('click', function() {
        modal.remove();
        openMessageModalForCobranza(cobranzaId);
    });
    
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Actualizar UI de proveedores
function updateProveedoresUI() {
    if (!proveedoresTableBody || !requireAuth('ver proveedores')) return;
    
    proveedoresTableBody.innerHTML = '';
    
    if (proveedores.length === 0) {
        proveedoresTableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 30px;">
                    <i class="fas fa-truck" style="font-size: 2rem; color: var(--gray); margin-bottom: 10px; display: block;"></i>
                    <p>No hay proveedores registrados</p>
                    <button class="btn btn-primary" id="addFirstProveedor" style="margin-top: 15px;">
                        <i class="fas fa-plus"></i> Agregar Primer Proveedor
                    </button>
                </td>
            </tr>
        `;
        
        const addFirstBtn = document.getElementById('addFirstProveedor');
        if (addFirstBtn) {
            addFirstBtn.addEventListener('click', function() {
                if (!requireAuth('agregar proveedor')) return;
                openProveedorModal();
            });
        }
        
        return;
    }
    
    let filteredProveedores = proveedores;
    if (currentTabProv === 'pending-prov') {
        filteredProveedores = proveedores.filter(p => p.estado === 'pendiente' && p.saldoPendiente > 0);
    } else if (currentTabProv === 'paid-prov') {
        filteredProveedores = proveedores.filter(p => p.estado === 'pagado' || p.saldoPendiente <= 0);
    } else if (currentTabProv === 'overdue-prov') {
        filteredProveedores = proveedores.filter(p => {
            const today = new Date();
            const dueDate = new Date(p.fechaVencimiento);
            return (p.estado !== 'pagado' && p.saldoPendiente > 0) && dueDate < today;
        });
    }
    
    if (filteredProveedores.length === 0) {
        proveedoresTableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 30px;">
                    <i class="fas fa-truck" style="font-size: 2rem; color: var(--gray); margin-bottom: 10px; display: block;"></i>
                    <p>No hay proveedores en esta categoría</p>
                </td>
            </tr>
        `;
        return;
    }
    
    filteredProveedores.forEach(proveedor => {
        const tr = document.createElement('tr');
        
        let estado = 'pendiente';
        let estadoClass = 'status-pending';
        let estadoText = 'Pendiente';
        
        const today = new Date();
        const dueDate = new Date(proveedor.fechaVencimiento);
        const saldoPendiente = proveedor.saldoPendiente || calcularSaldoPendienteProveedor(proveedor);
        
        if (proveedor.estado === 'pagado' || saldoPendiente <= 0) {
            estado = 'pagado';
            estadoClass = 'status-paid';
            estadoText = 'Pagado';
        } else if (dueDate < today) {
            estado = 'vencido';
            estadoClass = 'status-overdue';
            estadoText = 'Vencido';
        }
        
        const pagosProveedor = pagosProveedores.filter(p => p.proveedorId === proveedor.id);
        
        tr.innerHTML = `
            <td>
                <strong class="clickable-proveedor" style="color: var(--primary); cursor: pointer; text-decoration: underline;" data-id="${proveedor.id}">
                    ${proveedor.nombre}
                </strong>
                ${proveedor.contacto ? `<br><small>${proveedor.contacto}</small>` : ''}
            </td>
            <td>${proveedor.concepto}</td>
            <td>
                $${proveedor.monto}
                ${saldoPendiente < parseFloat(proveedor.monto) ? 
                  `<br><small>Saldo: $${saldoPendiente.toFixed(2)}</small>` : ''}
            </td>
            <td>${formatDate(proveedor.fechaEmision)}</td>
            <td>${formatDate(proveedor.fechaVencimiento)}</td>
            <td><span class="status-badge ${estadoClass}">${estadoText}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" title="Registrar pago" data-id="${proveedor.id}">
                        <i class="fas fa-money-bill-wave" style="color: var(--success);"></i>
                    </button>
                    <button class="btn-icon" title="Ver pagos" data-id="${proveedor.id}">
                        <i class="fas fa-list" style="color: var(--primary);"></i>
                    </button>
                    <button class="btn-icon" title="Marcar como pagado" data-id="${proveedor.id}">
                        <i class="fas fa-check" style="color: var(--success);"></i>
                    </button>
                    <button class="btn-icon" title="Editar" data-id="${proveedor.id}">
                        <i class="fas fa-edit" style="color: var(--warning);"></i>
                    </button>
                    <button class="btn-icon" title="Eliminar" data-id="${proveedor.id}">
                        <i class="fas fa-trash" style="color: var(--danger);"></i>
                    </button>
                </div>
            </td>
        `;
        
        proveedoresTableBody.appendChild(tr);
    });
    
    document.querySelectorAll('#proveedoresTableBody .action-buttons .btn-icon').forEach(button => {
        button.addEventListener('click', function() {
            if (!requireAuth('acciones proveedor')) return;
            
            const proveedorId = this.getAttribute('data-id');
            const action = this.querySelector('i').className;
            
            if (action.includes('fa-money-bill-wave')) {
                openPagoProveedorModal(proveedorId);
            } else if (action.includes('fa-list')) {
                verPagosProveedor(proveedorId);
            } else if (action.includes('fa-check')) {
                markProveedorAsPaid(proveedorId);
            } else if (action.includes('fa-trash')) {
                deleteProveedor(proveedorId);
            } else if (action.includes('fa-edit')) {
                editProveedor(proveedorId);
            }
        });
    });

    // Event listeners para los nombres clickeables de proveedores
    document.querySelectorAll('.clickable-proveedor').forEach(name => {
        name.addEventListener('click', function() {
            if (!requireAuth('ver ficha proveedor')) return;
            const id = this.getAttribute('data-id');
            mostrarFichaProveedor(id);
        });
    });
}

// Ver abonos de una cobranza
function verAbonos(cobranzaId) {
    const cobranza = cobranzas.find(c => c.id === cobranzaId);
    if (!cobranza) return;
    
    const abonosCobranza = abonos.filter(a => a.cobranzaId === cobranzaId);
    
    let abonosHTML = '';
    if (abonosCobranza.length > 0) {
        abonosCobranza.forEach(abono => {
            abonosHTML += `
                <div class="abono-item">
                    <div class="abono-info">
                        <strong>$${abono.monto}</strong>
                        <div class="abono-fecha">${formatDate(abono.fecha)}</div>
                        ${abono.notas ? `<small>${abono.notas}</small>` : ''}
                    </div>
                </div>
            `;
        });
    } else {
        abonosHTML = '<p>No hay abonos registrados</p>';
    }
    
    const saldoPendiente = cobranza.saldoPendiente || calcularSaldoPendiente(cobranza);
    
    const modalHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Abonos - ${cobranza.cliente}</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div>
                <p><strong>Deuda total:</strong> $${cobranza.monto}</p>
                <p><strong>Total abonado:</strong> $${(parseFloat(cobranza.monto) - saldoPendiente).toFixed(2)}</p>
                <p><strong>Saldo pendiente:</strong> $${saldoPendiente.toFixed(2)}</p>
                
                <div class="abonos-section">
                    <h4>Historial de Abonos</h4>
                    ${abonosHTML}
                </div>
                
                <div style="text-align: center; margin-top: 20px;">
                    <button class="btn btn-primary" id="addAbonoFromList" data-id="${cobranzaId}">
                        <i class="fas fa-plus"></i> Agregar Abono
                    </button>
                </div>
            </div>
        </div>
    `;
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = modalHTML;
    document.body.appendChild(modal);
    
    modal.querySelector('.close-modal').addEventListener('click', function() {
        modal.remove();
    });
    
    modal.querySelector('#addAbonoFromList').addEventListener('click', function() {
        modal.remove();
        openAbonoModal(cobranzaId);
    });
    
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Ver pagos de un proveedor
function mostrarFichaProveedor(proveedorId) {
    const proveedor = proveedores.find(p => p.id === proveedorId);
    if (!proveedor) return;
    
    // Calcular estadísticas del proveedor
    const proveedoresMismo = proveedores.filter(p => p.nombre === proveedor.nombre);
    const totalProveedores = proveedoresMismo.length;
    const proveedoresPagados = proveedoresMismo.filter(p => p.estado === 'pagado').length;
    const tasaPago = totalProveedores > 0 ? (proveedoresPagados / totalProveedores) * 100 : 0;
    
    // Calcular totales
    const totalFacturado = proveedoresMismo.reduce((sum, p) => sum + parseFloat(p.monto), 0);
    const totalPagado = proveedoresMismo
        .filter(p => p.estado === 'pagado')
        .reduce((sum, p) => sum + parseFloat(p.monto), 0);
    
    // Formatear teléfono para mostrar
    let telefonoMostrar = proveedor.telefono || 'No registrado';
    if (telefonoMostrar.startsWith('+58')) {
        telefonoMostrar = telefonoMostrar.substring(3);
    }
    if (telefonoMostrar.length > 3) {
        telefonoMostrar = telefonoMostrar.substring(0, 3) + '-' + telefonoMostrar.substring(3);
    }
    
    const modalHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h3 class="modal-title">🏢 Ficha de Proveedor: ${proveedor.nombre}</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <div class="ficha-section">
                    <h4>📋 Información de Contacto</h4>
                    <div class="ficha-grid">
                        <div class="ficha-item">
                            <label>Contacto:</label>
                            <span>${proveedor.contacto || 'No registrado'}</span>
                        </div>
                        <div class="ficha-item">
                            <label>Teléfono:</label>
                            <span>${telefonoMostrar}</span>
                        </div>
                        <div class="ficha-item">
                            <label>Email:</label>
                            <span>${proveedor.email || 'No registrado'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="ficha-section">
                    <h4>📊 Estadísticas del Proveedor</h4>
                    <div class="ficha-grid">
                        <div class="ficha-item">
                            <label>Total Facturas:</label>
                            <span>${totalProveedores}</span>
                        </div>
                        <div class="ficha-item">
                            <label>Tasa de Pago:</label>
                            <span>${tasaPago.toFixed(1)}%</span>
                        </div>
                        <div class="ficha-item">
                            <label>Total Facturado:</label>
                            <span>$${totalFacturado.toFixed(2)}</span>
                        </div>
                        <div class="ficha-item">
                            <label>Total Pagado:</label>
                            <span>$${totalPagado.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="ficha-section">
                    <h4>📦 Servicios/Productos</h4>
                    <p><strong>Concepto:</strong> ${proveedor.concepto || 'No especificado'}</p>
                </div>
                
                <div class="ficha-section">
                    <h4>💰 Facturas Pendientes</h4>
                    ${proveedoresMismo.filter(p => p.estado !== 'pagado' && p.saldoPendiente > 0).length > 0 ? 
                        proveedoresMismo.filter(p => p.estado !== 'pagado' && p.saldoPendiente > 0).map(p => `
                            <div class="proveedor-pendiente">
                                <strong>$${p.monto}</strong> - Vence: ${formatDate(p.fechaVencimiento)}
                                <span class="status-badge ${new Date(p.fechaVencimiento) < new Date() ? 'status-overdue' : 'status-pending'}">
                                    ${new Date(p.fechaVencimiento) < new Date() ? 'Vencida' : 'Pendiente'}
                                </span>
                            </div>
                        `).join('') : 
                        '<p>No hay facturas pendientes</p>'
                    }
                </div>
                
                ${proveedor.notas ? `
                <div class="ficha-section">
                    <h4>📝 Notas</h4>
                    <p>${proveedor.notas}</p>
                </div>
                ` : ''}
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="cerrarFichaProv">Cerrar</button>
                <button class="btn btn-primary" id="editarProveedor" data-id="${proveedorId}">
                    <i class="fas fa-edit"></i> Editar Proveedor
                </button>
            </div>
        </div>
    `;
    
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = modalHTML;
    document.body.appendChild(modal);
    
    // Event listeners
    modal.querySelector('.close-modal').addEventListener('click', function() {
        modal.remove();
    });
    
    modal.querySelector('#cerrarFichaProv').addEventListener('click', function() {
        modal.remove();
    });
    
    modal.querySelector('#editarProveedor').addEventListener('click', function() {
        modal.remove();
        editProveedor(proveedorId);
    });
    
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Editar cobranza
function editCobranza(cobranzaId) {
    const cobranza = cobranzas.find(c => c.id === cobranzaId);
    if (!cobranza) return;
    
    if (document.getElementById('clientName')) document.getElementById('clientName').value = cobranza.cliente;
    
    // Formatear teléfono
    let telefono = cobranza.telefono || '';
    if (telefono.startsWith('+58')) {
        telefono = telefono.substring(3);
    }
    telefono = telefono.replace(/\D/g, '');
    if (telefono.length > 3) {
        telefono = telefono.substring(0, 3) + '-' + telefono.substring(3);
    }
    if (document.getElementById('clientPhone')) document.getElementById('clientPhone').value = telefono;
    
    if (document.getElementById('clientEmail')) document.getElementById('clientEmail').value = cobranza.email || '';
    if (document.getElementById('amount')) document.getElementById('amount').value = cobranza.monto;
    if (document.getElementById('issueDate')) document.getElementById('issueDate').value = cobranza.fechaEmision;
    if (document.getElementById('dueDate')) document.getElementById('dueDate').value = cobranza.fechaVencimiento;
    if (document.getElementById('notes')) document.getElementById('notes').value = cobranza.notas || '';
    
    if (cobranzaIdInput) cobranzaIdInput.value = cobranzaId;
    if (cobranzaModalTitle) cobranzaModalTitle.textContent = 'Editar Cobranza';
    if (cobranzaSubmitBtn) cobranzaSubmitBtn.textContent = 'Actualizar Cobranza';
    
    if (cobranzaModal) cobranzaModal.classList.add('active');
}

// Editar proveedor
function editProveedor(proveedorId) {
    const proveedor = proveedores.find(p => p.id === proveedorId);
    if (!proveedor) return;
    
    if (document.getElementById('proveedorName')) document.getElementById('proveedorName').value = proveedor.nombre;
    if (document.getElementById('proveedorContact')) document.getElementById('proveedorContact').value = proveedor.contacto || '';
    
    // Formatear teléfono
    let telefono = proveedor.telefono || '';
    if (telefono.startsWith('+58')) {
        telefono = telefono.substring(3);
    }
    telefono = telefono.replace(/\D/g, '');
    if (telefono.length > 3) {
        telefono = telefono.substring(0, 3) + '-' + telefono.substring(3);
    }
    if (document.getElementById('proveedorPhone')) document.getElementById('proveedorPhone').value = telefono;
    
    if (document.getElementById('proveedorEmail')) document.getElementById('proveedorEmail').value = proveedor.email || '';
    if (document.getElementById('proveedorConcepto')) document.getElementById('proveedorConcepto').value = proveedor.concepto;
    if (document.getElementById('proveedorMonto')) document.getElementById('proveedorMonto').value = proveedor.monto;
    if (document.getElementById('proveedorIssueDate')) document.getElementById('proveedorIssueDate').value = proveedor.fechaEmision;
    if (document.getElementById('proveedorDueDate')) document.getElementById('proveedorDueDate').value = proveedor.fechaVencimiento;
    if (document.getElementById('proveedorNotes')) document.getElementById('proveedorNotes').value = proveedor.notas || '';
    
    if (proveedorIdInput) proveedorIdInput.value = proveedorId;
    if (proveedorModalTitle) proveedorModalTitle.textContent = 'Editar Proveedor';
    if (proveedorSubmitBtn) proveedorSubmitBtn.textContent = 'Actualizar Proveedor';
    
    if (proveedorModal) proveedorModal.classList.add('active');
}

// Marcar cobranza como pagada
function markAsPaid(cobranzaId) {
    if (confirm('¿Estás seguro de que quieres marcar esta cobranza como pagada?')) {
        const cobranza = cobranzas.find(c => c.id === cobranzaId);
        cobranza.estado = 'pagado';
        cobranza.saldoPendiente = 0;
        
        saveToLocalStorage();
        showNotification('Cobranza marcada como pagada', 'success');
        registrarActividad('pago', `Cobranza marcada como pagada - ${cobranza.cliente}`, `Monto: $${cobranza.monto}`);
        
        updateCobranzasUI();
        updateDashboardStats();
    }
}

// Marcar proveedor como pagado
function markProveedorAsPaid(proveedorId) {
    if (confirm('¿Estás seguro de que quieres marcar este proveedor como pagado?')) {
        const proveedor = proveedores.find(p => p.id === proveedorId);
        proveedor.estado = 'pagado';
        proveedor.saldoPendiente = 0;
        
        saveToLocalStorage();
        showNotification('Proveedor marcado como pagado', 'success');
        registrarActividad('pago', `Proveedor marcado como pagado - ${proveedor.nombre}`, `Monto: $${proveedor.monto}`);
        
        updateProveedoresUI();
        updateDashboardStats();
    }
}

// Eliminar cobranza
function deleteCobranza(cobranzaId) {
    if (confirm('¿Estás seguro de que quieres eliminar esta cobranza?')) {
        const cobranza = cobranzas.find(c => c.id === cobranzaId);
        // Eliminar todos los abonos asociados
        abonos = abonos.filter(a => a.cobranzaId !== cobranzaId);
        // Eliminar la cobranza
        cobranzas = cobranzas.filter(c => c.id !== cobranzaId);
        
        saveToLocalStorage();
        showNotification('Cobranza eliminada', 'success');
        registrarActividad('sistema', `Cobranza eliminada - ${cobranza.cliente}`, `Monto: $${cobranza.monto}`);
        
        updateCobranzasUI();
        updateDashboardStats();
        updateUpcomingList();
    }
}

// Eliminar proveedor
function deleteProveedor(proveedorId) {
    if (confirm('¿Estás seguro de que quieres eliminar este proveedor?')) {
        const proveedor = proveedores.find(p => p.id === proveedorId);
        // Eliminar todos los pagos asociados
        pagosProveedores = pagosProveedores.filter(p => p.proveedorId !== proveedorId);
        // Eliminar el proveedor
        proveedores = proveedores.filter(p => p.id !== proveedorId);
        
        saveToLocalStorage();
        showNotification('Proveedor eliminado', 'success');
        registrarActividad('sistema', `Proveedor eliminado - ${proveedor.nombre}`, `Monto: $${proveedor.monto}`);
        
        updateProveedoresUI();
        updateDashboardStats();
        updateUpcomingList();
    }
}

// Generar recibo
function generateRecibo(cobranzaId) {
    const cobranza = cobranzas.find(c => c.id === cobranzaId);
    if (!cobranza) return;
    
    const reciboContent = document.getElementById('reciboContent');
    if (!reciboContent) return;
    
    const today = new Date();
    const dueDate = new Date(cobranza.fechaVencimiento);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const saldoPendiente = cobranza.saldoPendiente || calcularSaldoPendiente(cobranza);
    const totalAbonado = parseFloat(cobranza.monto) - saldoPendiente;
    
    let estadoRecibo = 'Pendiente';
    let estadoClase = 'status-pending';
    
    if (cobranza.estado === 'pagado' || saldoPendiente <= 0) {
        estadoRecibo = 'Pagado';
        estadoClase = 'status-paid';
    } else if (diffDays < 0) {
        estadoRecibo = 'Vencido';
        estadoClase = 'status-overdue';
    }
    
    const abonosCobranza = abonos.filter(a => a.cobranzaId === cobranzaId);
    let abonosHTML = '';
    if (abonosCobranza.length > 0) {
        abonosHTML = `
            <div class="abonos-section">
                <h4>Historial de Abonos</h4>
                ${abonosCobranza.map(abono => `
                    <div class="abono-item">
                        <div class="abono-info">
                            <strong>$${abono.monto}</strong>
                            <div class="abono-fecha">${formatDate(abono.fecha)}</div>
                            ${abono.notas ? `<small>${abono.notas}</small>` : ''}
                        </div>
                    </div>
                `).join('')}
                <div class="saldo-restante">
                    <strong>Total abonado:</strong> $${totalAbonado.toFixed(2)}<br>
                    <strong>Saldo pendiente:</strong> $${saldoPendiente.toFixed(2)}
                </div>
            </div>
        `;
    }
    
    reciboContent.innerHTML = `
        <div class="recibo-header">
            <div class="recibo-empresa">${companyData ? companyData.nombre : 'Mi Empresa'}</div>
            <div>${companyData ? companyData.rif : 'RIF: X-XXXXXXXX-X'}</div>
            <div>${companyData ? companyData.telefono : 'Teléfono: XXXX-XXXX'}</div>
            <div>${companyData ? companyData.email : 'Email: info@empresa.com'}</div>
        </div>
        
        <div class="recibo-details">
            <div class="recibo-cliente">
                <h4>Cliente</h4>
                <p><strong>${cobranza.cliente}</strong></p>
                <p>${cobranza.telefono || 'Teléfono no disponible'}</p>
                <p>${cobranza.email || 'Email no disponible'}</p>
            </div>
            
            <div class="recibo-info">
                <h4>Información del Recibo</h4>
                <p><strong>Fecha de Emisión:</strong> ${formatDate(cobranza.fechaEmision)}</p>
                <p><strong>Fecha de Vencimiento:</strong> ${formatDate(cobranza.fechaVencimiento)}</p>
                <p><strong>Estado:</strong> <span class="status-badge ${estadoClase}">${estadoRecibo}</span></p>
                ${cobranza.estado !== 'pagado' && saldoPendiente > 0 ? 
                  `<p><strong>Días ${diffDays >= 0 ? 'restantes' : 'vencidos'}:</strong> ${Math.abs(diffDays)}</p>` : ''}
            </div>
        </div>
        
        <div class="recibo-items">
            <h4>Detalles de la Cobranza</h4>
            <div class="recibo-item">
                <span>Concepto</span>
                <span>Monto</span>
            </div>
            <div class="recibo-item">
                <span>Pago pendiente</span>
                <span>$${cobranza.monto}</span>
            </div>
        </div>
        
        <div class="recibo-total">
            <span>Total a Pagar:</span>
            <span>$${cobranza.monto}</span>
        </div>
        
        ${abonosHTML}
        
        ${cobranza.notas ? `
        <div class="recibo-notes" style="margin-top: 20px; padding-top: 15px; border-top: 1px solid var(--border);">
            <h4>Notas</h4>
            <p>${cobranza.notas}</p>
        </div>
        ` : ''}
        
        <div class="recibo-footer">
            <p>Este es un recibo generado automáticamente por PPB Cobranza</p>
            <p>Fecha de generación: ${new Date().toLocaleDateString('es-ES')}</p>
        </div>
    `;
    
    if (reciboModal) reciboModal.classList.add('active');
}

// Actualizar estadísticas del dashboard
function updateDashboardStats() {
    // Estadísticas de cobranzas
    const pending = cobranzas.filter(c => {
        const saldoPendiente = c.saldoPendiente || calcularSaldoPendiente(c);
        return c.estado !== 'pagado' && saldoPendiente > 0;
    }).length;
    
    const paid = cobranzas.filter(c => {
        const saldoPendiente = c.saldoPendiente || calcularSaldoPendiente(c);
        return c.estado === 'pagado' || saldoPendiente <= 0;
    }).length;
    
    const overdue = cobranzas.filter(c => {
        const today = new Date();
        const dueDate = new Date(c.fechaVencimiento);
        const saldoPendiente = c.saldoPendiente || calcularSaldoPendiente(c);
        return c.estado !== 'pagado' && saldoPendiente > 0 && dueDate < today;
    }).length;
    
    const totalAmount = cobranzas
        .filter(c => {
            const saldoPendiente = c.saldoPendiente || calcularSaldoPendiente(c);
            return c.estado !== 'pagado' && saldoPendiente > 0;
        })
        .reduce((sum, c) => sum + (c.saldoPendiente || calcularSaldoPendiente(c)), 0);
    
    // Estadísticas de proveedores
    const proveedoresCount = proveedores.length;
    
    const totalPagos = proveedores
        .filter(p => {
            const saldoPendiente = p.saldoPendiente || calcularSaldoPendienteProveedor(p);
            return p.estado !== 'pagado' && saldoPendiente > 0;
        })
        .reduce((sum, p) => sum + (p.saldoPendiente || calcularSaldoPendienteProveedor(p)), 0);
    
    if (document.getElementById('pendingCount')) document.getElementById('pendingCount').textContent = pending;
    if (document.getElementById('paidCount')) document.getElementById('paidCount').textContent = paid;
    if (document.getElementById('overdueCount')) document.getElementById('overdueCount').textContent = overdue;
    if (document.getElementById('proveedoresCount')) document.getElementById('proveedoresCount').textContent = proveedoresCount;
    if (document.getElementById('totalAmount')) document.getElementById('totalAmount').textContent = `$${totalAmount.toFixed(2)}`;
    if (document.getElementById('totalPagos')) document.getElementById('totalPagos').textContent = `$${totalPagos.toFixed(2)}`;
    
    updateStatusChart(pending, paid, overdue);
}

// Actualizar gráfico de estados
function updateStatusChart(pending, paid, overdue) {
    const ctx = document.getElementById('statusChart');
    if (!ctx) return;
    
    if (statusChart) {
        statusChart.destroy();
    }
    
    statusChart = new Chart(ctx.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Pendientes', 'Pagadas', 'Vencidas'],
            datasets: [{
                data: [pending, paid, overdue],
                backgroundColor: [
                    'rgba(255, 149, 0, 0.7)',
                    'rgba(52, 199, 89, 0.7)',
                    'rgba(255, 59, 48, 0.7)'
                ],
                borderColor: [
                    'rgba(255, 149, 0, 1)',
                    'rgba(52, 199, 89, 1)',
                    'rgba(255, 59, 48, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Actualizar lista de próximos vencimientos
function updateUpcomingList() {
    if (!upcomingList) return;
    
    upcomingList.innerHTML = '';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalizar a medianoche
    
    let upcomingItems = [];
    
    // Agregar cobranzas próximas a vencer
    cobranzas.forEach(cobranza => {
        if (cobranza.estado === 'pagado' || (cobranza.saldoPendiente && cobranza.saldoPendiente <= 0)) {
            return;
        }
        
        const dueDate = new Date(cobranza.fechaVencimiento);
        dueDate.setHours(0, 0, 0, 0); // Normalizar a medianoche
        
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Mostrar cobranzas que vencen en los próximos 7 días
        if (diffDays >= 0 && diffDays <= 7) {
            upcomingItems.push({
                type: 'cobranza',
                title: `Cobranza: ${cobranza.cliente}`,
                amount: `$${cobranza.monto}`,
                days: diffDays,
                date: dueDate,
                item: cobranza
            });
        }
    });
    
    // Agregar pagos a proveedores próximos a vencer
    proveedores.forEach(proveedor => {
        if (proveedor.estado === 'pagado' || (proveedor.saldoPendiente && proveedor.saldoPendiente <= 0)) {
            return;
        }
        
        const dueDate = new Date(proveedor.fechaVencimiento);
        dueDate.setHours(0, 0, 0, 0); // Normalizar a medianoche
        
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Mostrar proveedores que vencen en los próximos 7 días
        if (diffDays >= 0 && diffDays <= 7) {
            upcomingItems.push({
                type: 'proveedor',
                title: `Pago: ${proveedor.nombre}`,
                amount: `$${proveedor.monto}`,
                days: diffDays,
                date: dueDate,
                item: proveedor
            });
        }
    });
    
    // Ordenar por días más próximos
    upcomingItems.sort((a, b) => a.days - b.days);
    
    if (upcomingItems.length === 0) {
        upcomingList.innerHTML = `
            <div class="upcoming-item">
                <div class="upcoming-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                <div class="upcoming-content">
                    <div class="upcoming-title">Sin vencimientos próximos</div>
                    <div class="upcoming-time">No hay cobranzas o pagos que venzan en los próximos 7 días</div>
                </div>
            </div>
        `;
        return;
    }
    
    upcomingItems.slice(0, 5).forEach(item => {
        const div = document.createElement('div');
        div.className = 'upcoming-item';
        
        let icon = 'fas fa-file-invoice-dollar';
        let color = 'var(--warning)';
        
        if (item.type === 'proveedor') {
            icon = 'fas fa-truck';
            color = 'var(--secondary)';
        }
        
        div.innerHTML = `
            <div class="upcoming-icon" style="background-color: ${color}20; color: ${color};">
                <i class="${icon}"></i>
            </div>
            <div class="upcoming-content">
                <div class="upcoming-title">${item.title}</div>
                <div class="upcoming-time">Vence en ${item.days} día(s) - ${formatDate(item.date)}</div>
            </div>
            <div class="upcoming-amount">${item.amount}</div>
        `;
        
        upcomingList.appendChild(div);
    });
}

// Actualizar UI de actividad reciente
function updateRecentActivityUI() {
    const activityList = document.getElementById('recentActivity');
    if (!activityList) {
        console.error('❌ No se encontró el elemento recentActivity');
        return;
    }
    
    activityList.innerHTML = '';
    
    // Filtrar actividades de las últimas 24 horas
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentActivities = actividades
        .filter(activity => new Date(activity.fecha) >= twentyFourHoursAgo)
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        .slice(0, 10);
    
    if (recentActivities.length === 0) {
        activityList.innerHTML = `
            <li class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-info-circle"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">Sin actividad reciente</div>
                    <div class="activity-time">Realiza alguna acción para ver actividades aquí</div>
                </div>
            </li>
        `;
        return;
    }
    
    recentActivities.forEach(activity => {
        const li = document.createElement('li');
        li.className = 'activity-item';
        
        let icon = 'fas fa-info-circle';
        let color = 'var(--primary)';
        
        switch(activity.tipo) {
            case 'cobranza':
                icon = 'fas fa-file-invoice-dollar';
                break;
            case 'abono':
                icon = 'fas fa-hand-holding-usd';
                color = 'var(--success)';
                break;
            case 'mensaje':
                icon = 'fas fa-envelope';
                color = 'var(--warning)';
                break;
            case 'pago':
                icon = 'fas fa-check-circle';
                color = 'var(--success)';
                break;
            case 'proveedor':
                icon = 'fas fa-truck';
                color = 'var(--secondary)';
                break;
            case 'pago_proveedor':
                icon = 'fas fa-money-bill-wave';
                color = 'var(--success)';
                break;
            case 'sistema':
                icon = 'fas fa-cog';
                color = 'var(--gray)';
                break;
        }
        
        li.innerHTML = `
            <div class="activity-icon" style="background-color: ${color}20; color: ${color};">
                <i class="${icon}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-title">${activity.descripcion}</div>
                <div class="activity-time">${formatRelativeTime(activity.fecha)}</div>
                ${activity.detalles ? `<div class="activity-details" style="font-size: 0.8rem; color: var(--gray); margin-top: 5px;">${activity.detalles}</div>` : ''}
            </div>
        `;
        
        activityList.appendChild(li);
    });
}

// Exportar a Excel - Cobranzas
if (exportExcelBtn) {
    exportExcelBtn.addEventListener('click', function() {
        if (!requireAuth('exportar excel')) return;
        
        const data = cobranzas.map(cobranza => {
            const saldoPendiente = cobranza.saldoPendiente || calcularSaldoPendiente(cobranza);
            return {
                'Cliente': cobranza.cliente,
                'Teléfono': cobranza.telefono || '',
                'Monto Total': cobranza.monto,
                'Saldo Pendiente': saldoPendiente,
                'Abonos': abonos.filter(a => a.cobranzaId === cobranza.id).length,
                'Estado': cobranza.estado,
                'Fecha Emisión': formatDate(cobranza.fechaEmision),
                'Fecha Vencimiento': formatDate(cobranza.fechaVencimiento),
                'Notas': cobranza.notas || ''
            };
        });
        
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, 'Cobranzas');
        XLSX.writeFile(wb, 'cobranzas.xlsx');
    });
}

// Exportar a Excel - Proveedores
if (exportProveedoresBtn) {
    exportProveedoresBtn.addEventListener('click', function() {
        if (!requireAuth('exportar excel')) return;
        
        const data = proveedores.map(proveedor => {
            const saldoPendiente = proveedor.saldoPendiente || calcularSaldoPendienteProveedor(proveedor);
            return {
                'Proveedor': proveedor.nombre,
                'Contacto': proveedor.contacto || '',
                'Concepto': proveedor.concepto,
                'Monto Total': proveedor.monto,
                'Saldo Pendiente': saldoPendiente,
                'Pagos': pagosProveedores.filter(p => p.proveedorId === proveedor.id).length,
                'Estado': proveedor.estado,
                'Fecha Emisión': formatDate(proveedor.fechaEmision),
                'Fecha Vencimiento': formatDate(proveedor.fechaVencimiento),
                'Notas': proveedor.notas || ''
            };
        });
        
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, 'Proveedores');
        XLSX.writeFile(wb, 'proveedores.xlsx');
    });
}

// Formatear fecha
function formatDate(dateString) {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

// Formatear tiempo relativo
function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) {
        return 'Hace un momento';
    } else if (diffMins < 60) {
        return `Hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    } else if (diffHours < 24) {
        return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    } else if (diffDays < 7) {
        return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    } else {
        return formatDate(dateString);
    }
}

console.log("✅ app.js cargado correctamente");
