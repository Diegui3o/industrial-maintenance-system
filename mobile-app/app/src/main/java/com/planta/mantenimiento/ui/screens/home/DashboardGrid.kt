package com.planta.mantenimiento.ui.screens.home

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.planta.mantenimiento.ui.theme.AppColors

// ═══════════════════════════════════════════════════════════════
//  MODELO DE BOTÓN DEL PANEL
// ═══════════════════════════════════════════════════════════════

private data class PanelButton(
    val icon: String,
    val title: String,
    val subtitle: String,
    val onClick: () -> Unit,
    val isPrimary: Boolean = false
)

// ═══════════════════════════════════════════════════════════════
//  GRID RESPONSIVO DEL DASHBOARD
// ═══════════════════════════════════════════════════════════════

@Composable
fun DashboardGrid(
    onCheckConnection: () -> Unit,
    onNavigateToEquipos: () -> Unit,
    onNavigateToMantenimientos: () -> Unit,
    onNavigateToSettings: () -> Unit,
    isLoading: Boolean,
    isConnected: Boolean?
) {
    // Lista de botones - fácil de extender agregando más items
    val buttons = listOf(
        PanelButton("📋", "Equipos", "Inventario", onNavigateToEquipos),
        PanelButton("🔧", "Mantenimientos", "Reportes", onNavigateToMantenimientos),
        PanelButton("📊", "Estadísticas", "Gráficos", { /* TODO */ }),
        PanelButton("🔔", "Alarmas", "Notificaciones", { /* TODO */ }),
    )

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Tarjeta de conexión (siempre arriba, ancho completo)
        ConnectionCard(
            isConnected = isConnected,
            isLoading = isLoading,
            onCheck = onCheckConnection
        )

        // Grid de botones - 2 columnas, adaptativo
        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            modifier = Modifier
                .fillMaxWidth()
                .heightIn(max = 400.dp), // Limitar altura para scroll si hay muchos
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
            userScrollEnabled = false
        ) {
            items(buttons) { button ->
                DashboardTile(
                    icon = button.icon,
                    title = button.title,
                    subtitle = button.subtitle,
                    onClick = button.onClick
                )
            }
        }

        // Botón de configuración (siempre abajo, ancho completo)
        SettingsTile(onClick = onNavigateToSettings)
    }
}

// ═══════════════════════════════════════════════════════════════
//  TILE DE BOTÓN DEL PANEL
// ═══════════════════════════════════════════════════════════════

@Composable
private fun DashboardTile(
    icon: String,
    title: String,
    subtitle: String,
    onClick: () -> Unit
) {
    Card(
        onClick = onClick,
        modifier = Modifier
            .fillMaxWidth()
            .aspectRatio(1f), // Cuadrado perfecto
        colors = CardDefaults.cardColors(
            containerColor = AppColors.ButtonSecondary.copy(alpha = 0.5f)
        ),
        shape = MaterialTheme.shapes.large,
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = icon,
                style = MaterialTheme.typography.headlineMedium
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = title,
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.SemiBold,
                color = AppColors.TextPrimary,
                maxLines = 1
            )
            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodySmall,
                color = AppColors.TextSecondary,
                maxLines = 1
            )
        }
    }
}

// ═══════════════════════════════════════════════════════════════
//  TILE DE CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════════

@Composable
private fun SettingsTile(onClick: () -> Unit) {
    OutlinedCard(
        onClick = onClick,
        modifier = Modifier
            .fillMaxWidth()
            .height(56.dp),
        colors = CardDefaults.outlinedCardColors(
            containerColor = Color.Transparent
        ),
        border = CardDefaults.outlinedCardBorder().copy(
            brush = androidx.compose.ui.graphics.SolidColor(AppColors.TextSecondary.copy(alpha = 0.5f))
        ),
        shape = MaterialTheme.shapes.large
    ) {
        Row(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 20.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "⚙️",
                style = MaterialTheme.typography.titleMedium
            )
            Spacer(modifier = Modifier.width(16.dp))
            Text(
                text = "Configuración",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Medium,
                color = AppColors.TextPrimary,
                modifier = Modifier.weight(1f)
            )
            Text(
                text = "→",
                color = AppColors.TextSecondary,
                style = MaterialTheme.typography.titleMedium
            )
        }
    }
}