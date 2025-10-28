// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCqDkYDT2RDNkYOAvUoAd8RMT7AQ37EVWg",
    authDomain: "quake-cobranzas.firebaseapp.com",
    databaseURL: "https://quake-cobranzas-default-rtdb.firebaseio.com",
    projectId: "quake-cobranzas",
    storageBucket: "quake-cobranzas.firebasestorage.app",
    messagingSenderId: "278570669788",
    appId: "1:278570669788:web:50fba7fce26e0489784619"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// Variables globales
let currentUser = null;
let userData = null;
let companyData = null;
let cobranzas = [];
let statusChart = null;
let currentTab = 'all';

// CORRECCIÓN 1: Solo tu correo como administrador
const ADMIN_EMAIL = 'luishparedes94@gmail.com';
const ADMIN_PHONE = '+58-412-5278450';

// Elementos DOM
const authContainer = document.getElementById('authContainer');
const loginCard = document.getElementById('loginCard');
const registerCard = document.getElementById('registerCard');
const dashboard = document.getElementById('dashboard');
const cobranzasSection = document.getElementById('cobranzas');
const mensajesSection = document.getElementById('mensajes');
const empresaSection = document.getElementById('empresa');
const adminSection = document.getElementById('admin');
const userInfo = document.getElementById('userInfo');
const userAvatar = document.getElementById('userAvatar');
const userName = document.getElementById('userName');
const userPlanBadge = document.getElementById('userPlanBadge');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const logoutBtn = document.getElementById('logoutBtn');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const companyForm = document.getElementById('companyForm');
const cobranzaForm = document.getElementById('cobranzaForm');
const abonoForm = document.getElementById('abonoForm');
const messageForm = document.getElementById('messageForm');
const switchToRegister = document.getElementById('switchToRegister');
const switchToLogin = document.getElementById('switchToLogin');
const navLinks = document.querySelectorAll('.nav-link');
const tabs = document.querySelectorAll('.tab');
const cobranzasTableBody = document.getElementById('cobranzasTableBody');
const messagesTableBody = document.getElementById('messagesTableBody');
const usersTableBody = document.getElementById('usersTableBody');
const addCobranzaBtn = document.getElementById('addCobranzaBtn');
const addCobranzaBtn2 = document.getElementById('addCobranzaBtn2');
const addMessageBtn = document.getElementById('addMessageBtn');
const exportExcelBtn = document.getElementById('exportExcelBtn');
const refreshUsersBtn = document.getElementById('refreshUsersBtn');
const cobranzaModal = document.getElementById('cobranzaModal');
const abonoModal = document.getElementById('abonoModal');
const messageModal = document.getElementById('messageModal');
const reciboModal = document.getElementById('reciboModal');
const closeModals = document.querySelectorAll('.close-modal');
const freeLimitAlert = document.getElementById('freeLimitAlert');
const upgradePlanLink = document.getElementById('upgradePlanLink');
const cobranzaModalTitle = document.getElementById('cobranzaModalTitle');
const cobranzaSubmitBtn = document.getElementById('cobranzaSubmitBtn');
const cobranzaIdInput = document.getElementById('cobranzaId');
const printReciboBtn = document.getElementById('printReciboBtn');
const sendReciboBtn = document.getElementById('sendReciboBtn');
const connectionStatus = document.getElementById('connectionStatus');
const adminConnectionAlert = document.getElementById('adminConnectionAlert');
const copyNotification = document.getElementById('copyNotification');
const mainNav = document.getElementById('mainNav');
const messageChannel = document.getElementById('messageChannel');
const messageIcon = document.getElementById('messageIcon');
const messageText = document.getElementById('messageText');

// CORRECCIÓN: Input de teléfono para permitir guiones
const clientPhoneInput = document.getElementById('clientPhone');

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', function() {
    // Configurar monitoreo de conexión
    setupConnectionMonitoring();
    
    // Configurar listeners de autenticación
    setupAuthListeners();
    
    // Configurar navegación para usuarios no autenticados
    setupNavigationForUnauthenticated();
    
    // Configurar cambio de ícono en mensajes
    setupMessageChannelListener();
    
    // CORRECCIÓN: Configurar input de teléfono para permitir guiones
    setupPhoneInput();
    
    // Verificar estado de autenticación
    auth.onAuthStateChanged((user) => {
        if (user) {
            currentUser = user;
            loadUserData(user.uid);
            showApp();
        } else {
            currentUser = null;
            showAuth();
        }
    });
});

