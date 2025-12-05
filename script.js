// ============================================
// CONFIGURACIÓN GLOBAL Y VARIABLES
// ============================================
let preguntas = [];
let respuestasUsuario = {};
let preguntaActual = 0;
let tiempoRestante = 60 * 60; // 60 minutos en segundos
let temporizador;
let examenEnCurso = false;
let preguntasMarcadas = new Set();
let modoExamen = 'completo';
let tiempoLimite = 60;

// Elementos del DOM
const elementos = {
    // Pantallas
    pantallaInicio: document.getElementById('pantalla-inicio'),
    pantallaExamen: document.getElementById('pantalla-examen'),
    pantallaResultados: document.getElementById('pantalla-resultados'),
    
    // Controles de inicio
    btnIniciarExamen: document.getElementById('iniciar-examen'),
    btnVerEstadisticas: document.getElementById('ver-estadisticas'),
    btnInstrucciones: document.getElementById('instrucciones-detalladas'),
    modoExamenSelect: document.getElementById('modo-examen'),
    tiempoLimiteSelect: document.getElementById('tiempo-limite'),
    dificultadSelect: document.getElementById('dificultad'),
    
    // Estadísticas en inicio
    mejorPuntuacion: document.getElementById('mejor-puntuacion'),
    totalRealizados: document.getElementById('total-realizados'),
    promedioCorrectas: document.getElementById('promedio-correctas'),
    tiempoPromedio: document.getElementById('tiempo-promedio'),
    
    // Elementos del examen
    tiempoRestanteElement: document.getElementById('tiempo-restante'),
    preguntaActualElement: document.getElementById('pregunta-actual'),
    totalPreguntasExamen: document.getElementById('total-preguntas-examen'),
    preguntasRespondidas: document.getElementById('preguntas-respondidas'),
    preguntasMarcadasElement: document.getElementById('preguntas-marcadas'),
    porcentajeProgreso: document.getElementById('porcentaje-progreso'),
    progresoBar: document.getElementById('progreso-bar'),
    
    // Pregunta actual
    numeroPregunta: document.getElementById('numero-pregunta'),
    textoPregunta: document.getElementById('texto-pregunta'),
    dificultadPregunta: document.getElementById('dificultad-pregunta'),
    temaPregunta: document.getElementById('tema-pregunta'),
    opcionesContainer: document.getElementById('opciones-container'),
    preguntaImagen: document.getElementById('pregunta-imagen'),
    
    // Botones de navegación
    btnAnterior: document.getElementById('btn-anterior'),
    btnSiguiente: document.getElementById('btn-siguiente'),
    btnMarcar: document.getElementById('btn-marcar'),
    btnLimpiar: document.getElementById('btn-limpiar'),
    btnFinalizarTemprano: document.getElementById('btn-finalizar-temprano'),
    btnSaltar: document.getElementById('btn-saltar'),
    
    // Grid de navegación
    gridPreguntas: document.getElementById('grid-preguntas'),
    
    // Elementos de resultados
    puntuacionFinal: document.getElementById('puntuacion-final'),
    calificacionTexto: document.getElementById('calificacion-texto'),
    resultadoDescripcion: document.getElementById('resultado-descripcion'),
    fechaExamen: document.getElementById('fecha-examen'),
    duracionExamen: document.getElementById('duracion-examen'),
    
    // Estadísticas de resultados
    respuestasCorrectas: document.getElementById('respuestas-correctas'),
    respuestasIncorrectas: document.getElementById('respuestas-incorrectas'),
    porcentajeCorrectas: document.getElementById('porcentaje-correctas'),
    porcentajeIncorrectas: document.getElementById('porcentaje-incorrectas'),
    progresoCorrectas: document.getElementById('progreso-correctas'),
    progresoIncorrectas: document.getElementById('progreso-incorrectas'),
    tiempoUsado: document.getElementById('tiempo-usado'),
    tiempoPorPregunta: document.getElementById('tiempo-por-pregunta'),
    tiempoRestanteExamen: document.getElementById('tiempo-restante-examen'),
    velocidadExamen: document.getElementById('velocidad-examen'),
    nivelVelocidad: document.getElementById('nivel-velocidad'),
    circuloPuntuacion: document.getElementById('circulo-puntuacion'),
    
    // Lista de revisión
    listaRevision: document.getElementById('lista-revision'),
    
    // Botones de resultados
    btnReiniciar: document.getElementById('btn-reiniciar'),
    btnVerExplicaciones: document.getElementById('btn-ver-explicaciones'),
    btnInicio: document.getElementById('btn-inicio'),
    btnCompartir: document.getElementById('btn-compartir'),
    
    // Modal
    modalInstrucciones: document.getElementById('modal-instrucciones'),
    btnCerrarModal: document.querySelector('.modal-cerrar')
};

