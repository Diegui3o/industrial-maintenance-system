package com.planta.mantenimiento.ui.screens.home

import android.app.Activity
import android.net.VpnService
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.planta.mantenimiento.MantenimientoApp
import com.planta.mantenimiento.data.local.PreferencesManager
import com.planta.mantenimiento.ui.components.ConnectionBadge
import com.planta.mantenimiento.ui.components.ErrorCard
import com.planta.mantenimiento.ui.theme.AppColors
import kotlinx.coroutines.launch
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    navController: NavController,
    prefs: PreferencesManager,
    onBackToLanding: () -> Unit,
    onConnectVpn: () -> Unit = {}
) {
    var state by remember { mutableStateOf(HomeState()) }
    val scope = rememberCoroutineScope()
    val context = LocalContext.current

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
                .padding(horizontal = 24.dp)
                .verticalScroll(rememberScrollState()),
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
                        state = state.copy(isLoading = true)
                        val result = checkServerConnection(prefs)
                        state = state.copy(
                            isConnected = result.first,
                            isLoading = false,
                            errorMessage = result.second
                        )
                    }
                },
                onNavigateToEquipos = { navController.navigate("equipos") },
                onNavigateToMantenimientos = { navController.navigate("mantenimientos") },
                onNavigateToSettings = { navController.navigate("settings") },
                onConnectVpn = {
                    val config = """
[Interface]
PrivateKey = kJmGftLQ4w7a5ueBdJtc6qVnWjEr6oXpBFqIWAYmUX0=
Address = 10.0.0.2/24
DNS = 1.1.1.1

[Peer]
PublicKey = Vt4ozefu38AA/FWrYof0UwhYkJ4t7vCD7Ms2YOvUDFk=
PresharedKey = ZTltaIwoTH+ye5tHvPn4i1ZAk3JoLAT9fqDzfLZF5Mg=
AllowedIPs = 10.30.0.0/16,10.188.0.0/16
Endpoint = 192.168.18.14:51820
                    """.trimIndent()

                    val app = context.applicationContext as MantenimientoApp
                    val intent = VpnService.prepare(context)

                    if (intent != null) {
                        (context as Activity).startActivityForResult(intent, 100)
                    } else {
                        app.startVpn(config)
                    }
                },
                isLoading = state.isLoading,
                isConnected = state.isConnected
            )
        }
    }
}