// CORRECCIÓN: Configurar input de teléfono para permitir guiones (formato simple)
function setupPhoneInput() {
    if (clientPhoneInput) {
        clientPhoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/[^\d]/g, ''); // Solo números
            
            // Formato automático: 412-1234567 (solo un guión)
            if (value.length > 3 && value.length <= 10) {
                value = value.substring(0, 3) + '-' + value.substring(3);
            }
            
            // Limitar a 11 caracteres máximo (3+1+7)
            if (value.length > 11) {
                value = value.substring(0, 11);
            }
            
            e.target.value = value;
        });
        
        clientPhoneInput.addEventListener('keydown', function(e) {
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
        clientPhoneInput.placeholder = '412-1234567';
    }
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

// Configurar monitoreo de conexión
function setupConnectionMonitoring() {
    const databaseRef = database.ref('.info/connected');
    databaseRef.on('value', (snapshot) => {
        const connected = snapshot.val();
        if (connected) {
            connectionStatus.textContent = 'Conectado';
            connectionStatus.className = 'connection-status connection-online';
            connectionStatus.style.display = 'block';
            if (adminConnectionAlert) adminConnectionAlert.style.display = 'none';
            
            setTimeout(() => {
                connectionStatus.style.display = 'none';
            }, 3000);
        } else {
            connectionStatus.textContent = 'Sin conexión';
            connectionStatus.className = 'connection-status connection-offline';
            connectionStatus.style.display = 'block';
            if (adminConnectionAlert) adminConnectionAlert.style.display = 'flex';
        }
    });
}

// Configurar navegación para usuarios no autenticados
function setupNavigationForUnauthenticated() {
    const navLinks = mainNav.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (!currentUser) {
                e.preventDefault();
                showNotification('Debes iniciar sesión para acceder a esta sección', 'warning');
                authContainer.style.display = 'flex';
                loginCard.style.display = 'block';
                registerCard.style.display = 'none';
            }
        });
    });
}

// Mostrar notificación
function showNotification(message, type = 'info') {
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

// Configurar listeners de autenticación
function setupAuthListeners() {
    // Switch entre login y registro
    if (switchToRegister) {
        switchToRegister.addEventListener('click', function(e) {
            e.preventDefault();
            loginCard.style.display = 'none';
            registerCard.style.display = 'block';
        });
    }

    if (switchToLogin) {
        switchToLogin.addEventListener('click', function(e) {
            e.preventDefault();
            registerCard.style.display = 'none';
            loginCard.style.display = 'block';
        });
    }

    // Formulario de login
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            auth.signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    console.log('Usuario autenticado:', userCredential.user);
                    loginForm.reset();
                    showNotification('Sesión iniciada correctamente', 'success');
                })
                .catch((error) => {
                    showNotification('Error al iniciar sesión: ' + error.message, 'danger');
                });
        });
    }

    // Formulario de registro
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            
            auth.createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    const user = userCredential.user;
                    
                    return database.ref('users/' + user.uid).set({
                        email: user.email,
                        nombre: name,
                        plan: 'free',
                        activo: true,
                        fechaRegistro: new Date().toISOString()
                    });
                })
                .then(() => {
                    console.log('Usuario registrado exitosamente');
                    registerForm.reset();
                    if (switchToLogin) switchToLogin.click();
                    showNotification('Cuenta creada exitosamente', 'success');
                })
                .catch((error) => {
                    showNotification('Error al registrar usuario: ' + error.message, 'danger');
                });
        });
    }

    // Botones de login/registro/logout
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            authContainer.style.display = 'flex';
            dashboard.style.display = 'none';
            cobranzasSection.style.display = 'none';
            mensajesSection.style.display = 'none';
            empresaSection.style.display = 'none';
            adminSection.style.display = 'none';
            loginCard.style.display = 'block';
            registerCard.style.display = 'none';
        });
    }

    if (registerBtn) {
        registerBtn.addEventListener('click', function() {
            authContainer.style.display = 'flex';
            loginCard.style.display = 'none';
            registerCard.style.display = 'block';
            dashboard.style.display = 'none';
            cobranzasSection.style.display = 'none';
            mensajesSection.style.display = 'none';
            empresaSection.style.display = 'none';
            adminSection.style.display = 'none';
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            auth.signOut()
                .then(() => {
                    console.log('Sesión cerrada');
                    showNotification('Sesión cerrada correctamente', 'success');
                })
                .catch((error) => {
                    console.error('Error al cerrar sesión:', error);
                });
        });
    }
}

// Cargar datos del usuario desde Realtime Database
function loadUserData(userId) {
    database.ref('users/' + userId).once('value')
        .then((snapshot) => {
            if (snapshot.exists()) {
                userData = snapshot.val();
                userData.userId = userId;
                
                updateUserUI();
                loadCompanyData(userId);
                loadCobranzas(userId);
                loadRecentActivity(userId);
                
                // CORRECCIÓN 2: Solo tu correo tiene acceso administrativo
                if (userData.email === ADMIN_EMAIL) {
                    document.querySelectorAll('.admin-only').forEach(el => {
                        el.style.display = 'block';
                    });
                    loadAdminData();
                }
            }
        })
        .catch((error) => {
            console.error('Error al cargar datos del usuario:', error);
        });
}

