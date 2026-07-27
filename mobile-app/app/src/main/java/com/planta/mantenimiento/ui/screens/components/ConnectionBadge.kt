package com.planta.mantenimiento.ui.components

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.planta.mantenimiento.ui.screens.home.HomeState

@Composable
fun ConnectionBadge(state: HomeState) {
    Surface(
        shape = MaterialTheme.shapes.small,
        color = state.statusColor.copy(alpha = 0.12f),
        modifier = Modifier.padding(end = 16.dp)
    ) {
        Text(
            text = state.statusText,
            color = state.statusColor,
            style = MaterialTheme.typography.labelMedium,
            fontWeight = androidx.compose.ui.text.font.FontWeight.Medium,
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
        )
    }
}