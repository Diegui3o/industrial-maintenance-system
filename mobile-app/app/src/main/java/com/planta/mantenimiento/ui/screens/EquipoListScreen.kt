package com.planta.mantenimiento.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.planta.mantenimiento.ui.theme.AppColors
import com.planta.mantenimiento.ui.viewmodel.EquipoViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EquipoListScreen(viewModel: EquipoViewModel = viewModel()) {

    val equipos by viewModel.equipos.collectAsState(initial = emptyList())

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Equipos") }
            )
        }
    ) { padding ->

        if (equipos.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
                contentAlignment = Alignment.Center
            ) {
                Text("Sin equipos")
            }
        } else {

            LazyColumn(
                modifier = Modifier
                    .padding(padding)
                    .padding(12.dp)
            ) {

                items(equipos) { equipo ->

                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 6.dp)
                    ) {

                        Column(modifier = Modifier.padding(12.dp)) {

                            Row(verticalAlignment = Alignment.CenterVertically) {

                                Column(modifier = Modifier.weight(1f)) {

                                    Text(
                                        text = equipo.codigo,
                                        style = MaterialTheme.typography.titleMedium
                                    )

                                    Text(
                                        text = equipo.nombre,
                                        style = MaterialTheme.typography.bodySmall
                                    )
                                }

                                Surface(
                                    color = when (equipo.estadoEquipo) {
                                        "activo" -> AppColors.IndustrialGreen.copy(alpha = 0.15f)
                                        "fallo" -> AppColors.IndustrialRed.copy(alpha = 0.15f)
                                        else -> MaterialTheme.colorScheme.surfaceVariant
                                    }
                                ) {
                                    Text(
                                        text = equipo.estadoEquipo.uppercase(),
                                        modifier = Modifier.padding(6.dp),
                                        color = when (equipo.estadoEquipo) {
                                            "activo" -> AppColors.IndustrialGreen
                                            "fallo" -> AppColors.IndustrialRed
                                            else -> MaterialTheme.colorScheme.onSurfaceVariant
                                        }
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(4.dp))

                            Text("${equipo.area} | ${equipo.tipo}")
                        }
                    }
                }
            }
        }
    }
}