// Cargar datos de la empresa
function loadCompanyData(userId) {
    database.ref('empresas/' + userId).once('value')
        .then((snapshot) => {
            if (snapshot.exists()) {
                companyData = snapshot.val();
                companyData.userId = userId;
                
                document.getElementById('companyName').value = companyData.nombre || '';
                document.getElementById('companyRif').value = companyData.rif || '';
                document.getElementById('companyPhone').value = companyData.telefono || '';
                document.getElementById('companyEmail').value = companyData.email || '';
                document.getElementById('companyContacts').value = companyData.contactos || '';
            }
        })
        .catch((error) => {
            console.error('Error al cargar datos de la empresa:', error);
        });
}

// Cargar cobranzas del usuario - CORREGIDO: Evitar duplicación
function loadCobranzas(userId) {
    database.ref('cobranzas').orderByChild('userId').equalTo(userId).on('value', (snapshot) => {
        cobranzas = [];
        snapshot.forEach((childSnapshot) => {
            const cobranza = childSnapshot.val();
            cobranza.id = childSnapshot.key;
            
            // Cargar abonos para esta cobranza
            loadAbonos(cobranza.id).then(abonos => {
                cobranza.abonos = abonos || [];
                cobranza.saldoPendiente = calcularSaldoPendiente(cobranza);
            });
            
            cobranzas.push(cobranza);
        });
        
        cobranzas.sort((a, b) => new Date(b.fechaEmision) - new Date(a.fechaEmision));
        
        updateCobranzasUI();
        updateDashboardStats();
        
        if (userData.plan === 'free' && cobranzas.length >= 3) {
            if (freeLimitAlert) freeLimitAlert.style.display = 'flex';
        } else {
            if (freeLimitAlert) freeLimitAlert.style.display = 'none';
        }
    });
}

// CORRECCIÓN: Cargar actividad reciente en tiempo real
function loadRecentActivity(userId) {
    console.log('🔍 Cargando actividades para usuario:', userId);
    
    database.ref('actividades')
        .orderByChild('userId')
        .equalTo(userId)
        .on('value', (snapshot) => {
            const activities = [];
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            
            console.log('📊 Actividades encontradas en BD:', snapshot.numChildren());
            
            snapshot.forEach((childSnapshot) => {
                const activity = childSnapshot.val();
                activity.id = childSnapshot.key;
                
                const activityDate = new Date(activity.fecha);
                const isRecent = activityDate >= twentyFourHoursAgo;
                
                console.log('📅 Actividad:', activity.descripcion, '| Fecha:', activity.fecha, '| Es reciente:', isRecent);
                
                // Mostrar actividades de las últimas 24 horas
                if (isRecent) {
                    activities.push(activity);
                } else {
                    // Eliminar actividad antigua en segundo plano
                    database.ref('actividades/' + childSnapshot.key).remove()
                        .then(() => console.log('🗑️ Actividad antigua eliminada:', activity.descripcion))
                        .catch(error => console.error('❌ Error eliminando actividad:', error));
                }
            });
            
            console.log('🎯 Actividades a mostrar:', activities.length);
            activities.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
            updateRecentActivityUI(activities);
        });
}

