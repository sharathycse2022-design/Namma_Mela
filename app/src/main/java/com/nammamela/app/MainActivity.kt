package com.nammamela.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BookOnline
import androidx.compose.material.icons.filled.Event
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.nammamela.app.ui.screens.BookingSuccessScreen
import com.nammamela.app.ui.screens.DetailScreen
import com.nammamela.app.ui.screens.HomeScreen
import com.nammamela.app.ui.theme.NammaMelaTheme
import com.nammamela.app.ui.theme.TheatricalGold
import com.nammamela.app.viewmodel.EventViewModel
import androidx.compose.ui.tooling.preview.Preview

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            NammaMelaTheme {
                MainAppContainer()
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainAppContainer() {
    val navController = rememberNavController()
    val viewModel: EventViewModel = viewModel()
    val events by viewModel.events.collectAsState()
    
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    Scaffold(
        topBar = {
            if (currentRoute == "home") {
                CenterAlignedTopAppBar(
                    title = {
                        Column(horizontalAlignment = androidx.compose.ui.Alignment.CenterHorizontally) {
                            Text("ನಮ್ಮ ಮೇಳ", fontWeight = FontWeight.Bold, fontSize = 24.sp, color = TheatricalGold)
                            Text("Namma Mela - Digital Stage", fontSize = 10.sp, color = Color.White.copy(alpha = 0.6f))
                        }
                    },
                    colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
                        containerColor = MaterialTheme.colorScheme.background
                    )
                )
            }
        },
        bottomBar = {
            if (currentRoute == "home") {
                NavigationBar(
                    containerColor = MaterialTheme.colorScheme.surface,
                    contentColor = TheatricalGold
                ) {
                    NavigationBarItem(
                        selected = true,
                        onClick = { },
                        icon = { Icon(Icons.Default.Home, contentDescription = null) },
                        label = { Text("Home") },
                        colors = NavigationBarItemDefaults.colors(selectedIconColor = TheatricalGold, selectedTextColor = TheatricalGold, indicatorColor = TheatricalGold.copy(alpha = 0.1f))
                    )
                    NavigationBarItem(
                        selected = false,
                        onClick = { },
                        icon = { Icon(Icons.Default.Event, contentDescription = null) },
                        label = { Text("Events") }
                    )
                    NavigationBarItem(
                        selected = false,
                        onClick = { },
                        icon = { Icon(Icons.Default.BookOnline, contentDescription = null) },
                        label = { Text("Bookings") }
                    )
                    NavigationBarItem(
                        selected = false,
                        onClick = { },
                        icon = { Icon(Icons.Default.Person, contentDescription = null) },
                        label = { Text("Profile") }
                    )
                }
            }
        },
        containerColor = MaterialTheme.colorScheme.background
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = "home",
            modifier = Modifier.padding(innerPadding)
        ) {
            composable("home") {
                HomeScreen(
                    events = events,
                    onEventClick = { event ->
                        navController.navigate("detail/${event.id}")
                    }
                )
            }
            composable(
                route = "detail/{eventId}",
                arguments = listOf(navArgument("eventId") { type = NavType.IntType })
            ) { backStackEntry ->
                val eventId = backStackEntry.arguments?.getInt("eventId") ?: 1
                val event = viewModel.getEventById(eventId)
                if (event != null) {
                    DetailScreen(
                        event = event,
                        onBackClick = { navController.popBackStack() },
                        onBookClick = { navController.navigate("success") }
                    )
                }
            }
            composable("success") {
                BookingSuccessScreen(
                    onDoneClick = {
                        navController.navigate("home") {
                            popUpTo("home") { inclusive = true }
                        }
                    }
                )
            }
        }
    }
}

@Preview
@Composable
fun AppPreview() {
    NammaMelaTheme {
        MainAppContainer()
    }
}
