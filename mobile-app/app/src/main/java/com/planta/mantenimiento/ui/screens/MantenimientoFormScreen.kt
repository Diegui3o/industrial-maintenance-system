package com.planta.mantenimiento.ui.screens

import android.os.Build
import androidx.activity.compose.BackHandler
import androidx.annotation.RequiresApi
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.planta.mantenimiento.model.Mantenimiento
import com.planta.mantenimiento.ui.theme.AppColors
import com.planta.mantenimiento.ui.viewmodel.MantenimientoViewModel
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

@RequiresApi(Build.VERSION_CODES.O)
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MantenimientoFormScreen(
    navController: NavController,
    viewModel: MantenimientoViewModel = viewModel()
) {
    var equipoId by remember { mutableStateOf("") }
    var fase by remember { mutableStateOf("FASE II") }
    var taller by remember { mutableStateOf("MECANICO") }
    var tipoCriticidad by remember { mutableStateOf("TOP TEN") }
    var sistema by remember { mutableStateOf("") }
    var tipoIntervencion by remember { mutableStateOf("MPV") }
    var modoFalla by remember { mutableStateOf("") }
    var consecuencia by remember { mutableStateOf("") }
    var descripcion by remember { mutableStateOf("") }
    var standBy by remember { mutableStateOf(false) }
    var prodAfectada by remember { mutableStateOf(false) }
    var horas by remember { mutableStateOf("") }

    val backgroundBrush = Brush.verticalGradient(
        colors = listOf(
            AppColors.BackgroundGradientTop,
            AppColors.BackgroundGradientMid,
            AppColors.BackgroundGradientBottom
        )
    )

    // 🔙 Atrás en Formulario = volver a Mantenimientos
    BackHandler(enabled = true) {
        navController.navigate("mantenimientos") {
            popUpTo("mantenimientos") { inclusive = false }
            launchSingleTop = true
        }
    }

    Scaffold(
        containerColor = Color.Transparent,
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Nuevo Reporte",
                        color = AppColors.TextPrimary,
                        fontWeight = FontWeight.Bold
                    )
                },
                navigationIcon = {
                    IconButton(onClick = {
                        navController.navigate("mantenimientos") {
                            popUpTo("mantenimientos") { inclusive = false }
                            launchSingleTop = true
                        }
                    }) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Volver",
                            tint = AppColors.NexaOrange
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.Transparent
                )
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(backgroundBrush)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Sección: Identificación
            SectionTitle("Identificación del Equipo")

            OutlinedTextField(
                value = equipoId,
                onValueChange = { equipoId = it },
                label = { Text("ID Equipo") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )

            // Sección: Ubicación
            SectionTitle("Ubicación y Clasificación")

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                OutlinedTextField(
                    value = fase,
                    onValueChange = { fase = it },
                    label = { Text("Fase") },
                    modifier = Modifier.weight(1f),
                    singleLine = true
                )
                OutlinedTextField(
                    value = taller,
                    onValueChange = { taller = it },
                    label = { Text("Taller") },
                    modifier = Modifier.weight(1f),
                    singleLine = true
                )
            }

            OutlinedTextField(
                value = tipoCriticidad,
                onValueChange = { tipoCriticidad = it },
                label = { Text("Tipo Criticidad") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )

            OutlinedTextField(
                value = sistema,
                onValueChange = { sistema = it },
                label = { Text("Sistema") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )

            // Sección: Intervención
            SectionTitle("Detalles de la Intervención")

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                OutlinedTextField(
                    value = tipoIntervencion,
                    onValueChange = { tipoIntervencion = it },
                    label = { Text("Tipo Intervención") },
                    modifier = Modifier.weight(1f),
                    singleLine = true
                )
                OutlinedTextField(
                    value = horas,
                    onValueChange = { horas = it },
                    label = { Text("Horas") },
                    modifier = Modifier.weight(1f),
                    singleLine = true
                )
            }

            OutlinedTextField(
                value = modoFalla,
                onValueChange = { modoFalla = it },
                label = { Text("Modo de Falla") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true
            )

            OutlinedTextField(
                value = consecuencia,
                onValueChange = { consecuencia = it },
                label = { Text("Consecuencia Inmediata") },
                modifier = Modifier.fillMaxWidth(),
                minLines = 2
            )

            OutlinedTextField(
                value = descripcion,
                onValueChange = { descripcion = it },
                label = { Text("Descripción del Evento") },
                modifier = Modifier.fillMaxWidth(),
                minLines = 3
            )

            // Sección: Estado
            SectionTitle("Estado del Sistema")

            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = AppColors.ButtonSecondary.copy(alpha = 0.3f)
                )
            ) {
                Column(modifier = Modifier.padding(12.dp)) {
                    Row(verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
                        Checkbox(
                            checked = standBy,
                            onCheckedChange = { standBy = it },
                            colors = CheckboxDefaults.colors(
                                checkedColor = AppColors.NexaOrange
                            )
                        )
                        Text(
                            text = "Stand By",
                            color = AppColors.TextPrimary,
                            style = MaterialTheme.typography.bodyMedium
                        )
                    }

                    Row(verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
                        Checkbox(
                            checked = prodAfectada,
                            onCheckedChange = { prodAfectada = it },
                            colors = CheckboxDefaults.colors(
                                checkedColor = AppColors.NexaOrange
                            )
                        )
                        Text(
                            text = "Producción Afectada",
                            color = AppColors.TextPrimary,
                            style = MaterialTheme.typography.bodyMedium
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Botón Guardar
            Button(
                onClick = {
                    val m = Mantenimiento(
                        equipoId = equipoId.toIntOrNull() ?: 0,
                        fechaReporte = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME),
                        fase = fase,
                        taller = taller,
                        tipoCriticidad = tipoCriticidad,
                        sistema = sistema,
                        tipoIntervencion = tipoIntervencion,
                        modoFalla = modoFalla,
                        consecuenciaInmediata = consecuencia,
                        descripcionEvento = descripcion,
                        standBy = standBy,
                        produccionAfectada = prodAfectada,
                        horas = horas.toDoubleOrNull() ?: 0.0
                    )
                    viewModel.crear(m)
                    navController.popBackStack()
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = AppColors.Success
                ),
                shape = MaterialTheme.shapes.medium
            ) {
                Text(
                    text = "💾 Guardar Reporte",
                    fontWeight = FontWeight.SemiBold,
                    style = MaterialTheme.typography.bodyLarge
                )
            }

            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}

@Composable
private fun SectionTitle(text: String) {
    Text(
        text = text,
        style = MaterialTheme.typography.titleSmall,
        fontWeight = FontWeight.SemiBold,
        color = AppColors.NexaOrange,
        modifier = Modifier.padding(top = 8.dp, bottom = 4.dp)
    )
}