// CORRECCIÓN: Mejorar actualización de actividad reciente
function updateRecentActivityUI(activities) {
    const activityList = document.getElementById('recentActivity');
    if (!activityList) {
        console.error('❌ No se encontró el elemento recentActivity');
        return;
    }
    
    activityList.innerHTML = '';
    
    console.log('🔄 Actualizando UI con:', activities.length, 'actividades');
    
    if (activities.length === 0) {
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
    
    activities.slice(0, 10).forEach(activity => {
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
    
    console.log('✅ UI actualizada correctamente');
}

// Registrar actividad
function registrarActividad(tipo, descripcion, detalles = null) {
    if (!currentUser || !userData) return;
    
    const actividadData = {
        userId: currentUser.uid,
        tipo: tipo,
        descripcion: descripcion,
        detalles: detalles,
        fecha: new Date().toISOString(),
        usuario: userData.nombre
    };
    
    database.ref('actividades').push(actividadData)
        .then(() => {
            console.log('✅ Actividad registrada:', descripcion);
        })
        .catch((error) => {
            console.error('❌ Error al registrar actividad:', error);
        });
}

// Cargar abonos para una cobranza
function loadAbonos(cobranzaId) {
    return database.ref('abonos').orderByChild('cobranzaId').equalTo(cobranzaId).once('value')
        .then((snapshot) => {
            const abonos = [];
            snapshot.forEach((childSnapshot) => {
                const abono = childSnapshot.val();
                abono.id = childSnapshot.key;
                abonos.push(abono);
            });
            return abonos;
        })
        .catch((error) => {
            console.error('Error al cargar abonos:', error);
            return [];
        });
}

// Calcular saldo pendiente
function calcularSaldoPendiente(cobranza) {
    const totalAbonado = cobranza.abonos ? cobranza.abonos.reduce((sum, abono) => sum + parseFloat(abono.monto), 0) : 0;
    return parseFloat(cobranza.monto) - totalAbonado;
}

// CORRECCIÓN 3: Actualizar UI del usuario sin duplicar badges
function updateUserUI() {
    if (userName) userName.textContent = userData.nombre;
    if (userAvatar) userAvatar.textContent = userData.nombre.charAt(0).toUpperCase();
    
    // Limpiar badge anterior antes de crear uno nuevo
    const existingBadge = userInfo.querySelector('.plan-badge');
    if (existingBadge) {
        existingBadge.remove();
    }
    
    // Crear y mostrar el badge del plan
    if (userPlanBadge) {
        userPlanBadge.textContent = userData.plan === 'free' ? 'Free' : 'Pro';
        userPlanBadge.className = `plan-badge plan-${userData.plan}`;
        userPlanBadge.style.display = 'inline-block';
    }
}

// Actualizar UI de cobranzas
function updateCobranzasUI() {
    if (!cobranzasTableBody) return;
    
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
        
        tr.innerHTML = `
            <td>
                <strong>${cobranza.cliente}</strong>
                ${cobranza.abonos && cobranza.abonos.length > 0 ? 
                  `<br><small>${cobranza.abonos.length} abono(s)</small>` : ''}
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
}

// Abrir modal para registrar abono
function openAbonoModal(cobranzaId) {
    const cobranza = cobranzas.find(c => c.id === cobranzaId);
    if (!cobranza) return;
    
    document.getElementById('abonoCobranzaId').value = cobranzaId;
    document.getElementById('deudaTotal').textContent = cobranza.monto;
    
    const saldoPendiente = cobranza.saldoPendiente || calcularSaldoPendiente(cobranza);
    document.getElementById('abonoMonto').setAttribute('max', saldoPendiente);
    document.getElementById('abonoMonto').value = '';
    document.getElementById('abonoFecha').valueAsDate = new Date();
    document.getElementById('abonoNotas').value = '';
    
    document.getElementById('abonoMonto').addEventListener('input', function() {
        const montoAbono = parseFloat(this.value) || 0;
        const nuevoSaldo = saldoPendiente - montoAbono;
        document.getElementById('saldoDespues').textContent = nuevoSaldo.toFixed(2);
    });
    
    document.getElementById('saldoDespues').textContent = saldoPendiente.toFixed(2);
    
    abonoModal.classList.add('active');
}

// Ver abonos de una cobranza
function verAbonos(cobranzaId) {
    const cobranza = cobranzas.find(c => c.id === cobranzaId);
    if (!cobranza) return;
    
    let abonosHTML = '';
    if (cobranza.abonos && cobranza.abonos.length > 0) {
        cobranza.abonos.forEach(abono => {
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

// Actualizar estadísticas del dashboard
function updateDashboardStats() {
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
    
    document.getElementById('pendingCount').textContent = pending;
    document.getElementById('paidCount').textContent = paid;
    document.getElementById('overdueCount').textContent = overdue;
    document.getElementById('totalAmount').textContent = `$${totalAmount.toFixed(2)}`;
    
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

// Mostrar aplicación (usuario autenticado)
function showApp() {
    authContainer.style.display = 'none';
    dashboard.style.display = 'block';
    userInfo.style.display = 'flex';
    loginBtn.style.display = 'none';
    registerBtn.style.display = 'none';
    logoutBtn.style.display = 'block';
    
    setupNavigation();
    setupModals();
    setupForms();
    setupTabs();
}

// Mostrar autenticación (usuario no autenticado)
function showAuth() {
    authContainer.style.display = 'flex';
    loginCard.style.display = 'block';
    registerCard.style.display = 'none';
    dashboard.style.display = 'none';
    cobranzasSection.style.display = 'none';
    mensajesSection.style.display = 'none';
    empresaSection.style.display = 'none';
    adminSection.style.display = 'none';
    userInfo.style.display = 'none';
    loginBtn.style.display = 'inline-block';
    registerBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';
    
    // Ocultar todas las secciones excepto auth
    document.querySelectorAll('.dashboard, .admin-panel').forEach(section => {
        section.style.display = 'none';
    });
}

// Configurar navegación
function setupNavigation() {
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            dashboard.style.display = 'none';
            cobranzasSection.style.display = 'none';
            mensajesSection.style.display = 'none';
            empresaSection.style.display = 'none';
            adminSection.style.display = 'none';
            
            const target = this.getAttribute('data-target');
            document.getElementById(target).style.display = 'block';
            
            if (target === 'admin') {
                loadAdminData();
            }
        });
    });
}

// Configurar modales
function setupModals() {
    if (addCobranzaBtn) {
        addCobranzaBtn.addEventListener('click', openCobranzaModal);
    }
    if (addCobranzaBtn2) {
        addCobranzaBtn2.addEventListener('click', openCobranzaModal);
    }
    if (addMessageBtn) {
        addMessageBtn.addEventListener('click', openMessageModal);
    }
    
    closeModals.forEach(btn => {
        btn.addEventListener('click', function() {
            cobranzaModal.classList.remove('active');
            abonoModal.classList.remove('active');
            messageModal.classList.remove('active');
            reciboModal.classList.remove('active');
        });
    });
    
    window.addEventListener('click', function(e) {
        if (e.target === cobranzaModal) cobranzaModal.classList.remove('active');
        if (e.target === abonoModal) abonoModal.classList.remove('active');
        if (e.target === messageModal) messageModal.classList.remove('active');
        if (e.target === reciboModal) reciboModal.classList.remove('active');
    });
    
    if (printReciboBtn) {
        printReciboBtn.addEventListener('click', function() {
            const reciboContent = document.getElementById('reciboContent').innerHTML;
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
                        <div class="recibo-container">${reciboContent}</div>
                    </body>
                </html>
            `);
            ventana.document.close();
            ventana.print();
        });
    }
}

