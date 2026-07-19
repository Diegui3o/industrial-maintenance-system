package com.planta.mantenimiento.ui.screens

import androidx.compose.animation.*
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.planta.mantenimiento.data.local.PreferencesManager
import com.planta.mantenimiento.ui.theme.AppColors
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.net.HttpURLConnection
import java.net.URL

// ═══════════════════════════════════════════════════════════════
//  ESTADO
// ═══════════════════════════════════════════════════════════════

private data class AppState(
    val isConnected: Boolean? = null,
    val isLoading: Boolean = false,
    val errorMessage: String = ""
) {
    val showError: Boolean get() = errorMessage.isNotEmpty()
    val statusText: String get() = when (isConnected) {
        true -> "Conectado"
        false -> "Offline"
        null -> "..."
    }
    val statusColor: Color get() = when (isConnected) {
        true -> AppColors.Success
        false -> AppColors.Error
        null -> AppColors.TextSecondary
    }
}

// ═══════════════════════════════════════════════════════════════
//  SCREEN PRINCIPAL
// ═══════════════════════════════════════════════════════════════

@Composable
fun HomeScreen(
    navController: NavController,
    prefs: PreferencesManager
) {
    var showLanding by remember { mutableStateOf(true) }

    val backgroundBrush = Brush.verticalGradient(
        colors = listOf(
            AppColors.BackgroundGradientTop,
            AppColors.BackgroundGradientMid,
            AppColors.BackgroundGradientBottom
        )
    )

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(backgroundBrush)
    ) {
        AnimatedContent(
            targetState = showLanding,
            transitionSpec = {
                fadeIn(animationSpec = tween(600)) togetherWith
                        fadeOut(animationSpec = tween(400))
            },
            label = "screen_transition"
        ) { isLanding ->
            if (isLanding) {
                LandingScreen(onEnter = { showLanding = false })
            } else {
                DashboardScreen(
                    navController = navController,
                    prefs = prefs,
                    onBackToLanding = { showLanding = true }
                )
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════
//  1. PANTALLA DE INICIO / LANDING
// ═══════════════════════════════════════════════════════════════

@Composable
private fun LandingScreen(onEnter: () -> Unit) {
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

// ═══════════════════════════════════════════════════════════════
//  2. PANEL PRINCIPAL / DASHBOARD
// ═══════════════════════════════════════════════════════════════

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun DashboardScreen(
    navController: NavController,
    prefs: PreferencesManager,
    onBackToLanding: () -> Unit
) {
    var state by remember { mutableStateOf(AppState()) }
    val scope = rememberCoroutineScope()

    LaunchedEffect(Unit) {
        state = state.copy(isLoading = true)
        val result = checkServerConnection(prefs)
        state = AppState(
            isConnected = result.first,
            isLoading = false,
            errorMessage = result.second
        )
    }

    Scaffold(
        containerColor = Color.Transparent,
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = "NEXA",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold,
                            color = AppColors.NexaOrange
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "RESOURCES",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                },
                actions = {
                    ConnectionBadge(state = state)
                },
                navigationIcon = {
                    TextButton(
                        onClick = onBackToLanding,
                        modifier = Modifier.padding(start = 4.dp)
                    ) {
                        Text(
                            text = "←",
                            color = AppColors.NexaOrange,
                            style = MaterialTheme.typography.titleLarge
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
                .padding(horizontal = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "Panel de Control",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                color = AppColors.TextPrimary
            )

            Text(
                text = "Gestión de equipos, alarmas y reportes",
                style = MaterialTheme.typography.bodyMedium,
                color = AppColors.TextSecondary,
                modifier = Modifier.padding(top = 4.dp, bottom = 8.dp)
            )

            HorizontalDivider(
                color = AppColors.NexaOrange.copy(alpha = 0.3f),
                thickness = 1.dp,
                modifier = Modifier
                    .fillMaxWidth(0.4f)
                    .padding(vertical = 16.dp)
            )

            AnimatedVisibility(
                visible = state.showError,
                enter = fadeIn() + expandVertically(),
                exit = fadeOut() + shrinkVertically()
            ) {
                Column {
                    ErrorCard(message = state.errorMessage)
                    Spacer(modifier = Modifier.height(16.dp))
                }
            }

            DashboardGrid(
                onCheckConnection = {
                    scope.launch {
                        state = state.copy(isLoading = true, errorMessage = "")
                        val result = checkServerConnection(prefs)
                        state = AppState(
                            isConnected = result.first,
                            isLoading = false,
                            errorMessage = result.second
                        )
                    }
                },
                onNavigateToEquipos = { navController.navigate("equipos") },
                onNavigateToMantenimientos = { navController.navigate("mantenimientos") },
                onNavigateToSettings = { navController.navigate("settings") },
                isLoading = state.isLoading,
                isConnected = state.isConnected
            )
        }
    }
}

// ═══════════════════════════════════════════════════════════════
//  GRID DE OPCIONES
// ═══════════════════════════════════════════════════════════════

@Composable
private fun DashboardGrid(
    onCheckConnection: () -> Unit,
    onNavigateToEquipos: () -> Unit,
    onNavigateToMantenimientos: () -> Unit,
    onNavigateToSettings: () -> Unit,
    isLoading: Boolean,
    isConnected: Boolean?
) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        ConnectionCard(
            isConnected = isConnected,
            isLoading = isLoading,
            onCheck = onCheckConnection
        )

        Spacer(modifier = Modifier.height(8.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            DashboardTile(
                icon = "📋",
                title = "Equipos",
                subtitle = "Inventario",
                modifier = Modifier.weight(1f),
                onClick = onNavigateToEquipos
            )
            DashboardTile(
                icon = "🔧",
                title = "Mantenimientos",
                subtitle = "Reportes",
                modifier = Modifier.weight(1f),
                onClick = onNavigateToMantenimientos
            )
        }

        Spacer(modifier = Modifier.height(8.dp))

        SettingsTile(onClick = onNavigateToSettings)
    }
}

@Composable
private fun ConnectionCard(
    isConnected: Boolean?,
    isLoading: Boolean,
    onCheck: () -> Unit
) {
    val icon: String
    val title: String
    val subtitle: String
    val cardColor: Color

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
                    fontWeight = FontWeight.SemiBold,
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

@Composable
private fun DashboardTile(
    icon: String,
    title: String,
    subtitle: String,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Card(
        onClick = onClick,
        modifier = modifier.height(120.dp),
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
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                text = icon,
                style = MaterialTheme.typography.headlineMedium
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
                color = AppColors.TextPrimary
            )
            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodySmall,
                color = AppColors.TextSecondary
            )
        }
    }
}

@Composable
private fun SettingsTile(onClick: () -> Unit) {
    OutlinedCard(
        onClick = onClick,
        modifier = Modifier
            .fillMaxWidth()
            .height(64.dp),
        colors = CardDefaults.outlinedCardColors(
            containerColor = Color.Transparent
        ),
        border = CardDefaults.outlinedCardBorder().copy(
            brush = androidx.compose.ui.graphics.SolidColor(AppColors.NexaOrange.copy(alpha = 0.5f))
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
                style = MaterialTheme.typography.titleLarge
            )
            Spacer(modifier = Modifier.width(16.dp))
            Text(
                text = "Configuración",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Medium,
                color = AppColors.NexaOrange,
                modifier = Modifier.weight(1f)
            )
            Text(
                text = "→",
                color = AppColors.NexaOrange,
                style = MaterialTheme.typography.titleMedium
            )
        }
    }
}

// ═══════════════════════════════════════════════════════════════
//  COMPONENTES COMPARTIDOS
// ═══════════════════════════════════════════════════════════════

@Composable
private fun ConnectionBadge(state: AppState) {
    Surface(
        shape = MaterialTheme.shapes.small,
        color = state.statusColor.copy(alpha = 0.12f),
        modifier = Modifier.padding(end = 16.dp)
    ) {
        Text(
            text = state.statusText,
            color = state.statusColor,
            style = MaterialTheme.typography.labelMedium,
            fontWeight = FontWeight.Medium,
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
        )
    }
}

@Composable
private fun ErrorCard(message: String) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = AppColors.Error.copy(alpha = 0.08f)
        ),
        shape = MaterialTheme.shapes.medium
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "⚠️",
                style = MaterialTheme.typography.titleMedium
            )
            Spacer(modifier = Modifier.width(12.dp))
            Text(
                text = message,
                color = AppColors.Error,
                style = MaterialTheme.typography.bodyMedium
            )
        }
    }
}

// ═══════════════════════════════════════════════════════════════
//  FUNCIÓN DE RED
// ═══════════════════════════════════════════════════════════════

private suspend fun checkServerConnection(
    prefs: PreferencesManager
): Pair<Boolean, String> {
    return try {
        val urlStr = prefs.backendUrl + "api/equipos"

        val isOk = withContext(Dispatchers.IO) {
            val conn = URL(urlStr).openConnection() as HttpURLConnection
            conn.apply {
                connectTimeout = 5000
                readTimeout = 5000
                requestMethod = "GET"
                doInput = true
            }
            conn.responseCode == 200
        }

        Pair(isOk, if (isOk) "" else "No se pudo conectar con el servidor")

    } catch (e: Exception) {
        Pair(false, "Error de red: ${e.localizedMessage ?: "Desconocido"}")
    }
}