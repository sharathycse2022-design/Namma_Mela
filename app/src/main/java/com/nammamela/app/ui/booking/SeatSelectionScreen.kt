package com.nammamela.app.ui.booking

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nammamela.app.ui.theme.*

@Composable
fun SeatSelectionScreen(playName: String) {
    var selectedSeats by remember { mutableStateOf(setOf<String>()) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(TheatricalBlack)
            .padding(16.dp)
    ) {
        Text(
            text = "SELECT SEATS",
            color = TheatricalGold,
            fontSize = 12.sp,
            fontWeight = FontWeight.Black,
            letterSpacing = 2.sp
        )
        Text(
            text = playName,
            color = Color.White,
            fontSize = 32.sp,
            fontWeight = FontWeight.Bold
        )
        
        Spacer(modifier = Modifier.height(32.dp))
        
        // The Stage
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(8.dp)
                .background(TheatricalGold, RoundedCornerShape(topStart = 100.dp, topEnd = 100.dp))
        )
        Text(
            text = "STAGE",
            color = TheatricalGold,
            fontSize = 10.sp,
            modifier = Modifier.align(Alignment.CenterHorizontally).padding(top = 4.dp)
        )

        Spacer(modifier = Modifier.height(48.dp))

        // Seat Grid
        LazyVerticalGrid(
            columns = GridCells.Fixed(8),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier.weight(1f)
        ) {
            items(64) { index ->
                val seatId = "${(index / 8) + 65}${(index % 8) + 1}"
                val isSelected = selectedSeats.contains(seatId)
                
                Box(
                    modifier = Modifier
                        .aspectRatio(1f)
                        .clip(RoundedCornerShape(4.dp))
                        .background(if (isSelected) TheatricalGold else Color.White.copy(alpha = 0.1f))
                        .clickable {
                            selectedSeats = if (isSelected) {
                                selectedSeats - seatId
                            } else {
                                selectedSeats + seatId
                            }
                        }
                )
            }
        }
    }
}
