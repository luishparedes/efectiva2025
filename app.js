// PPB Cobranza - App Principal
// Variables globales
let currentUser = null;
let userData = null;
let companyData = null;
let cobranzas = [];
let mensajes = [];
let statusChart = null;
let currentCobranzaFilter = 'all';

// Inicialización de la aplicación
document.addEventListener('DOMContentLoaded', function() {
    console.log('PPB Cobranza iniciando...');
    initializeApp();
});

function initializeApp() {
    setupAuthListeners();
    setupNavigation();
    setupModals();
    setupForms();
    setupTabs();
    
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
}

// ========== CONFIGURACIÓN INICIAL ==========

function setupAuthListeners() {
    // Switch entre login y registro
    document.getElementById('switchToRegister').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('loginCard').style.display = 'none';
        document.getElementById('registerCard').style.display = 'block';
    });

    document.getElementById('switchToLogin').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('registerCard').style.display = 'none';
        document.getElementById('loginCard').style.display = 'block';
    });

    // Formulario de login
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                console.log('Usuario autenticado:', userCredential.user);
                showAlert('¡Bienvenido a PPB Cobranza!', 'success');
            })
            .catch((error) => {
                showAlert('Error al iniciar sesión: ' + error.message, 'error');
            });
    });

    // Formulario de registro
    document.getElementById('registerForm').addEventListener('submit', function(e) {
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
                showAlert('¡Cuenta creada exitosamente!', 'success');
                document.getElementById('registerForm').reset();
                document.getElementById('switchToLogin').click();
            })
            .catch((error) => {
                showAlert('Error al registrar: ' + error.message, 'error');
            });
    });

    // Botones de login/registro/logout
    document.getElementById('loginBtn').addEventListener('click', showAuthScreen);
    document.getElementById('registerBtn').addEventListener('click', showRegisterScreen);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
}

function setupNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            showSection(this.getAttribute('data-target'));
        });
    });
}

function setupModals() {
    document.getElementById('addCobranzaBtn').addEventListener('click', () => openCobranzaModal());
    document.getElementById('addCobranzaBtn2').addEventListener('click', () => openCobranzaModal());
    document.getElementById('addMessageBtn').addEventListener('click', () => openMessageModal());
    
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });
    
    window.addEventListener('click', function(e) {
        if (e.target === document.getElementById('cobranzaModal')) closeAllModals();
        if (e.target === document.getElementById('messageModal')) closeAllModals();
    });
}

function setupForms() {
    document.getElementById('companyForm').addEventListener('submit', handleCompanySubmit);
    document.getElementById('cobranzaForm').addEventListener('submit', handleCobranzaSubmit);
    document.getElementById('messageForm').addEventListener('submit', handleMessageSubmit);
    
    document.getElementById('messageType').addEventListener('change', updateMessageContent);
    document.getElementById('messageClient').addEventListener('change', updateMessageContent);
}

function setupTabs() {
    document.querySelectorAll('#cobranzas .tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('#cobranzas .tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            currentCobranzaFilter = this.getAttribute('data-tab');
            updateCobranzasUI();
        });
    });

    document.querySelectorAll('#mensajes .tab').forEach(tab => {
        tab.addEventListener('click', function() {
            document.querySelectorAll('#mensajes .tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            updateMessagesUI();
        });
    });
}

// ========== FUNCIONES PRINCIPALES ==========

function showAuthScreen() {
    document.getElementById('authContainer').style.display = 'flex';
    hideAllSections();
}

function showRegisterScreen() {
    document.getElementById('authContainer').style.display = 'flex';
    document.getElementById('loginCard').style.display = 'none';
    document.getElementById('registerCard').style.display = 'block';
    hideAllSections();
}

function handleLogout() {
    auth.signOut()
        .then(() => {
            showAlert('Sesión cerrada correctamente', 'success');
        })
        .catch((error) => {
            showAlert('Error al cerrar sesión: ' + error.message, 'error');
        });
}