// Configurar formularios
function setupForms() {
    // Formulario de empresa
    if (companyForm) {
        companyForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const companyData = {
                userId: currentUser.uid,
                nombre: document.getElementById('companyName').value,
                rif: document.getElementById('companyRif').value,
                telefono: document.getElementById('companyPhone').value,
                email: document.getElementById('companyEmail').value,
                contactos: document.getElementById('companyContacts').value,
                fechaActualizacion: new Date().toISOString()
            };
            
            database.ref('empresas/' + currentUser.uid).set(companyData)
                .then(() => {
                    showNotification('Datos de empresa guardados correctamente', 'success');
                    loadCompanyData(currentUser.uid);
                    registrarActividad('sistema', 'Datos de empresa actualizados', `Empresa: ${companyData.nombre}`);
                })
                .catch((error) => {
                    showNotification('Error al guardar datos: ' + error.message, 'danger');
                });
        });
    }
    
    // Formulario de cobranza - CORREGIDO: Evitar duplicación
    let isSubmitting = false;
    
    if (cobranzaForm) {
        cobranzaForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (isSubmitting) {
                showNotification('Ya se está procesando la cobranza...', 'warning');
                return;
            }
            
            if (userData.plan === 'free' && cobranzas.length >= 3 && !cobranzaIdInput.value) {
                showNotification('Has alcanzado el límite de 3 cobranzas para el plan Free. Contacta al administrador para actualizar a Pro.', 'warning');
                return;
            }
            
            // CORRECCIÓN: Formatear teléfono manteniendo guiones para display pero guardando limpio
            let telefono = document.getElementById('clientPhone').value;
            // Guardar con código de país pero sin guiones para consistencia
            let telefonoLimpio = telefono.replace(/-/g, '');
            if (telefonoLimpio && !telefonoLimpio.startsWith('+58')) {
                telefonoLimpio = '+58' + telefonoLimpio;
            }
            
            const cobranzaData = {
                userId: currentUser.uid,
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
            
            isSubmitting = true;
            cobranzaSubmitBtn.disabled = true;
            cobranzaSubmitBtn.textContent = 'Guardando...';
            
            if (cobranzaIdInput.value) {
                database.ref('cobranzas/' + cobranzaIdInput.value).update(cobranzaData)
                    .then(() => {
                        showNotification('Cobranza actualizada correctamente', 'success');
                        cobranzaForm.reset();
                        cobranzaModal.classList.remove('active');
                        cobranzaIdInput.value = '';
                        cobranzaModalTitle.textContent = 'Nueva Cobranza';
                        cobranzaSubmitBtn.textContent = 'Guardar Cobranza';
                        registrarActividad('cobranza', `Cobranza actualizada - ${cobranzaData.cliente}`, `Monto: $${cobranzaData.monto}`);
                    })
                    .catch((error) => {
                        showNotification('Error al actualizar cobranza: ' + error.message, 'danger');
                    })
                    .finally(() => {
                        isSubmitting = false;
                        cobranzaSubmitBtn.disabled = false;
                    });
            } else {
                database.ref('cobranzas').push(cobranzaData)
                    .then(() => {
                        showNotification('Cobranza agregada correctamente', 'success');
                        cobranzaForm.reset();
                        cobranzaModal.classList.remove('active');
                        registrarActividad('cobranza', `Nueva cobranza creada - ${cobranzaData.cliente}`, `Monto: $${cobranzaData.monto}, Vence: ${formatDate(cobranzaData.fechaVencimiento)}`);
                    })
                    .catch((error) => {
                        showNotification('Error al agregar cobranza: ' + error.message, 'danger');
                    })
                    .finally(() => {
                        isSubmitting = false;
                        cobranzaSubmitBtn.disabled = false;
                        cobranzaSubmitBtn.textContent = 'Guardar Cobranza';
                    });
            }
        });
    }
    
    // Formulario de abono
    if (abonoForm) {
        abonoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const cobranzaId = document.getElementById('abonoCobranzaId').value;
            const cobranza = cobranzas.find(c => c.id === cobranzaId);
            
            if (!cobranza) {
                showNotification('Cobranza no encontrada', 'danger');
                return;
            }
            
            const abonoData = {
                cobranzaId: cobranzaId,
                userId: currentUser.uid,
                monto: parseFloat(document.getElementById('abonoMonto').value),
                fecha: document.getElementById('abonoFecha').value,
                notas: document.getElementById('abonoNotas').value,
                fechaRegistro: new Date().toISOString()
            };
            
            database.ref('abonos').push(abonoData)
                .then(() => {
                    // Actualizar saldo pendiente en la cobranza
                    const nuevoSaldo = calcularSaldoPendiente(cobranza) - abonoData.monto;
                    database.ref('cobranzas/' + cobranzaId).update({
                        saldoPendiente: nuevoSaldo
                    })
                    .then(() => {
                        showNotification('Abono registrado correctamente', 'success');
                        abonoForm.reset();
                        abonoModal.classList.remove('active');
                        
                        // Registrar actividad
                        registrarActividad('abono', `Abono registrado - ${cobranza.cliente}`, `Monto: $${abonoData.monto}, Nuevo saldo: $${nuevoSaldo.toFixed(2)}`);
                        
                        // Si el saldo llega a cero, marcar como pagado
                        if (nuevoSaldo <= 0) {
                            database.ref('cobranzas/' + cobranzaId).update({
                                estado: 'pagado'
                            }).then(() => {
                                registrarActividad('pago', `Cobranza pagada completamente - ${cobranza.cliente}`);
                            });
                        }
                    });
                })
                .catch((error) => {
                    showNotification('Error al registrar abono: ' + error.message, 'danger');
                });
        });
    }
    
    // Formulario de mensaje
    if (messageForm) {
        messageForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
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
                userId: currentUser.uid,
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
            
            database.ref('mensajes').push(messageData)
                .then(() => {
                    messageForm.reset();
                    messageModal.classList.remove('active');
                })
                .catch((error) => {
                    showNotification('Error al guardar mensaje: ' + error.message, 'danger');
                });
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
                        .replace('{empresa}', companyData.nombre)
                        .replace('{monto}', `$${client.monto}`)
                        .replace('{vencimiento}', formatDate(client.fechaVencimiento))
                        .replace('{telefono}', companyData.telefono);
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
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentTab = this.getAttribute('data-tab');
            updateCobranzasUI();
        });
    });
}

