package com.planta.mantenimiento.ui.theme

import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val IndustrialBlue = Color(0xFF1A3C5E)      // Azul corporativo oscuro
val IndustrialBlueLight = Color(0xFF2D5F8A)
val IndustrialGray = Color(0xFFF5F5F5)
val IndustrialWhite = Color(0xFFFFFFFF)
val IndustrialRed = Color(0xFFD32F2F)       // Solo para alertas
val IndustrialGreen = Color(0xFF388E3C)     // Solo para éxito

private val LightColorScheme = lightColorScheme(
    primary = IndustrialBlue,
    onPrimary = IndustrialWhite,
    primaryContainer = IndustrialBlueLight,
    secondary = IndustrialGray,
    background = IndustrialGray,
    surface = IndustrialWhite,
    error = IndustrialRed,
    onBackground = Color(0xFF1C1B1F),
    onSurface = Color(0xFF1C1B1F),
)

@Composable
fun MantenimientoTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = LightColorScheme,
        typography = Typography(),
        content = content
    )
}