// ============================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Simulador EXANI-I cargando...');
    
    try {
        // Cargar preguntas desde el archivo JSON
        await cargarPreguntas();
        
        // Configurar event listeners
        configurarEventListeners();
        
        // Cargar estadísticas previas
        cargarEstadisticas();
        
        // Mostrar mensaje de éxito
        console.log('✅ Aplicación cargada correctamente');
        
    } catch (error) {
        console.error('❌ Error al cargar la aplicación:', error);
        mostrarError('Error al cargar el simulador. Recarga la página.');
    }
});

// ============================================
// FUNCIONES PRINCIPALES DE CARGA
// ============================================
async function cargarPreguntas() {
    try {
        const response = await fetch('data/preguntas.json');
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        preguntas = data.preguntas;
        
        // Inicializar respuestas del usuario
        preguntas.forEach((_, index) => {
            respuestasUsuario[index] = null;
        });
        
        console.log(`✅ ${preguntas.length} preguntas cargadas`);
        
    } catch (error) {
        console.error('Error cargando preguntas:', error);
        // Cargar preguntas de respaldo
        preguntas = generarPreguntasRespaldo();
        console.log(`✅ ${preguntas.length} preguntas de respaldo cargadas`);
    }
}

function generarPreguntasRespaldo() {
    const temas = ['Álgebra', 'Geometría', 'Aritmética', 'Probabilidad', 'Estadística'];
    const dificultades = ['baja', 'media', 'alta'];
    
    const preguntasRespaldo = [];
    
    for (let i = 1; i <= 50; i++) {
        const tema = temas[Math.floor(Math.random() * temas.length)];
        const dificultad = dificultades[Math.floor(Math.random() * dificultades.length)];
        
        preguntasRespaldo.push({
            id: i,
            tipo: "opcion_multiple",
            pregunta: `Pregunta de ejemplo ${i} sobre ${tema}: Si ${i} × ${i} = x, ¿cuál es el valor de x?`,
            opciones: [
                `a) ${i * i}`,
                `b) ${i * (i + 1)}`,
                `c) ${i * (i - 1)}`,
                `d) ${i * 2}`
            ],
            respuesta_correcta: 0,
            explicacion: `La respuesta correcta es ${i * i}. En matemáticas, ${i} × ${i} = ${i * i}.`,
            dificultad: dificultad,
            tema: tema
        });
    }
    
    return preguntasRespaldo;
}

function configurarEventListeners() {
    // Botones de inicio
    elementos.btnIniciarExamen.addEventListener('click', iniciarExamen);
    elementos.btnVerEstadisticas.addEventListener('click', mostrarEstadisticas);
    elementos.btnInstrucciones.addEventListener('click', mostrarInstrucciones);
    
    // Botones de navegación en examen
    elementos.btnAnterior.addEventListener('click', anteriorPregunta);
    elementos.btnSiguiente.addEventListener('click', siguientePregunta);
    elementos.btnMarcar.addEventListener('click', marcarPregunta);
    elementos.btnLimpiar.addEventListener('click', limpiarRespuesta);
    elementos.btnFinalizarTemprano.addEventListener('click', finalizarExamen);
    elementos.btnSaltar.addEventListener('click', saltarPregunta);
    
    // Botones de resultados
    elementos.btnReiniciar.addEventListener('click', reiniciarExamen);
    elementos.btnVerExplicaciones.addEventListener('click', verExplicacionesCompletas);
    elementos.btnInicio.addEventListener('click', volverInicio);
    elementos.btnCompartir.addEventListener('click', compartirResultados);
    
    // Modal
    elementos.btnCerrarModal.addEventListener('click', cerrarModal);
    elementos.modalInstrucciones.addEventListener('click', function(e) {
        if (e.target === this) cerrarModal();
    });
    
    // Filtros de preguntas
    document.querySelectorAll('.filtro-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            filtrarPreguntas(this.dataset.filtro);
        });
    });
    
    // Filtros de revisión
    document.querySelectorAll('.filtro-revision').forEach(btn => {
        btn.addEventListener('click', function() {
            filtrarRevision(this.dataset.filtro);
        });
    });
}