// Abrir modal de cobranza
function openCobranzaModal() {
    document.getElementById('issueDate').valueAsDate = new Date();
    
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    document.getElementById('dueDate').valueAsDate = dueDate;
    
    cobranzaForm.reset();
    cobranzaIdInput.value = '';
    cobranzaModalTitle.textContent = 'Nueva Cobranza';
    cobranzaSubmitBtn.textContent = 'Guardar Cobranza';
    cobranzaSubmitBtn.disabled = false;
    
    cobranzaModal.classList.add('active');
}

// Editar cobranza
function editCobranza(cobranzaId) {
    const cobranza = cobranzas.find(c => c.id === cobranzaId);
    if (!cobranza) return;
    
    document.getElementById('clientName').value = cobranza.cliente;
    
    // CORRECCIÓN: Mostrar teléfono formateado correctamente
    let telefono = cobranza.telefono || '';
    if (telefono.startsWith('+58')) {
        telefono = telefono.substring(3); // Remover +58
    }
    // Formatear como 412-1234567 (solo números y un guión)
    telefono = telefono.replace(/\D/g, ''); // Solo números
    if (telefono.length > 3) {
        telefono = telefono.substring(0, 3) + '-' + telefono.substring(3);
    }
    document.getElementById('clientPhone').value = telefono;
    
    document.getElementById('clientEmail').value = cobranza.email || '';
    document.getElementById('amount').value = cobranza.monto;
    document.getElementById('issueDate').value = cobranza.fechaEmision;
    document.getElementById('dueDate').value = cobranza.fechaVencimiento;
    document.getElementById('notes').value = cobranza.notas || '';
    
    cobranzaIdInput.value = cobranzaId;
    cobranzaModalTitle.textContent = 'Editar Cobranza';
    cobranzaSubmitBtn.textContent = 'Actualizar Cobranza';
    
    cobranzaModal.classList.add('active');
}

