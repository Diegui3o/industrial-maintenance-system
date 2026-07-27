package com.planta.mantenimiento.ui.theme

import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// 🎨 Colores base
val OrangePrimary = Color(0xFFFF6F00)
val White = Color(0xFFFFFFFF)
val LightGray = Color(0xFFF5F5F5)
val SoftGray = Color(0xFFE0E0E0)

val SuccessGreen = Color(0xFF44AF48)
val ErrorRed = Color(0xFFC62828)

val TextPrimaryColor = Color(0xFF212121)
val TextSecondaryColor = Color(0xFF757575)

// 🔥 Objeto central de colores
object AppColors {

    val NexaOrange = OrangePrimary
    val NexaWhite = White

    val BackgroundGradientTop = White
    val BackgroundGradientMid = LightGray
    val BackgroundGradientBottom = SoftGray

    val TextPrimary = TextPrimaryColor
    val TextSecondary = TextSecondaryColor

    val Success = SuccessGreen
    val Error = ErrorRed

    val Card = White
    val ButtonSecondary = LightGray

    // ✅ LOS QUE TE FALTABAN
    val IndustrialGreen = SuccessGreen
    val IndustrialRed = ErrorRed
}

@Composable
fun MantenimientoTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = lightColorScheme(),
        typography = Typography(),
        content = content
    )
}