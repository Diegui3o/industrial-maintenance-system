package com.planta.mantenimiento.ui.screens.home

import androidx.compose.foundation.layout.*
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.planta.mantenimiento.ui.theme.AppColors

@Composable
fun ConnectionCard(
    isConnected: Boolean?,
    isLoading: Boolean,
    onCheck: () -> Unit
) {
    val icon: String
    val title: String
    val subtitle: String
    val cardColor: androidx.compose.ui.graphics.Color

    when (isConnected) {
        true -> {
            icon = "✓"
            title = "Conectado"
            subtitle = "Servidor activo"
            cardColor = AppColors.Success.copy(alpha = 0.1f)
        }
        false -> {
            icon = "✕"
            title = "Desconectado"
            subtitle = "Sin conexión al servidor"
            cardColor = AppColors.Error.copy(alpha = 0.1f)
        }
        null -> {
            icon = "○"
            title = "Verificando..."
            subtitle = "Comprobando estado"
            cardColor = AppColors.TextSecondary.copy(alpha = 0.1f)
        }
    }

    Card(
        onClick = onCheck,
        enabled = !isLoading,
        modifier = Modifier
            .fillMaxWidth()
            .height(80.dp),
        colors = CardDefaults.cardColors(containerColor = cardColor),
        shape = MaterialTheme.shapes.large
    ) {
        Row(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 20.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            if (isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(28.dp),
                    color = AppColors.NexaOrange,
                    strokeWidth = 2.dp
                )
            } else {
                Text(
                    text = icon,
                    style = MaterialTheme.typography.headlineSmall
                )
            }

            Spacer(modifier = Modifier.width(16.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = androidx.compose.ui.text.font.FontWeight.SemiBold,
                    color = AppColors.TextPrimary
                )
                Text(
                    text = if (isLoading) "Verificando..." else subtitle,
                    style = MaterialTheme.typography.bodySmall,
                    color = AppColors.TextSecondary
                )
            }

            if (!isLoading) {
                Text(
                    text = "↻",
                    style = MaterialTheme.typography.titleMedium,
                    color = AppColors.NexaOrange
                )
            }
        }
    }
}