function showSection(sectionId) {
    hideAllSections();
    document.getElementById(sectionId).style.display = 'block';
    
    if (sectionId === 'admin') {
        loadAdminData();
    }
}

function hideAllSections() {
    const sections = ['dashboard', 'cobranzas', 'mensajes', 'empresa', 'admin', 'authContainer'];
    sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) element.style.display = 'none';
    });
}

function showApp() {
    hideAllSections();
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('userInfo').style.display = 'flex';
    document.getElementById('loginBtn').style.display = 'none';
    document.getElementById('registerBtn').style.display = 'none';
    document.getElementById('logoutBtn').style.display = 'block';
}

function showAuth() {
    hideAllSections();
    document.getElementById('authContainer').style.display = 'flex';
    document.getElementById('loginCard').style.display = 'block';
    document.getElementById('registerCard').style.display = 'none';
    document.getElementById('userInfo').style.display = 'none';
    document.getElementById('loginBtn').style.display = 'inline-block';
    document.getElementById('registerBtn').style.display = 'inline-block';
    document.getElementById('logoutBtn').style.display = 'none';
}

function closeAllModals() {
    document.getElementById('cobranzaModal').classList.remove('active');
    document.getElementById('messageModal').classList.remove('active');
}

// ========== GESTIÓN DE DATOS ==========

function loadUserData(userId) {
    database.ref('users/' + userId).once('value')
        .then((snapshot) => {
            if (snapshot.exists()) {
                userData = snapshot.val();
                userData.userId = userId;
                updateUserUI();
                loadCompanyData(userId);
                loadCobranzas(userId);
                loadMensajes(userId);
                
                if (userData.email === 'admin@ppbcobranza.com') {
                    document.querySelectorAll('.admin-only').forEach(el => {
                        el.style.display = 'block';
                    });
                }
            }
        })
        .catch(handleError);
}

function loadCompanyData(userId) {
    database.ref('empresas/' + userId).once('value')
        .then((snapshot) => {
            if (snapshot.exists()) {
                companyData = snapshot.val();
                companyData.userId = userId;
                fillCompanyForm();
            }
        })
        .catch(handleError);
}

function loadCobranzas(userId) {
    database.ref('cobranzas').orderByChild('userId').equalTo(userId).on('value', (snapshot) => {
        cobranzas = [];
        snapshot.forEach((childSnapshot) => {
            const cobranza = childSnapshot.val();
            cobranza.id = childSnapshot.key;
            cobranzas.push(cobranza);
        });
        
        cobranzas.sort((a, b) => new Date(b.fechaEmision) - new Date(a.fechaEmision));
        updateCobranzasUI();
        updateDashboardStats();
        checkFreeLimit();
    });
}

function loadMensajes(userId) {
    database.ref('mensajes').orderByChild('userId').equalTo(userId).on('value', (snapshot) => {
        mensajes = [];
        snapshot.forEach((childSnapshot) => {
            const mensaje = childSnapshot.val();
            mensaje.id = childSnapshot.key;
            mensajes.push(mensaje);
        });
        
        mensajes.sort((a, b) => new Date(b.fechaEnvio) - new Date(a.fechaEnvio));
        updateMessagesUI();
    });
}

// ========== INTERFAZ DE USUARIO ==========

function updateUserUI() {
    document.getElementById('userName').textContent = userData.nombre;
    document.getElementById('userAvatar').textContent = userData.nombre.charAt(0).toUpperCase();
    
    const existingBadge = document.getElementById('userInfo').querySelector('.plan-badge');
    if (existingBadge) {
        existingBadge.remove();
    }
    
    const planBadge = document.createElement('span');
    planBadge.className = `plan-badge plan-${userData.plan}`;
    planBadge.textContent = userData.plan === 'free' ? 'Free' : 'Pro';
    document.getElementById('userInfo').appendChild(planBadge);
}

