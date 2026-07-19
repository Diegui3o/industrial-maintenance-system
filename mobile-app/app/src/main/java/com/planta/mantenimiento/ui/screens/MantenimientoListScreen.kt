package com.planta.mantenimiento.ui.screens

import androidx.activity.compose.BackHandler
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.planta.mantenimiento.ui.theme.AppColors
import com.planta.mantenimiento.ui.viewmodel.MantenimientoViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MantenimientoListScreen(
    navController: NavController,
    viewModel: MantenimientoViewModel = viewModel()
) {
    val mantenimientos by viewModel.mantenimientos.collectAsState(initial = emptyList())
    val syncMsg by viewModel.syncStatus.collectAsState()

    val backgroundBrush = Brush.verticalGradient(
        colors = listOf(
            AppColors.BackgroundGradientTop,
            AppColors.BackgroundGradientMid,
            AppColors.BackgroundGradientBottom
        )
    )

    // 🔙 Atrás en Mantenimientos = volver al Dashboard
    BackHandler(enabled = true) {
        navController.navigate("home") {
            popUpTo("home") { inclusive = false }
            launchSingleTop = true
        }
    }

    Scaffold(
        containerColor = Color.Transparent,
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Reportes de Mantenimiento",
                        color = AppColors.TextPrimary,
                        fontWeight = FontWeight.Bold
                    )
                },
                navigationIcon = {
                    IconButton(onClick = {
                        navController.navigate("home") {
                            popUpTo("home") { inclusive = false }
                            launchSingleTop = true
                        }
                    }) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Volver al panel",
                            tint = AppColors.NexaOrange
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.Transparent
                )
            )
        },
        floatingActionButton = {
            Column(horizontalAlignment = Alignment.End) {
                // FAB Sincronizar
                SmallFloatingActionButton(
                    onClick = { viewModel.sincronizar() },
                    containerColor = AppColors.ButtonSecondary,
                    contentColor = AppColors.TextPrimary
                ) {
                    Text("🔄")
                }

                Spacer(modifier = Modifier.height(8.dp))

                // FAB Agregar
                FloatingActionButton(
                    onClick = { navController.navigate("mantenimiento/crear") },
                    containerColor = AppColors.NexaOrange,
                    contentColor = Color.White,
                    shape = MaterialTheme.shapes.large
                ) {
                    Icon(
                        imageVector = Icons.Filled.Add,
                        contentDescription = "Nuevo reporte"
                    )
                }
            }
        }
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(backgroundBrush)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 16.dp)
            ) {
                // Mensaje de sync
                AnimatedVisibility(
                    visible = syncMsg != null,
                    enter = expandVertically() + fadeIn(),
                    exit = shrinkVertically() + fadeOut()
                ) {
                    syncMsg?.let { msg ->
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 8.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = AppColors.Success.copy(alpha = 0.1f)
                            ),
                            shape = MaterialTheme.shapes.small
                        ) {
                            Text(
                                text = msg,
                                color = AppColors.Success,
                                style = MaterialTheme.typography.bodyMedium,
                                fontWeight = FontWeight.Medium,
                                modifier = Modifier.padding(12.dp)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Contador
                Text(
                    text = "${mantenimientos.size} reporte${if (mantenimientos.size != 1) "s" else ""} registrado${if (mantenimientos.size != 1) "s" else ""}",
                    style = MaterialTheme.typography.bodyMedium,
                    color = AppColors.TextSecondary,
                    modifier = Modifier.padding(bottom = 12.dp)
                )

                // Lista
                if (mantenimientos.isEmpty()) {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(
                                text = "📋",
                                style = MaterialTheme.typography.displayLarge
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "Sin reportes",
                                style = MaterialTheme.typography.titleMedium,
                                color = AppColors.TextSecondary
                            )
                            Text(
                                text = "Toca + para crear uno",
                                style = MaterialTheme.typography.bodySmall,
                                color = AppColors.TextSecondary.copy(alpha = 0.7f)
                            )
                        }
                    }
                } else {
                    LazyColumn(
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(mantenimientos) { m ->
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                colors = CardDefaults.cardColors(
                                    containerColor = Color.White.copy(alpha = 0.9f)
                                ),
                                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                                shape = MaterialTheme.shapes.medium
                            ) {
                                Column(modifier = Modifier.padding(16.dp)) {
                                    // Header: Equipo + Tipo
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(
                                            text = "Equipo #${m.equipoId}",
                                            style = MaterialTheme.typography.titleMedium,
                                            fontWeight = FontWeight.SemiBold,
                                            color = AppColors.TextPrimary,
                                            modifier = Modifier.weight(1f)
                                        )

                                        // Badge de sync
                                        val syncColor = if (m.syncStatus == "SYNCED")
                                            AppColors.Success else AppColors.TextSecondary
                                        val syncIcon = if (m.syncStatus == "SYNCED") "✅" else "⏳"

                                        Surface(
                                            shape = MaterialTheme.shapes.small,
                                            color = syncColor.copy(alpha = 0.12f)
                                        ) {
                                            Text(
                                                text = "$syncIcon ${m.syncStatus}",
                                                color = syncColor,
                                                style = MaterialTheme.typography.labelSmall,
                                                fontWeight = FontWeight.Medium,
                                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                            )
                                        }
                                    }

                                    Spacer(modifier = Modifier.height(4.dp))

                                    // Tipo de intervención
                                    Text(
                                        text = m.tipoIntervencion,
                                        style = MaterialTheme.typography.bodyMedium,
                                        color = AppColors.NexaOrange,
                                        fontWeight = FontWeight.Medium
                                    )

                                    Spacer(modifier = Modifier.height(8.dp))

                                    HorizontalDivider(
                                        color = AppColors.TextSecondary.copy(alpha = 0.1f),
                                        thickness = 1.dp
                                    )

                                    Spacer(modifier = Modifier.height(8.dp))

                                    // Info en fila
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        InfoChip("📅", m.fechaReporte.take(10))
                                        InfoChip("🏭", m.taller)
                                        InfoChip("⏱️", "${m.horas}h")
                                    }

                                    // Estado de falla si existe
                                    if (m.estadoFalla.isNotBlank()) {
                                        Spacer(modifier = Modifier.height(8.dp))
                                        Text(
                                            text = "Estado: ${m.estadoFalla}",
                                            style = MaterialTheme.typography.bodySmall,
                                            color = AppColors.TextSecondary
                                        )
                                    }
                                }
                            }
                        }

                        // Espacio al final para que no tape el FAB
                        item { Spacer(modifier = Modifier.height(80.dp)) }
                    }
                }
            }
        }
    }
}

@Composable
private fun InfoChip(icon: String, text: String) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Text(
            text = icon,
            style = MaterialTheme.typography.bodySmall
        )
        Spacer(modifier = Modifier.width(2.dp))
        Text(
            text = text,
            style = MaterialTheme.typography.bodySmall,
            color = AppColors.TextSecondary
        )
    }
}