// Abrir modal de mensaje
function openMessageModal() {
    const clientSelect = document.getElementById('messageClient');
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
    
    messageModal.classList.add('active');
}

// Abrir modal de mensaje para una cobranza específica
function openMessageModalForCobranza(cobranzaId) {
    openMessageModal();
    document.getElementById('messageClient').value = cobranzaId;
    
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
        
        document.getElementById('messageType').value = messageType;
        document.getElementById('messageType').dispatchEvent(new Event('change'));
    }
}

// Enviar mensaje por WhatsApp - CORREGIDO: No abrir nueva pestaña si ya está abierta
function enviarWhatsApp(cliente, mensaje) {
    const telefono = cliente.telefono;
    if (!telefono) {
        showNotification('El cliente no tiene número de teléfono registrado', 'warning');
        return false;
    }
    
    // Asegurarse de que el teléfono tenga el formato correcto
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
    
    // Intentar abrir en la misma pestaña si es posible
    window.open(whatsappURL, '_self').focus();
    return true;
}

// Generar recibo
function generateRecibo(cobranzaId) {
    const cobranza = cobranzas.find(c => c.id === cobranzaId);
    if (!cobranza) return;
    
    const reciboContent = document.getElementById('reciboContent');
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
    
    let abonosHTML = '';
    if (cobranza.abonos && cobranza.abonos.length > 0) {
        abonosHTML = `
            <div class="abonos-section">
                <h4>Historial de Abonos</h4>
                ${cobranza.abonos.map(abono => `
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
    
    reciboModal.classList.add('active');
}

// Marcar cobranza como pagada
function markAsPaid(cobranzaId) {
    if (confirm('¿Estás seguro de que quieres marcar esta cobranza como pagada?')) {
        const cobranza = cobranzas.find(c => c.id === cobranzaId);
        database.ref('cobranzas/' + cobranzaId).update({
            estado: 'pagado',
            saldoPendiente: 0
        })
        .then(() => {
            showNotification('Cobranza marcada como pagada', 'success');
            registrarActividad('pago', `Cobranza marcada como pagada - ${cobranza.cliente}`, `Monto: $${cobranza.monto}`);
        })
        .catch((error) => {
            showNotification('Error al actualizar cobranza: ' + error.message, 'danger');
        });
    }
}

// Eliminar cobranza
function deleteCobranza(cobranzaId) {
    if (confirm('¿Estás seguro de que quieres eliminar esta cobranza?')) {
        const cobranza = cobranzas.find(c => c.id === cobranzaId);
        // Primero eliminar todos los abonos asociados
        database.ref('abonos').orderByChild('cobranzaId').equalTo(cobranzaId).once('value')
            .then((snapshot) => {
                const promises = [];
                snapshot.forEach((childSnapshot) => {
                    promises.push(database.ref('abonos/' + childSnapshot.key).remove());
                });
                return Promise.all(promises);
            })
            .then(() => {
                // Luego eliminar la cobranza
                return database.ref('cobranzas/' + cobranzaId).remove();
            })
            .then(() => {
                showNotification('Cobranza eliminada', 'success');
                registrarActividad('sistema', `Cobranza eliminada - ${cobranza.cliente}`, `Monto: $${cobranza.monto}`);
            })
            .catch((error) => {
                showNotification('Error al eliminar cobranza: ' + error.message, 'danger');
            });
    }
}

// Cargar datos para el panel de administración
function loadAdminData() {
    database.ref('users').once('value')
        .then((snapshot) => {
            const users = [];
            snapshot.forEach((childSnapshot) => {
                const user = childSnapshot.val();
                user.id = childSnapshot.key;
                users.push(user);
            });
            
            updateAdminUI(users);
        })
        .catch((error) => {
            console.error('Error al cargar usuarios:', error);
            adminConnectionAlert.style.display = 'flex';
        });
}

// Actualizar UI del panel de administración
function updateAdminUI(users) {
    if (!usersTableBody) return;
    
    usersTableBody.innerHTML = '';
    
    if (users.length === 0) {
        usersTableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 30px;">
                    <i class="fas fa-users" style="font-size: 2rem; color: var(--gray); margin-bottom: 10px; display: block;"></i>
                    <p>No hay usuarios registrados</p>
                </td>
            </tr>
        `;
        return;
    }
    
    document.getElementById('totalUsers').textContent = users.length;
    document.getElementById('proUsers').textContent = users.filter(u => u.plan === 'pro').length;
    document.getElementById('inactiveUsers').textContent = users.filter(u => !u.activo).length;
    
    database.ref('cobranzas').once('value')
        .then((snapshot) => {
            document.getElementById('totalCobranzasAdmin').textContent = snapshot.numChildren();
        });
    
    users.forEach(user => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>${user.nombre}</td>
            <td>${user.email}</td>
            <td><span class="plan-badge plan-${user.plan}">${user.plan === 'free' ? 'Free' : 'Pro'}</span></td>
            <td>${user.activo ? 'Activo' : 'Inactivo'}</td>
            <td class="user-cobranzas-count">Cargando...</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon toggle-active" data-id="${user.id}" data-active="${user.activo}" title="${user.activo ? 'Desactivar' : 'Activar'}">
                        <i class="fas ${user.activo ? 'fa-user-slash' : 'fa-user-check'}" style="color: ${user.activo ? 'var(--warning)' : 'var(--success)'};"></i>
                    </button>
                    <button class="btn-icon toggle-plan" data-id="${user.id}" data-plan="${user.plan}" title="${user.plan === 'free' ? 'Hacer Pro' : 'Hacer Free'}">
                        <i class="fas ${user.plan === 'free' ? 'fa-crown' : 'fa-user'}" style="color: ${user.plan === 'free' ? 'var(--secondary)' : 'var(--gray)'};"></i>
                    </button>
                </div>
            </td>
        `;
        
        usersTableBody.appendChild(tr);
        
        database.ref('cobranzas').orderByChild('userId').equalTo(user.id).once('value')
            .then((snapshot) => {
                const count = snapshot.numChildren();
                tr.querySelector('.user-cobranzas-count').textContent = count;
            });
    });
    
    document.querySelectorAll('.toggle-active').forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-id');
            const currentActive = this.getAttribute('data-active') === 'true';
            
            database.ref('users/' + userId).update({
                activo: !currentActive
            })
            .then(() => {
                showNotification(`Usuario ${!currentActive ? 'activado' : 'desactivado'} correctamente`, 'success');
                loadAdminData();
            })
            .catch((error) => {
                showNotification('Error al actualizar usuario: ' + error.message, 'danger');
            });
        });
    });
    
    document.querySelectorAll('.toggle-plan').forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-id');
            const currentPlan = this.getAttribute('data-plan');
            const newPlan = currentPlan === 'free' ? 'pro' : 'free';
            
            database.ref('users/' + userId).update({
                plan: newPlan
            })
            .then(() => {
                showNotification(`Usuario actualizado a plan ${newPlan}`, 'success');
                loadAdminData();
            })
            .catch((error) => {
                showNotification('Error al actualizar usuario: ' + error.message, 'danger');
            });
        });
    });
}