// ============================================
// FUNCIONES DE LA PANTALLA DE INICIO
// ============================================
function iniciarExamen() {
    // Obtener configuración
    modoExamen = elementos.modoExamenSelect.value;
    tiempoLimite = parseInt(elementos.tiempoLimiteSelect.value);
    const dificultad = elementos.dificultadSelect.value;
    
    // Filtrar preguntas según dificultad
    let preguntasFiltradas = [...preguntas];
    if (dificultad !== 'todas') {
        preguntasFiltradas = preguntasFiltradas.filter(p => p.dificultad === dificultad);
    }
    
    // Configurar según modo
    switch(modoExamen) {
        case 'practica':
            preguntasFiltradas = mezclarArray(preguntasFiltradas).slice(0, 10);
            tiempoLimite = tiempoLimite || 15;
            break;
        case 'aleatorio':
            preguntasFiltradas = mezclarArray(preguntasFiltradas).slice(0, 20);
            tiempoLimite = tiempoLimite || 30;
            break;
        default: // 'completo'
            preguntasFiltradas = preguntasFiltradas.slice(0, 50);
            tiempoLimite = tiempoLimite || 60;
    }
    
    // Si no hay preguntas, mostrar error
    if (preguntasFiltradas.length === 0) {
        mostrarError('No hay preguntas disponibles con los filtros seleccionados.');
        return;
    }
    
    // Actualizar preguntas globales
    preguntas = preguntasFiltradas;
    
    // Reiniciar variables
    reiniciarVariablesExamen();
    
    // Configurar tiempo
    tiempoRestante = tiempoLimite * 60;
    
    // Cambiar a pantalla de examen
    cambiarPantalla('examen');
    
    // Iniciar temporizador si hay tiempo límite
    if (tiempoLimite > 0) {
        iniciarTemporizador();
    }
    
    // Mostrar primera pregunta
    mostrarPregunta(0);
    actualizarNavegacion();
    
    console.log(`✅ Examen iniciado: ${preguntas.length} preguntas, ${tiempoLimite} minutos`);
}

function reiniciarVariablesExamen() {
    preguntaActual = 0;
    examenEnCurso = true;
    preguntasMarcadas.clear();
    respuestasUsuario = {};
    
    preguntas.forEach((_, index) => {
        respuestasUsuario[index] = null;
    });
}

function cargarEstadisticas() {
    const estadisticas = JSON.parse(localStorage.getItem('estadisticas_exani') || '[]');
    
    if (estadisticas.length > 0) {
        // Mejor puntuación
        const mejor = Math.max(...estadisticas.map(e => e.puntuacion));
        elementos.mejorPuntuacion.textContent = `${mejor}%`;
        
        // Total realizados
        elementos.totalRealizados.textContent = estadisticas.length;
        
        // Promedio de aciertos
        const promedio = Math.round(estadisticas.reduce((sum, e) => sum + e.puntuacion, 0) / estadisticas.length);
        elementos.promedioCorrectas.textContent = `${promedio}%`;
        
        // Tiempo promedio
        const tiempoPromedio = estadisticas.length > 0 ? 
            Math.round(estadisticas.reduce((sum, e) => sum + e.tiempoUsado, 0) / estadisticas.length) : 0;
        elementos.tiempoPromedio.textContent = `${Math.floor(tiempoPromedio / 60)}:${(tiempoPromedio % 60).toString().padStart(2, '0')}`;
    }
}

function mostrarEstadisticas() {
    alert('Esta funcionalidad estará disponible en la próxima versión.');
}

function mostrarInstrucciones() {
    elementos.modalInstrucciones.classList.add('activo');
    elementos.modalInstrucciones.querySelector('.modal-body').innerHTML = `
        <h4>Guía completa del simulador</h4>
        <p>Este simulador te ayudará a prepararte para el examen EXANI-I de Pensamiento Matemático.</p>
        
        <h5>📝 Modos de examen:</h5>
        <ul>
            <li><strong>Examen Completo:</strong> 50 preguntas en 60 minutos</li>
            <li><strong>Práctica Rápida:</strong> 10 preguntas en 15 minutos</li>
            <li><strong>Preguntas Aleatorias:</strong> 20 preguntas en 30 minutos</li>
        </ul>
        
        <h5>🎯 Consejos para el examen:</h5>
        <ol>
            <li>Administra bien tu tiempo</li>
            <li>Lee cuidadosamente cada pregunta</li>
            <li>Marca preguntas para revisión si tienes dudas</li>
            <li>Revisa todas las opciones antes de responder</li>
            <li>No dejes preguntas sin responder</li>
        </ol>
        
        <h5>📊 Resultados:</h5>
        <p>Al finalizar recibirás un análisis detallado de tu desempeño por tema y dificultad.</p>
        
        <p class="texto-centro mt-20"><strong>¡Mucho éxito en tu preparación!</strong></p>
    `;
}