function fillCompanyForm() {
    if (companyData) {
        document.getElementById('companyName').value = companyData.nombre || '';
        document.getElementById('companyRif').value = companyData.rif || '';
        document.getElementById('companyPhone').value = companyData.telefono || '';
        document.getElementById('companyEmail').value = companyData.email || '';
        document.getElementById('companyContacts').value = companyData.contactos || '';
    }
}

function updateCobranzasUI() {
    const filteredCobranzas = filterCobranzas();
    const tbody = document.getElementById('cobranzasTableBody');
    
    if (filteredCobranzas.length === 0) {
        showEmptyState(tbody, 'cobranzas', 'No hay cobranzas registradas', 'addFirstCobranza');
        return;
    }
    
    tbody.innerHTML = '';
    
    filteredCobranzas.forEach(cobranza => {
        const tr = document.createElement('tr');
        tr.className = 'slide-in';
        
        const estado = getCobranzaStatus(cobranza);
        
        tr.innerHTML = `
            <td>${cobranza.cliente}</td>
            <td>$${cobranza.monto}</td>
            <td>${formatDate(cobranza.fechaEmision)}</td>
            <td>${formatDate(cobranza.fechaVencimiento)}</td>
            <td><span class="status-badge ${estado.class}">${estado.text}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon send-message-btn" title="Enviar mensaje" data-id="${cobranza.id}">
                        <i class="fas fa-envelope" style="color: var(--primary);"></i>
                    </button>
                    <button class="btn-icon mark-paid-btn" title="Marcar como pagado" data-id="${cobranza.id}">
                        <i class="fas fa-check" style="color: var(--success);"></i>
                    </button>
                    <button class="btn-icon edit-cobranza-btn" title="Editar" data-id="${cobranza.id}">
                        <i class="fas fa-edit" style="color: var(--warning);"></i>
                    </button>
                    <button class="btn-icon delete-cobranza-btn" title="Eliminar" data-id="${cobranza.id}">
                        <i class="fas fa-trash" style="color: var(--danger);"></i>
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
    
    addCobranzaEventListeners();
}

function filterCobranzas() {
    switch (currentCobranzaFilter) {
        case 'pending':
            return cobranzas.filter(c => getCobranzaStatus(c).text === 'Pendiente');
        case 'paid':
            return cobranzas.filter(c => c.estado === 'pagado');
        case 'overdue':
            return cobranzas.filter(c => getCobranzaStatus(c).text === 'Vencido');
        default:
            return cobranzas;
    }
}

function getCobranzaStatus(cobranza) {
    if (cobranza.estado === 'pagado') {
        return { class: 'status-paid', text: 'Pagado' };
    }
    
    const today = new Date();
    const dueDate = new Date(cobranza.fechaVencimiento);
    
    if (dueDate < today) {
        return { class: 'status-overdue', text: 'Vencido' };
    }
    
    return { class: 'status-pending', text: 'Pendiente' };
}

function addCobranzaEventListeners() {
    document.querySelectorAll('.send-message-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const cobranzaId = this.getAttribute('data-id');
            openMessageModalForCobranza(cobranzaId);
        });
    });
    
    document.querySelectorAll('.mark-paid-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const cobranzaId = this.getAttribute('data-id');
            markAsPaid(cobranzaId);
        });
    });
    
    document.querySelectorAll('.edit-cobranza-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const cobranzaId = this.getAttribute('data-id');
            editCobranza(cobranzaId);
        });
    });
    
    document.querySelectorAll('.delete-cobranza-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const cobranzaId = this.getAttribute('data-id');
            deleteCobranza(cobranzaId);
        });
    });
}

function updateMessagesUI() {
    const currentTab = document.querySelector('#mensajes .tab.active').getAttribute('data-tab');
    const filteredMensajes = filterMensajes(currentTab);
    const tbody = document.getElementById('messagesTableBody');
    
    if (filteredMensajes.length === 0) {
        showEmptyState(tbody, 'mensajes', 'No hay mensajes', 'addFirstMessage');
        return;
    }
    
    tbody.innerHTML = '';
    
    filteredMensajes.forEach(mensaje => {
        const tr = document.createElement('tr');
        tr.className = 'slide-in';
        
        tr.innerHTML = `
            <td>${getMessageTypeText(mensaje.tipo)}</td>
            <td>${mensaje.contenido}</td>
            <td>${mensaje.cliente}</td>
            <td>${formatDateTime(mensaje.fechaEnvio)}</td>
            <td><span class="message-status status-${mensaje.estado || 'sent'}">${mensaje.estado || 'Enviado'}</span></td>
            <td>
                <div class="action-buttons">
                    ${mensaje.canal === 'whatsapp' ? 
                        `<button class="btn-icon" title="Reenviar por WhatsApp" onclick="reenviarWhatsApp('${mensaje.id}')">
                            <i class="fab fa-whatsapp" style="color: #25D366;"></i>
                        </button>` : 
                        `<button class="btn-icon" title="Reenviar por Email" onclick="reenviarEmail('${mensaje.id}')">
                            <i class="fas fa-envelope" style="color: #EA4335;"></i>
                        </button>`
                    }
                </div>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

function filterMensajes(tab) {
    switch (tab) {
        case 'automatic':
            return mensajes.filter(m => m.tipo !== 'personalizado');
        case 'custom':
            return mensajes.filter(m => m.tipo === 'personalizado');
        case 'sent':
            return mensajes;
        default:
            return mensajes;
    }
}

function getMessageTypeText(tipo) {
    const types = {
        'recordatorio_amable': 'Recordatorio Amable',
        'recordatorio_cercano': 'Recordatorio Cercano', 
        'vencido_leve': 'Vencido Leve',
        'ultima_advertencia': 'Última Advertencia',
        'personalizado': 'Personalizado'
    };
    return types[tipo] || tipo;
}

// ========== DASHBOARD Y ESTADÍSTICAS ==========

function updateDashboardStats() {
    const pending = cobranzas.filter(c => getCobranzaStatus(c).text === 'Pendiente').length;
    const paid = cobranzas.filter(c => c.estado === 'pagado').length;
    const overdue = cobranzas.filter(c => getCobranzaStatus(c).text === 'Vencido').length;
    
    const totalAmount = cobranzas
        .filter(c => c.estado !== 'pagado')
        .reduce((sum, c) => sum + parseFloat(c.monto), 0);
    
    document.getElementById('pendingCount').textContent = pending;
    document.getElementById('paidCount').textContent = paid;
    document.getElementById('overdueCount').textContent = overdue;
    document.getElementById('totalAmount').textContent = `$${totalAmount.toFixed(2)}`;
    
    updateStatusChart(pending, paid, overdue);
    updateRecentActivity();
}

function updateStatusChart(pending, paid, overdue) {
    const ctx = document.getElementById('statusChart').getContext('2d');
    
    if (statusChart) {
        statusChart.destroy();
    }
    
    statusChart = new Chart(ctx, {
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

function updateRecentActivity() {
    const activityList = document.getElementById('recentActivity');
    const recentCobranzas = cobranzas.slice(0, 5);
    
    if (recentCobranzas.length === 0) {
        activityList.innerHTML = '<li class="activity-item"><div class="activity-content"><div class="activity-title">No hay actividad reciente</div></div></li>';
        return;
    }
    
    activityList.innerHTML = '';
    
    recentCobranzas.forEach(cobranza => {
        const li = document.createElement('li');
        li.className = 'activity-item';
        
        const icon = cobranza.estado === 'pagado' ? 'fa-check' : 
                    getCobranzaStatus(cobranza).text === 'Vencido' ? 'fa-exclamation-triangle' : 'fa-plus';
        
        const color = cobranza.estado === 'pagado' ? 'var(--success)' : 
                     getCobranzaStatus(cobranza).text === 'Vencido' ? 'var(--danger)' : 'var(--primary)';
        
        li.innerHTML = `
            <div class="activity-icon">
                <i class="fas ${icon}" style="color: ${color};"></i>
            </div>
            <div class="activity-content">
                <div class="activity-title">${cobranza.cliente} - $${cobranza.monto}</div>
                <div class="activity-time">${formatDateTime(cobranza.fechaCreacion)} - ${getCobranzaStatus(cobranza).text}</div>
            </div>
        `;
        
        activityList.appendChild(li);
    });
}

// ========== GESTIÓN DE COBRANZAS ==========

function openCobranzaModal(editId = null) {
    resetCobranzaForm();
    
    if (editId) {
        document.getElementById('cobranzaModalTitle').textContent = 'Editar Cobranza';
        document.getElementById('cobranzaSubmitBtn').textContent = 'Actualizar Cobranza';
        document.getElementById('editCobranzaId').value = editId;
        
        const cobranza = cobranzas.find(c => c.id === editId);
        if (cobranza) {
            document.getElementById('clientName').value = cobranza.cliente;
            document.getElementById('clientPhone').value = cobranza.telefono || '';
            document.getElementById('clientEmail').value = cobranza.email || '';
            document.getElementById('amount').value = cobranza.monto;
            document.getElementById('issueDate').value = cobranza.fechaEmision;
            document.getElementById('dueDate').value = cobranza.fechaVencimiento;
            document.getElementById('notes').value = cobranza.notas || '';
        }
    } else {
        document.getElementById('cobranzaModalTitle').textContent = 'Nueva Cobranza';
        document.getElementById('cobranzaSubmitBtn').textContent = 'Guardar Cobranza';
        document.getElementById('editCobranzaId').value = '';
        
        document.getElementById('issueDate').valueAsDate = new Date();
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        document.getElementById('dueDate').valueAsDate = dueDate;
    }
    
    document.getElementById('cobranzaModal').classList.add('active');
}

function resetCobranzaForm() {
    document.getElementById('cobranzaForm').reset();
    document.getElementById('editCobranzaId').value = '';
}

function handleCobranzaSubmit(e) {
    e.preventDefault();
    
    if (userData.plan === 'free') {
        const activeCobranzas = cobranzas.filter(c => c.estado !== 'pagado').length;
        if (activeCobranzas >= 3 && !document.getElementById('editCobranzaId').value) {
            showAlert('Límite de 3 cobranzas activas alcanzado. Actualiza a Pro.', 'warning');
            return;
        }
    }
    
    const cobranzaData = {
        userId: currentUser.uid,
        cliente: document.getElementById('clientName').value,
        telefono: document.getElementById('clientPhone').value,
        email: document.getElementById('clientEmail').value,
        monto: parseFloat(document.getElementById('amount').value),
        fechaEmision: document.getElementById('issueDate').value,
        fechaVencimiento: document.getElementById('dueDate').value,
        estado: 'pendiente',
        notas: document.getElementById('notes').value,
        fechaCreacion: new Date().toISOString()
    };
    
    const cobranzaId = document.getElementById('editCobranzaId').value;
    
    if (cobranzaId) {
        database.ref('cobranzas/' + cobranzaId).update(cobranzaData)
            .then(() => {
                showAlert('Cobranza actualizada correctamente', 'success');
                closeAllModals();
            })
            .catch(handleError);
    } else {
        database.ref('cobranzas').push(cobranzaData)
            .then(() => {
                showAlert('Cobranza agregada correctamente', 'success');
                closeAllModals();
            })
            .catch(handleError);
    }
}

function editCobranza(cobranzaId) {
    openCobranzaModal(cobranzaId);
}

function markAsPaid(cobranzaId) {
    if (confirm('¿Marcar esta cobranza como pagada?')) {
        database.ref('cobranzas/' + cobranzaId).update({
            estado: 'pagado'
        })
        .then(() => {
            showAlert('Cobranza marcada como pagada', 'success');
        })
        .catch(handleError);
    }
}

function deleteCobranza(cobranzaId) {
    if (confirm('¿Eliminar esta cobranza?')) {
        database.ref('cobranzas/' + cobranzaId).remove()
        .then(() => {
            showAlert('Cobranza eliminada', 'success');
        })
        .catch(handleError);
    }
}

// ========== GESTIÓN DE MENSAJES ==========

function openMessageModal() {
    resetMessageForm();
    loadClientesForMessages();
    document.getElementById('messageModal').classList.add('active');
}

function openMessageModalForCobranza(cobranzaId) {
    openMessageModal();
    document.getElementById('messageClient').value = cobranzaId;
    
    const cobranza = cobranzas.find(c => c.id === cobranzaId);
    if (cobranza) {
        const messageType = getAppropriateMessageType(cobranza);
        document.getElementById('messageType').value = messageType;
        updateMessageContent();
    }
}

function getAppropriateMessageType(cobranza) {
    const today = new Date();
    const dueDate = new Date(cobranza.fechaVencimiento);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
        const daysOverdue = Math.abs(diffDays);
        return daysOverdue > 15 ? 'ultima_advertencia' : 'vencido_leve';
    } else if (diffDays === 0) {
        return 'recordatorio_cercano';
    } else {
        return 'recordatorio_amable';
    }
}

function resetMessageForm() {
    document.getElementById('messageForm').reset();
    document.getElementById('messageChannel').value = 'whatsapp';
}

function loadClientesForMessages() {
    const clientSelect = document.getElementById('messageClient');
    clientSelect.innerHTML = '<option value="">Selecciona un cliente</option>';
    
    cobranzas.forEach(cobranza => {
        if (cobranza.estado !== 'pagado') {
            const option = document.createElement('option');
            option.value = cobranza.id;
            option.textContent = `${cobranza.cliente} - $${cobranza.monto}`;
            option.setAttribute('data-phone', cobranza.telefono || '');
            option.setAttribute('data-email', cobranza.email || '');
            clientSelect.appendChild(option);
        }
    });
}

function updateMessageContent() {
    const type = document.getElementById('messageType').value;
    const clientId = document.getElementById('messageClient').value;
    
    if (!type || !clientId) return;
    
    let content = '';
    const client = cobranzas.find(c => c.id === clientId);
    
    if (!client) return;
    
    if (type !== 'personalizado') {
        const messages = {
            'recordatorio_amable': `Hola ${client.cliente}, desde ${companyData?.nombre || 'nuestra empresa'} te recordamos que tu pago de $${client.monto} vence el ${formatDate(client.fechaVencimiento)}. Contáctanos: ${companyData?.telefono || ''}.`,
            'recordatorio_cercano': `Hola ${client.cliente}, tu pago de $${client.monto} con ${companyData?.nombre || 'nosotros'} vence hoy (${formatDate(client.fechaVencimiento)}). Agradecemos tu pronta atención.`,
            'vencido_leve': `Hola ${client.cliente}, tu pago de $${client.monto} con ${companyData?.nombre || 'nosotros'} está vencido desde ${formatDate(client.fechaVencimiento)}. Por favor realiza tu pago cuanto antes.`,
            'ultima_advertencia': `Estimado ${client.cliente}, tu pago de $${client.monto} con ${companyData?.nombre || 'nosotros'} está vencido desde ${formatDate(client.fechaVencimiento)}. Esta es la última notificación antes de tomar medidas. Contáctanos: ${companyData?.telefono || ''}.`
        };
        content = messages[type] || '';
    }
    
    document.getElementById('messageContent').value = content;
}

function handleMessageSubmit(e) {
    e.preventDefault();
    
    const clientId = document.getElementById('messageClient').value;
    const client = cobranzas.find(c => c.id === clientId);
    const channel = document.getElementById('messageChannel').value;
    
    if (!client) {
        showAlert('Cliente no encontrado', 'error');
        return;
    }
    
    const messageData = {
        userId: currentUser.uid,
        tipo: document.getElementById('messageType').value,
        contenido: document.getElementById('messageContent').value,
        cliente: client.cliente,
        clienteId: clientId,
        canal: channel,
        fechaEnvio: new Date().toISOString(),
        estado: 'enviado'
    };
    
    database.ref('mensajes').push(messageData)
        .then(() => {
            showAlert('Mensaje guardado correctamente', 'success');
            
            if (channel === 'whatsapp') {
                sendWhatsAppMessage(client, messageData.contenido);
            } else {
                sendEmailMessage(client, messageData.contenido);
            }
            
            closeAllModals();
        })
        .catch(handleError);
}

function sendWhatsAppMessage(client, contenido) {
    const phone = client.telefono;
    if (!phone) {
        showAlert('El cliente no tiene número de teléfono', 'warning');
        return;
    }
    
    const cleanPhone = phone.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(contenido);
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    showAlert('Redirigiendo a WhatsApp...', 'success');
}

function sendEmailMessage(client, contenido) {
    const email = client.email;
    if (!email) {
        showAlert('El cliente no tiene email', 'warning');
        return;
    }
    
    const subject = `Recordatorio de Pago - ${companyData?.nombre || 'PPB Cobranza'}`;
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(contenido);
    const mailtoUrl = `mailto:${email}?subject=${encodedSubject}&body=${encodedBody}`;
    
    window.open(mailtoUrl, '_blank');
    showAlert('Redirigiendo a email...', 'success');
}

function reenviarWhatsApp(mensajeId) {
    const mensaje = mensajes.find(m => m.id === mensajeId);
    const client = cobranzas.find(c => c.id === mensaje.clienteId);
    
    if (mensaje && client) {
        sendWhatsAppMessage(client, mensaje.contenido);
    }
}

function reenviarEmail(mensajeId) {
    const mensaje = mensajes.find(m => m.id === mensajeId);
    const client = cobranzas.find(c => c.id === mensaje.clienteId);
    
    if (mensaje && client) {
        sendEmailMessage(client, mensaje.contenido);
    }
}

// ========== GESTIÓN DE EMPRESA ==========

function handleCompanySubmit(e) {
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
            showAlert('Datos de empresa guardados', 'success');
            loadCompanyData(currentUser.uid);
        })
        .catch(handleError);
}

// ========== PANEL ADMIN ==========

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
        .catch(handleError);
}

function updateAdminUI(users) {
    const tbody = document.getElementById('usersTableBody');
    
    if (users.length === 0) {
        showEmptyState(tbody, 'users', 'No hay usuarios');
        return;
    }
    
    tbody.innerHTML = '';
    
    document.getElementById('totalUsers').textContent = users.length;
    document.getElementById('proUsers').textContent = users.filter(u => u.plan === 'pro').length;
    document.getElementById('inactiveUsers').textContent = users.filter(u => !u.activo).length;
    
    database.ref('cobranzas').once('value')
        .then((snapshot) => {
            document.getElementById('totalCobranzasAdmin').textContent = snapshot.numChildren();
        });
    
    users.forEach(user => {
        const tr = document.createElement('tr');
        tr.className = 'slide-in';
        
        tr.innerHTML = `
            <td>${user.nombre}</td>
            <td>${user.email}</td>
            <td><span class="plan-badge plan-${user.plan}">${user.plan === 'free' ? 'Free' : 'Pro'}</span></td>
            <td>${user.activo ? 'Activo' : 'Inactivo'}</td>
            <td class="user-cobranzas-count">Cargando...</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon toggle-active" data-id="${user.id}" data-active="${user.activo}">
                        <i class="fas ${user.activo ? 'fa-user-slash' : 'fa-user-check'}" style="color: ${user.activo ? 'var(--warning)' : 'var(--success)'};"></i>
                    </button>
                    <button class="btn-icon toggle-plan" data-id="${user.id}" data-plan="${user.plan}">
                        <i class="fas ${user.plan === 'free' ? 'fa-crown' : 'fa-user'}" style="color: ${user.plan === 'free' ? 'var(--secondary)' : 'var(--gray)'};"></i>
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(tr);
        
        database.ref('cobranzas').orderByChild('userId').equalTo(user.id).once('value')
            .then((snapshot) => {
                const count = snapshot.numChildren();
                tr.querySelector('.user-cobranzas-count').textContent = count;
            });
    });
    
    addAdminEventListeners();
}

function addAdminEventListeners() {
    document.querySelectorAll('.toggle-active').forEach(button => {
        button.addEventListener('click', function() {
            const userId = this.getAttribute('data-id');
            const currentActive = this.getAttribute('data-active') === 'true';
            
            database.ref('users/' + userId).update({
                activo: !currentActive
            })
            .then(() => {
                showAlert(`Usuario ${!currentActive ? 'activado' : 'desactivado'}`, 'success');
                loadAdminData();
            })
            .catch(handleError);
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
                showAlert(`Usuario actualizado a ${newPlan}`, 'success');
                loadAdminData();
            })
            .catch(handleError);
        });
    });
}

// ========== UTILIDADES ==========

function checkFreeLimit() {
    const activeCobranzas = cobranzas.filter(c => c.estado !== 'pagado').length;
    const alert = document.getElementById('freeLimitAlert');
    
    if (userData.plan === 'free' && activeCobranzas >= 3) {
        alert.style.display = 'flex';
    } else {
        alert.style.display = 'none';
    }
}

function showEmptyState(container, type, message, buttonId = null) {
    const icons = {
        'cobranzas': 'fa-inbox',
        'mensajes': 'fa-envelope',
        'users': 'fa-users'
    };
    
    container.innerHTML = `
        <tr>
            <td colspan="6" style="text-align: center; padding: 40px 20px;">
                <div class="empty-state">
                    <i class="fas ${icons[type] || 'fa-inbox'}"></i>
                    <p>${message}</p>
                    ${buttonId ? `<button class="btn btn-primary" id="${buttonId}">
                        <i class="fas fa-plus"></i> Agregar Primera ${type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>` : ''}
                </div>
            </td>
        </tr>
    `;
    
    if (buttonId) {
        document.getElementById(buttonId).addEventListener('click', function() {
            if (type === 'cobranzas') openCobranzaModal();
            if (type === 'mensajes') openMessageModal();
        });
    }
}

function showAlert(message, type = 'info') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <i class="fas fa-${getAlertIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    alert.style.position = 'fixed';
    alert.style.top = '20px';
    alert.style.right = '20px';
    alert.style.zIndex = '10000';
    alert.style.minWidth = '300px';
    alert.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

function getAlertIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function handleError(error) {
    console.error('Error:', error);
    showAlert('Error: ' + error.message, 'error');
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

function formatDateTime(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

// ========== EVENT LISTENERS FINALES ==========

document.getElementById('refreshUsersBtn').addEventListener('click', loadAdminData);

document.getElementById('upgradePlanLink').addEventListener('click', function(e) {
    e.preventDefault();
    showAlert('Contacta al admin: admin@ppbcobranza.com', 'info');
});

document.getElementById('exportExcelBtn').addEventListener('click', function() {
    const data = cobranzas.map(cobranza => ({
        'Cliente': cobranza.cliente,
        'Teléfono': cobranza.telefono || '',
        'Email': cobranza.email || '',
        'Monto': cobranza.monto,
        'Estado': getCobranzaStatus(cobranza).text,
        'Fecha Emisión': formatDate(cobranza.fechaEmision),
        'Fecha Vencimiento': formatDate(cobranza.fechaVencimiento),
        'Notas': cobranza.notas || ''
    }));
    
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Cobranzas');
    XLSX.writeFile(wb, `cobranzas_${formatDate(new Date())}.xlsx`);
});

// Prevenir recarga de formularios
document.addEventListener('submit', function(e) {
    e.preventDefault();
});

console.log('PPB Cobranza - App cargada correctamente');
