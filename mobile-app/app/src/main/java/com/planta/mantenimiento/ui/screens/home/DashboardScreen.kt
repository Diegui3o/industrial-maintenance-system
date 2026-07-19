package com.planta.mantenimiento.ui.screens.home

import androidx.activity.compose.BackHandler
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.planta.mantenimiento.data.local.PreferencesManager
import com.planta.mantenimiento.ui.components.ConnectionBadge
import com.planta.mantenimiento.ui.components.ErrorCard
import com.planta.mantenimiento.ui.theme.AppColors
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    navController: NavController,
    prefs: PreferencesManager,
    onBackToLanding: () -> Unit
) {
    var state by remember { mutableStateOf(HomeState()) }
    val scope = rememberCoroutineScope()

    // 🔙 Atrás en Dashboard = volver a Landing
    BackHandler(enabled = true) {
        onBackToLanding()
    }

    LaunchedEffect(Unit) {
        state = state.copy(isLoading = true)
        val result = checkServerConnection(prefs)
        state = HomeState(
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
                        state = HomeState(
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