function cerrarModal() {
    elementos.modalInstrucciones.classList.remove('activo');
}

// ============================================
// FUNCIONES DEL EXAMEN
// ============================================
function mostrarPregunta(indice) {
    if (indice < 0 || indice >= preguntas.length) return;
    
    preguntaActual = indice;
    const pregunta = preguntas[indice];
    
    // Actualizar número de pregunta
    elementos.numeroPregunta.textContent = indice + 1;
    elementos.preguntaActualElement.textContent = indice + 1;
    
    // Actualizar texto de pregunta
    elementos.textoPregunta.textContent = pregunta.pregunta;
    
    // Actualizar dificultad y tema
    elementos.dificultadPregunta.textContent = pregunta.dificultad.charAt(0).toUpperCase() + pregunta.dificultad.slice(1);
    elementos.dificultadPregunta.dataset.dificultad = pregunta.dificultad;
    elementos.temaPregunta.textContent = pregunta.tema;
    
    // Limpiar opciones anteriores
    elementos.opcionesContainer.innerHTML = '';
    
    // Crear nuevas opciones
    pregunta.opciones.forEach((opcion, i) => {
        const divOpcion = document.createElement('div');
        divOpcion.className = 'opcion';
        if (respuestasUsuario[indice] === i) {
            divOpcion.classList.add('seleccionada');
        }
        
        divOpcion.innerHTML = `
            <div class="opcion-indicador"></div>
            <div class="opcion-texto">${opcion}</div>
        `;
        
        divOpcion.addEventListener('click', () => seleccionarOpcion(i));
        elementos.opcionesContainer.appendChild(divOpcion);
    });
    
    // Actualizar imagen si existe
    elementos.preguntaImagen.innerHTML = '';
    if (pregunta.imagen) {
        const img = document.createElement('img');
        img.src = pregunta.imagen;
        img.alt = 'Imagen de la pregunta';
        elementos.preguntaImagen.appendChild(img);
    }
    
    // Actualizar estado del botón de marcar
    const btnMarcarIcon = elementos.btnMarcar.querySelector('i');
    if (preguntasMarcadas.has(indice)) {
        elementos.btnMarcar.innerHTML = '<i class="fas fa-flag"></i> Desmarcar';
        btnMarcarIcon.className = 'fas fa-flag';
    } else {
        elementos.btnMarcar.innerHTML = '<i class="far fa-flag"></i> Marcar para revisar';
        btnMarcarIcon.className = 'far fa-flag';
    }
    
    // Actualizar botones de navegación
    elementos.btnAnterior.disabled = indice === 0;
    elementos.btnSiguiente.disabled = indice === preguntas.length - 1;
    
    // Actualizar progreso
    actualizarProgreso();
}

function seleccionarOpcion(indiceOpcion) {
    respuestasUsuario[preguntaActual] = indiceOpcion;
    
    // Actualizar visualmente
    const opciones = elementos.opcionesContainer.querySelectorAll('.opcion');
    opciones.forEach((opcion, i) => {
        opcion.classList.toggle('seleccionada', i === indiceOpcion);
    });
    
    // Actualizar contadores
    actualizarContadores();
    actualizarNavegacion();
}

function marcarPregunta() {
    if (preguntasMarcadas.has(preguntaActual)) {
        preguntasMarcadas.delete(preguntaActual);
        elementos.btnMarcar.innerHTML = '<i class="far fa-flag"></i> Marcar para revisar';
    } else {
        preguntasMarcadas.add(preguntaActual);
        elementos.btnMarcar.innerHTML = '<i class="fas fa-flag"></i> Desmarcar';
    }
    
    actualizarContadores();
    actualizarNavegacion();
}

function limpiarRespuesta() {
    respuestasUsuario[preguntaActual] = null;
    
    // Limpiar selección visual
    const opciones = elementos.opcionesContainer.querySelectorAll('.opcion');
    opciones.forEach(opcion => {
        opcion.classList.remove('seleccionada');
    });
    
    actualizarContadores();
    actualizarNavegacion();
}

function saltarPregunta() {
    if (preguntaActual < preguntas.length - 1) {
        mostrarPregunta(preguntaActual + 1);
        actualizarNavegacion();
    }
}

function anteriorPregunta() {
    if (preguntaActual > 0) {
        mostrarPregunta(preguntaActual - 1);
        actualizarNavegacion();
    }
}

function siguientePregunta() {
    if (preguntaActual < preguntas.length - 1) {
        mostrarPregunta(preguntaActual + 1);
        actualizarNavegacion();
    }
}

