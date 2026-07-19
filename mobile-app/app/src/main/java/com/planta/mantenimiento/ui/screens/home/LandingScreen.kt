package com.planta.mantenimiento.ui.screens.home

import androidx.activity.compose.BackHandler
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.scale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.planta.mantenimiento.ui.theme.AppColors
import kotlinx.coroutines.delay

@Composable
fun LandingScreen(onEnter: () -> Unit) {
    var showExitDialog by remember { mutableStateOf(false) }
    var backPressedOnce by remember { mutableStateOf(false) }

    // 🔒 Doble confirmación para salir de la app
    BackHandler(enabled = true) {
        if (backPressedOnce) {
            // Segunda vez: salir de la app
            showExitDialog = true
        } else {
            // Primera vez: mostrar mensaje
            backPressedOnce = true
            // Resetear después de 2 segundos
        }
    }

    // Resetear el flag después de 2 segundos
    LaunchedEffect(backPressedOnce) {
        if (backPressedOnce) {
            delay(2000)
            backPressedOnce = false
        }
    }

    // Snackbar para "Presiona atrás de nuevo para salir"
    val snackbarHostState = remember { SnackbarHostState() }
    LaunchedEffect(backPressedOnce) {
        if (backPressedOnce) {
            snackbarHostState.showSnackbar(
                message = "Presiona atrás de nuevo para salir",
                duration = SnackbarDuration.Short
            )
        }
    }

    // Diálogo de confirmación para salir
    if (showExitDialog) {
        AlertDialog(
            onDismissRequest = { showExitDialog = false },
            title = { Text("Salir de NEXA") },
            text = { Text("¿Realmente deseas salir de la aplicación?") },
            confirmButton = {
                TextButton(
                    onClick = {
                        // Cerrar la app
                        android.os.Process.killProcess(android.os.Process.myPid())
                    }
                ) {
                    Text("Salir", color = AppColors.Error)
                }
            },
            dismissButton = {
                TextButton(onClick = { showExitDialog = false }) {
                    Text("Cancelar")
                }
            }
        )
    }

    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val scale by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = 1.05f,
        animationSpec = infiniteRepeatable(
            animation = tween(2000, easing = EaseInOutSine),
            repeatMode = RepeatMode.Reverse
        ),
        label = "scale"
    )

    val alphaAnim = remember { Animatable(0f) }
    LaunchedEffect(Unit) {
        alphaAnim.animateTo(1f, animationSpec = tween(1000))
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .clickable(
                indication = null,
                interactionSource = remember { MutableInteractionSource() }
            ) { onEnter() },
        contentAlignment = Alignment.Center
    ) {
        // Snackbar host para el mensaje
        SnackbarHost(
            hostState = snackbarHostState,
            modifier = Modifier.align(Alignment.BottomCenter)
        )

        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.alpha(alphaAnim.value)
        ) {
            Box(
                modifier = Modifier.scale(scale),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = "NEXA",
                        style = MaterialTheme.typography.displayLarge,
                        fontWeight = FontWeight.Black,
                        color = AppColors.NexaOrange,
                        fontSize = 72.sp
                    )
                    Text(
                        text = "RESOURCES",
                        style = MaterialTheme.typography.titleMedium,
                        color = AppColors.TextSecondary,
                        letterSpacing = 8.sp,
                        fontWeight = FontWeight.Light
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            HorizontalDivider(
                color = AppColors.NexaOrange.copy(alpha = 0.5f),
                thickness = 1.dp,
                modifier = Modifier.width(120.dp)
            )

            Spacer(modifier = Modifier.height(24.dp))

            Text(
                text = "INDUSTRIAL MAINTENANCE SYSTEM",
                style = MaterialTheme.typography.labelLarge,
                color = AppColors.TextSecondary.copy(alpha = 0.8f),
                letterSpacing = 3.sp
            )

            Spacer(modifier = Modifier.height(64.dp))

            Text(
                text = "Toca para continuar",
                style = MaterialTheme.typography.bodyMedium,
                color = AppColors.TextSecondary.copy(alpha = 0.5f),
                letterSpacing = 1.sp
            )

            val dotAlpha by infiniteTransition.animateFloat(
                initialValue = 0.3f,
                targetValue = 1f,
                animationSpec = infiniteRepeatable(
                    animation = tween(1000),
                    repeatMode = RepeatMode.Reverse
                ),
                label = "dot"
            )

            Spacer(modifier = Modifier.height(12.dp))

            Box(
                modifier = Modifier
                    .size(8.dp)
                    .alpha(dotAlpha)
                    .background(
                        color = AppColors.NexaOrange,
                        shape = MaterialTheme.shapes.small
                    )
            )
        }
    }
}