// Exportar a Excel
if (exportExcelBtn) {
    exportExcelBtn.addEventListener('click', function() {
        const data = cobranzas.map(cobranza => {
            const saldoPendiente = cobranza.saldoPendiente || calcularSaldoPendiente(cobranza);
            return {
                'Cliente': cobranza.cliente,
                'Teléfono': cobranza.telefono || '',
                'Monto Total': cobranza.monto,
                'Saldo Pendiente': saldoPendiente,
                'Abonos': cobranza.abonos ? cobranza.abonos.length : 0,
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

// Formatear fecha
function formatDate(dateString) {
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

// Actualizar datos de admin
if (refreshUsersBtn) {
    refreshUsersBtn.addEventListener('click', loadAdminData);
}

// Enlace para actualizar plan - CORREGIDO: Mensaje con información de contacto
if (upgradePlanLink) {
    upgradePlanLink.addEventListener('click', function(e) {
        e.preventDefault();
        const mensaje = `Hola, estoy interesado en actualizar a Plan Pro. Mi usuario es: ${userData.email}\n\nContacto del administrador:\nEmail: ${ADMIN_EMAIL}\nTeléfono: ${ADMIN_PHONE}`;
        copyToClipboard(mensaje);
        showNotification('Información de contacto copiada al portapapeles', 'info');
    });
}

// Enviar recibo por email
if (sendReciboBtn) {
    sendReciboBtn.addEventListener('click', function() {
        const reciboText = document.getElementById('reciboContent').innerText;
        copyToClipboard(reciboText);
        showNotification('Recibo copiado al portapapeles. Péguelo en su cliente de email.', 'success');
    });
}