function actualizarNavegacion() {
    // Limpiar grid
    elementos.gridPreguntas.innerHTML = '';
    
    // Crear botones para cada pregunta
    preguntas.forEach((_, index) => {
        const btn = document.createElement('button');
        btn.className = 'numero-pregunta';
        btn.textContent = index + 1;
        
        if (index === preguntaActual) {
            btn.classList.add('actual');
        }
        
        if (respuestasUsuario[index] !== null) {
            btn.classList.add('respondida');
        }
        
        if (preguntasMarcadas.has(index)) {
            btn.classList.add('marcada');
        }
        
        btn.addEventListener('click', () => {
            mostrarPregunta(index);
            actualizarNavegacion();
        });
        
        elementos.gridPreguntas.appendChild(btn);
    });
}

function actualizarContadores() {
    const totalRespondidas = Object.values(respuestasUsuario).filter(r => r !== null).length;
    elementos.preguntasRespondidas.textContent = totalRespondidas;
    elementos.preguntasMarcadasElement.textContent = preguntasMarcadas.size;
}

function actualizarProgreso() {
    const porcentaje = ((preguntaActual + 1) / preguntas.length) * 100;
    elementos.porcentajeProgreso.textContent = `${Math.round(porcentaje)}%`;
    elementos.progresoBar.style.width = `${porcentaje}%`;
    elementos.totalPreguntasExamen.textContent = preguntas.length;
}

// ============================================
// TEMPORIZADOR
// ============================================
function iniciarTemporizador() {
    clearInterval(temporizador);
    
    temporizador = setInterval(() => {
        tiempoRestante--;
        actualizarTemporizador();
        
        if (tiempoRestante <= 0) {
            clearInterval(temporizador);
            finalizarExamen();
        }
    }, 1000);
}

function actualizarTemporizador() {
    const minutos = Math.floor(tiempoRestante / 60);
    const segundos = tiempoRestante % 60;
    const tiempoFormateado = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
    
    elementos.tiempoRestanteElement.textContent = tiempoFormateado;
    
    // Cambiar color si queda poco tiempo
    if (tiempoRestante < 300) { // 5 minutos
        elementos.tiempoRestanteElement.style.color = '#ef4444';
        elementos.tiempoRestanteElement.style.fontWeight = 'bold';
    }
}

// ============================================
// FINALIZACIÓN DEL EXAMEN
// ============================================
function finalizarExamen() {
    if (!examenEnCurso) return;
    
    if (tiempoRestante > 0) {
        const confirmar = confirm('¿Estás seguro de que quieres finalizar el examen antes de tiempo?');
        if (!confirmar) return;
    }
    
    examenEnCurso = false;
    clearInterval(temporizador);
    
    // Calcular resultados
    const resultados = calcularResultados();
    
    // Mostrar pantalla de resultados
    mostrarResultados(resultados);
    
    // Guardar estadísticas
    guardarEstadisticas(resultados);
    
    console.log('✅ Examen finalizado');
}

function calcularResultados() {
    let correctas = 0;
    const totalPreguntas = preguntas.length;
    const detalleRespuestas = [];
    
    preguntas.forEach((pregunta, index) => {
        const respuestaUsuario = respuestasUsuario[index];
        const esCorrecta = respuestaUsuario === pregunta.respuesta_correcta;
        
        if (esCorrecta) {
            correctas++;
        }
        
        detalleRespuestas.push({
            pregunta: pregunta.pregunta,
            respuestaUsuario: respuestaUsuario !== null ? 
                pregunta.opciones[respuestaUsuario] : 'Sin responder',
            respuestaCorrecta: pregunta.opciones[pregunta.respuesta_correcta],
            esCorrecta: esCorrecta,
            sinResponder: respuestaUsuario === null,
            explicacion: pregunta.explicacion,
            tema: pregunta.tema,
            dificultad: pregunta.dificultad
        });
    });
    
    const porcentaje = Math.round((correctas / totalPreguntas) * 100);
    const tiempoUsado = (tiempoLimite * 60) - tiempoRestante;
    const tiempoPorPregunta = tiempoUsado / totalPreguntas;
    const velocidad = totalPreguntas / (tiempoUsado / 60); // preguntas por minuto
    
    return {
        correctas: correctas,
        incorrectas: totalPreguntas - correctas,
        total: totalPreguntas,
        porcentaje: porcentaje,
        tiempoUsado: tiempoUsado,
        tiempoPorPregunta: tiempoPorPregunta,
        velocidad: velocidad,
        detalle: detalleRespuestas
    };
}

