package com.nammamela.app.ui.fan

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.nammamela.app.data.models.Applause
import com.nammamela.app.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FanWallScreen(
    applause: List<Applause>,
    onSend: (String) -> Unit,
    onClap: (Applause) -> Unit
) {
    var comment by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(TheatricalBlack)
            .padding(16.dp)
    ) {
        Text(
            text = "THE FAN WALL",
            color = TheatricalGold,
            fontSize = 40.sp,
            fontWeight = FontWeight.Black,
            letterSpacing = (-2).sp
        )
        Text(
            text = "REAL-TIME APPLAUSE FROM THE GALLERY",
            color = TheatricalGold.copy(alpha = 0.5f),
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 2.sp
        )

        Spacer(modifier = Modifier.height(24.dp))

        // Input Area
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(16.dp))
                .background(Color.White.copy(alpha = 0.05f))
                .border(1.dp, TheatricalGold.copy(alpha = 0.2f), RoundedCornerShape(16.dp))
                .padding(8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            TextField(
                value = comment,
                onValueChange = { comment = it },
                placeholder = { Text("Leave a message for the troupe...", color = Color.Gray, fontStyle = FontStyle.Italic) },
                modifier = Modifier.weight(1f),
                colors = TextFieldDefaults.colors(
                    focusedContainerColor = Color.Transparent,
                    unfocusedContainerColor = Color.Transparent,
                    focusedIndicatorColor = Color.Transparent,
                    unfocusedIndicatorColor = Color.Transparent,
                    cursorColor = TheatricalGold,
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White
                )
            )
            IconButton(
                onClick = {
                    if (comment.isNotBlank()) {
                        onSend(comment)
                        comment = ""
                    }
                },
                enabled = comment.isNotBlank()
            ) {
                Icon(Icons.Default.Send, contentDescription = "Send", tint = TheatricalGold)
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Feed
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            contentPadding = PaddingValues(bottom = 32.dp)
        ) {
            items(applause) { item ->
                ApplauseCard(item, onClap)
            }
        }
    }
}

@Composable
fun ApplauseCard(item: Applause, onClap: (Applause) -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.05f)),
        shape = RoundedCornerShape(16.dp),
        border = BorderStroke(1.dp, Color.White.copy(alpha = 0.1f))
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(32.dp)
                        .clip(CircleShape)
                        .background(TheatricalGold.copy(alpha = 0.2f))
                        .border(1.dp, TheatricalGold.copy(alpha = 0.4f), CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = item.userName.take(1).uppercase(),
                        color = TheatricalGold,
                        fontWeight = FontWeight.Black,
                        fontSize = 12.sp
                    )
                }
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(
                        text = item.userName,
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp
                    )
                    Text(
                        text = "JUST NOW", // Simplified for demo
                        color = Color.Gray,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Medium
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            Text(
                text = "\"${item.comment}\"",
                color = TheatricalIvory.copy(alpha = 0.9f),
                fontSize = 18.sp,
                fontStyle = FontStyle.Italic,
                fontFamily = androidx.compose.ui.text.font.FontFamily.Serif,
                modifier = Modifier.padding(start = 44.dp)
            )

            Spacer(modifier = Modifier.height(16.dp))

            Row(
                modifier = Modifier.padding(start = 44.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    onClick = { onClap(item) },
                    color = TheatricalGold.copy(alpha = 0.1f),
                    shape = RoundedCornerShape(100.dp),
                    border = BorderStroke(1.dp, TheatricalGold.copy(alpha = 0.3f))
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(text = "❤️", fontSize = 12.sp)
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = item.claps.toString(),
                            color = TheatricalGold,
                            fontWeight = FontWeight.Black,
                            fontSize = 12.sp
                        )
                    }
                }
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    text = "HEARTS",
                    color = Color.Gray,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Black,
                    letterSpacing = 1.sp
                )
            }
        }
    }
}
