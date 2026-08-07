package com.planta.mantenimiento.ui.screens.home

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.planta.mantenimiento.ui.theme.AppColors

private data class PanelButton(
    val icon: String,
    val title: String,
    val subtitle: String,
    val onClick: () -> Unit,
    val isPrimary: Boolean = false
)

@Composable
fun DashboardGrid(
    onCheckConnection: () -> Unit,
    onNavigateToEquipos: () -> Unit,
    onNavigateToMantenimientos: () -> Unit,
    onNavigateToSettings: () -> Unit,
    onConnectVpn: () -> Unit,
    isLoading: Boolean,
    isConnected: Boolean?
) {
    Column(
        modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        ConnectionCard(
            isConnected = isConnected,
            isLoading = isLoading,
            onCheck = onCheckConnection
        )

        // Fila 1: Equipos + Mantenimientos
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            DashboardTile("📋", "Equipos", "Inventario", onNavigateToEquipos, Modifier.weight(1f))
            DashboardTile("🔧", "Mantenimientos", "Reportes", onNavigateToMantenimientos, Modifier.weight(1f))
        }

        // Fila 2: Estadísticas + Alarmas
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            DashboardTile("📊", "Estadísticas", "Gráficos", { }, Modifier.weight(1f))
            DashboardTile("🔔", "Alarmas", "Notificaciones", { }, Modifier.weight(1f))
        }

        // Fila 3: VPN (ancho completo)
        Button(
            onClick = onConnectVpn,
            modifier = Modifier.fillMaxWidth().height(80.dp),
            colors = ButtonDefaults.buttonColors(containerColor = AppColors.NexaOrange),
            shape = MaterialTheme.shapes.large
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text("🔐", style = MaterialTheme.typography.headlineMedium)
                Text("Conectar VPN", fontWeight = FontWeight.SemiBold)
            }
        }

        // Fila 4: Configuración
        SettingsTile(onClick = onNavigateToSettings)

        Spacer(modifier = Modifier.height(16.dp))
    }
}

@Composable
private fun DashboardTile(
    icon: String,
    title: String,
    subtitle: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        onClick = onClick,
        modifier = modifier.aspectRatio(1f),
        colors = CardDefaults.cardColors(containerColor = AppColors.ButtonSecondary.copy(alpha = 0.5f)),
        shape = MaterialTheme.shapes.large,
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.fillMaxSize().padding(16.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(text = icon, style = MaterialTheme.typography.headlineMedium)
            Spacer(modifier = Modifier.height(8.dp))
            Text(text = title, style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.SemiBold, color = AppColors.TextPrimary)
            Text(text = subtitle, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
        }
    }
}

@Composable
private fun SettingsTile(onClick: () -> Unit) {
    OutlinedCard(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth().height(56.dp),
        colors = CardDefaults.outlinedCardColors(containerColor = Color.Transparent),
        border = CardDefaults.outlinedCardBorder().copy(
            brush = androidx.compose.ui.graphics.SolidColor(AppColors.TextSecondary.copy(alpha = 0.5f))
        ),
        shape = MaterialTheme.shapes.large
    ) {
        Row(
            modifier = Modifier.fillMaxSize().padding(horizontal = 20.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(text = "⚙️", style = MaterialTheme.typography.titleMedium)
            Spacer(modifier = Modifier.width(16.dp))
            Text(text = "Configuración", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Medium, color = AppColors.TextPrimary, modifier = Modifier.weight(1f))
            Text(text = "→", color = AppColors.TextSecondary, style = MaterialTheme.typography.titleMedium)
        }
    }
}