// ============================================
// PANTALLA DE RESULTADOS
// ============================================
function mostrarResultados(resultados) {
    cambiarPantalla('resultados');
    
    // Actualizar puntuación principal
    elementos.puntuacionFinal.textContent = `${resultados.porcentaje}%`;
    elementos.calificacionTexto.textContent = obtenerCalificacionTexto(resultados.porcentaje);
    elementos.resultadoDescripcion.textContent = obtenerDescripcionResultado(resultados);
    
    // Actualizar fecha y duración
    elementos.fechaExamen.textContent = new Date().toLocaleDateString('es-ES');
    elementos.duracionExamen.textContent = formatearTiempo(resultados.tiempoUsado);
    
    // Actualizar estadísticas principales
    elementos.respuestasCorrectas.textContent = resultados.correctas;
    elementos.respuestasIncorrectas.textContent = resultados.incorrectas;
    elementos.porcentajeCorrectas.textContent = `${Math.round((resultados.correctas / resultados.total) * 100)}%`;
    elementos.porcentajeIncorrectas.textContent = `${Math.round((resultados.incorrectas / resultados.total) * 100)}%`;
    
    // Actualizar barras de progreso
    elementos.progresoCorrectas.style.width = `${(resultados.correctas / resultados.total) * 100}%`;
    elementos.progresoIncorrectas.style.width = `${(resultados.incorrectas / resultados.total) * 100}%`;
    
    // Actualizar información de tiempo
    elementos.tiempoUsado.textContent = formatearTiempo(resultados.tiempoUsado);
    elementos.tiempoPorPregunta.textContent = `${Math.round(resultados.tiempoPorPregunta)}s`;
    elementos.tiempoRestanteExamen.textContent = formatearTiempo(Math.max(0, tiempoRestante));
    
    // Actualizar velocidad
    elementos.velocidadExamen.textContent = resultados.velocidad.toFixed(1);
    elementos.nivelVelocidad.textContent = obtenerNivelVelocidad(resultados.velocidad);
    
    // Actualizar círculo de puntuación
    actualizarCirculoPuntuacion(resultados.porcentaje);
    
    // Mostrar lista de revisión
    mostrarListaRevision(resultados.detalle);
    
    // Mostrar análisis por temas
    mostrarAnalisisTemas(resultados.detalle);
    
    // Mostrar recomendaciones
    mostrarRecomendaciones(resultados);
}

function obtenerCalificacionTexto(porcentaje) {
    if (porcentaje >= 90) return '¡Excelente! Dominas el Pensamiento Matemático.';
    if (porcentaje >= 80) return 'Muy buen trabajo, estás bien preparado.';
    if (porcentaje >= 70) return 'Buen desempeño, pero hay áreas para mejorar.';
    if (porcentaje >= 60) return 'Aprobado, necesitas repasar algunos temas.';
    if (porcentaje >= 50) return 'Necesitas estudiar más los conceptos básicos.';
    return 'Debes repasar los fundamentos matemáticos.';
}

function obtenerDescripcionResultado(resultados) {
    return `Completaste ${resultados.total} preguntas en ${formatearTiempo(resultados.tiempoUsado)}. 
            Tu velocidad fue de ${resultados.velocidad.toFixed(1)} preguntas por minuto.`;
}

function obtenerNivelVelocidad(velocidad) {
    if (velocidad >= 1.5) return 'Muy rápido';
    if (velocidad >= 1.0) return 'Adecuado';
    if (velocidad >= 0.5) return 'Normal';
    return 'Lento';
}

function actualizarCirculoPuntuacion(porcentaje) {
    const radio = 54;
    const circunferencia = 2 * Math.PI * radio;
    const offset = circunferencia - (porcentaje / 100) * circunferencia;
    
    elementos.circuloPuntuacion.style.strokeDasharray = `${circunferencia} ${circunferencia}`;
    elementos.circuloPuntuacion.style.strokeDashoffset = offset;
    elementos.circuloPuntuacion.style.transition = 'stroke-dashoffset 1s ease';
}

function mostrarListaRevision(detalle) {
    elementos.listaRevision.innerHTML = '';
    
    detalle.forEach((item, index) => {
        const divPregunta = document.createElement('div');
        divPregunta.className = `pregunta-revision ${item.sinResponder ? 'sin-respuesta' : item.esCorrecta ? 'correcta' : 'incorrecta'}`;
        
        const icono = item.sinResponder ? 'fa-question-circle' : 
                     item.esCorrecta ? 'fa-check-circle' : 'fa-times-circle';
        
        divPregunta.innerHTML = `
            <h4><i class="fas ${icono}"></i> Pregunta ${index + 1}</h4>
            <p><strong>Pregunta:</strong> ${item.pregunta}</p>
            <p class="respuesta-usuario"><strong>Tu respuesta:</strong> ${item.respuestaUsuario}</p>
            <p><strong>Respuesta correcta:</strong> ${item.respuestaCorrecta}</p>
            <p><strong>Explicación:</strong> ${item.explicacion}</p>
            <p><strong>Tema:</strong> ${item.tema} | <strong>Dificultad:</strong> ${item.dificultad}</p>
        `;
        
        elementos.listaRevision.appendChild(divPregunta);
    });
}

function mostrarAnalisisTemas(detalle) {
    // Agrupar por tema
    const temas = {};
    detalle.forEach(item => {
        if (!temas[item.tema]) {
            temas[item.tema] = { total: 0, correctas: 0 };
        }
        temas[item.tema].total++;
        if (item.esCorrecta) temas[item.tema].correctas++;
    });
    
    // Crear gráfica
    const graficaTemas = document.getElementById('grafica-temas');
    const temasLista = document.getElementById('temas-lista');
    
    graficaTemas.innerHTML = '';
    temasLista.innerHTML = '';
    
    const colores = ['#667eea', '#764ba2', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];
    let colorIndex = 0;
    
    Object.entries(temas).forEach(([tema, datos]) => {
        const porcentaje = Math.round((datos.correctas / datos.total) * 100);
        const altura = porcentaje * 1.5;
        
        // Barra de gráfica
        const barra = document.createElement('div');
        barra.className = 'tema-barra';
        barra.style.height = `${altura}px`;
        barra.style.backgroundColor = colores[colorIndex % colores.length];
        barra.innerHTML = `<span class="tema-porcentaje">${porcentaje}%</span>`;
        graficaTemas.appendChild(barra);
        
        // Item en lista
        const item = document.createElement('div');
        item.className = 'tema-item';
        item.innerHTML = `
            <div class="tema-nombre">
                <span class="tema-color" style="background-color: ${colores[colorIndex % colores.length]}"></span>
                ${tema}
            </div>
            <div class="tema-porcentaje">${porcentaje}%</div>
        `;
        temasLista.appendChild(item);
        
        colorIndex++;
    });
}

function mostrarRecomendaciones(resultados) {
    const recomendacionesGrid = document.getElementById('recomendaciones-grid');
    
    const recomendaciones = [
        {
            icono: 'fa-clock',
            titulo: 'Administra tu tiempo',
            descripcion: `Usaste ${formatearTiempo(resultados.tiempoUsado)} de ${tiempoLimite} minutos disponibles.`
        },
        {
            icono: 'fa-check-double',
            titulo: 'Enfoque en temas débiles',
            descripcion: 'Revisa las preguntas incorrectas para identificar áreas de mejora.'
        },
        {
            icono: 'fa-book',
            titulo: 'Practica regularmente',
            descripcion: 'Realiza exámenes de práctica cada semana para mejorar tu velocidad.'
        },
        {
            icono: 'fa-chart-line',
            titulo: 'Analiza tu progreso',
            descripcion: 'Compara estos resultados con intentos anteriores para medir tu mejora.'
        }
    ];
    
    recomendacionesGrid.innerHTML = '';
    
    recomendaciones.forEach(rec => {
        const div = document.createElement('div');
        div.className = 'recomendacion-item';
        div.innerHTML = `
            <i class="fas ${rec.icono}"></i>
            <h4>${rec.titulo}</h4>
            <p>${rec.descripcion}</p>
        `;
        recomendacionesGrid.appendChild(div);
    });
}

function filtrarRevision(filtro) {
    const preguntas = elementos.listaRevision.querySelectorAll('.pregunta-revision');
    
    preguntas.forEach(pregunta => {
        switch(filtro) {
            case 'correctas':
                pregunta.style.display = pregunta.classList.contains('correcta') ? 'block' : 'none';
                break;
            case 'incorrectas':
                pregunta.style.display = pregunta.classList.contains('incorrecta') ? 'block' : 'none';
                break;
            case 'sin-responder':
                pregunta.style.display = pregunta.classList.contains('sin-respuesta') ? 'block' : 'none';
                break;
            default: // 'todas'
                pregunta.style.display = 'block';
        }
    });
    
    // Actualizar botones activos
    document.querySelectorAll('.filtro-revision').forEach(btn => {
        btn.classList.toggle('activo', btn.dataset.filtro === filtro);
    });
}

function filtrarPreguntas(filtro) {
    const numeros = elementos.gridPreguntas.querySelectorAll('.numero-pregunta');
    
    numeros.forEach((numero, index) => {
        let mostrar = true;
        
        switch(filtro) {
            case 'respondidas':
                mostrar = respuestasUsuario[index] !== null;
                break;
            case 'no-respondidas':
                mostrar = respuestasUsuario[index] === null;
                break;
            case 'marcadas':
                mostrar = preguntasMarcadas.has(index);
                break;
        }
        
        numero.style.display = mostrar ? 'flex' : 'none';
    });
    
    // Actualizar botones activos
    document.querySelectorAll('.filtro-btn').forEach(btn => {
        btn.classList.toggle('activo', btn.dataset.filtro === filtro);
    });
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================
function cambiarPantalla(pantalla) {
    // Ocultar todas las pantallas
    [elementos.pantallaInicio, elementos.pantallaExamen, elementos.pantallaResultados]
        .forEach(p => p.classList.remove('activa'));
    
    // Mostrar pantalla solicitada
    switch(pantalla) {
        case 'inicio':
            elementos.pantallaInicio.classList.add('activa');
            break;
        case 'examen':
            elementos.pantallaExamen.classList.add('activa');
            break;
        case 'resultados':
            elementos.pantallaResultados.classList.add('activa');
            break;
    }
}

function formatearTiempo(segundos) {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos}:${segs.toString().padStart(2, '0')}`;
}

function guardarEstadisticas(resultados) {
    const estadisticasPrevias = JSON.parse(localStorage.getItem('estadisticas_exani') || '[]');
    
    const nuevaEstadistica = {
        fecha: new Date().toISOString(),
        puntuacion: resultados.porcentaje,
        correctas: resultados.correctas,
        total: resultados.total,
        tiempoUsado: resultados.tiempoUsado,
        modo: modoExamen
    };
    
    estadisticasPrevias.push(nuevaEstadistica);
    localStorage.setItem('estadisticas_exani', JSON.stringify(estadisticasPrevias));
    
    // Actualizar estadísticas en pantalla de inicio
    cargarEstadisticas();
}

function reiniciarExamen() {
    cambiarPantalla('inicio');
}

function verExplicacionesCompletas() {
    alert('Las explicaciones completas estarán disponibles en la próxima versión.');
}

function volverInicio() {
    cambiarPantalla('inicio');
}

function compartirResultados() {
    const resultados = calcularResultados();
    const texto = `¡Obtuve ${resultados.porcentaje}% en el simulador EXANI-I de Pensamiento Matemático! 
                   ${resultados.correctas}/${resultados.total} respuestas correctas.`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Mis resultados EXANI-I',
            text: texto,
            url: window.location.href
        });
    } else {
        navigator.clipboard.writeText(texto)
            .then(() => alert('Resultados copiados al portapapeles.'))
            .catch(() => prompt('Copia este texto:', texto));
    }
}

function mezclarArray(array) {
    const nuevoArray = [...array];
    for (let i = nuevoArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [nuevoArray[i], nuevoArray[j]] = [nuevoArray[j], nuevoArray[i]];
    }
    return nuevoArray;
}

function mostrarError(mensaje) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-mensaje';
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 10000;
        max-width: 300px;
    `;
    errorDiv.innerHTML = `<strong>Error:</strong> ${mensaje}`;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// ============================================
// MANEJO DE TECLAS
// ============================================
document.addEventListener('keydown', function(e) {
    if (!examenEnCurso) return;
    
    switch(e.key) {
        case 'ArrowLeft':
            e.preventDefault();
            anteriorPregunta();
            break;
        case 'ArrowRight':
            e.preventDefault();
            siguientePregunta();
            break;
        case '1':
        case '2':
        case '3':
        case '4':
            if (e.key >= '1' && e.key <= '4') {
                const opcionIndex = parseInt(e.key) - 1;
                if (opcionIndex < preguntas[preguntaActual].opciones.length) {
                    seleccionarOpcion(opcionIndex);
                }
            }
            break;
        case 'm':
        case 'M':
            e.preventDefault();
            marcarPregunta();
            break;
        case 'c':
        case 'C':
            e.preventDefault();
            limpiarRespuesta();
            break;
        case 'Escape':
            if (elementos.modalInstrucciones.classList.contains('activo')) {
                cerrarModal();
            }
            break;
    }
});

// ============================================
// SERVICEWORKER PARA APLICACIÓN OFFLINE
// ============================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registrado:', registration);
            })
            .catch(error => {
                console.log('ServiceWorker registro falló:', error);
            });
    });
}

console.log('✨ Script cargado correctamente');
